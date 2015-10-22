import classNames from 'classnames'
import { isValidElement, cloneElement, Children, PropTypes } from 'react'


const ignoredFunctionStatics =
  Object.getOwnPropertyNames(function(){}).concat(['displayName', 'propTypes'])


function hoistFunctionStatics(source, target) {
  Object
    .getOwnPropertyNames(source)
    .forEach(key => {
      if(ignoredFunctionStatics.indexOf(key) < 0) {
        target[key] = source[key]
      }
    })
  return target
}


export function prefixedClassNames(prefix, ...args) {
  return (
    classNames(...args)
      .split(/\s+/)
      .filter(name => name !== "")
      .map(name => `${prefix}-${name}`)
      .join(' ')
  )
}


export function transformWithPrefix(prefix) {
  const childTransform = element => transform(element)

  function transform(element, rootClass, suffixClasses='') {
    if (typeof element !== 'object') return element

    const changes = {}

    if (element.props.className) {
      changes.className = `${rootClass || ''} ${prefixedClassNames(prefix, element.props.className)} ${suffixClasses}`
    }
    else if (rootClass) {
      changes.className = `${rootClass} ${suffixClasses}`
    }

    if (typeof element.props.children === 'object') {
      const children = Children.toArray(element.props.children)
      const transformedChildren = children.map(childTransform)

      if (transformedChildren.some((transformed, i) => transformed != children[i])) {
        changes.children = transformedChildren
      }
    }
    
    if (typeof element.type === 'function') {
      for (let [key, value] of Object.entries(element.props)) {
        if (key == 'children') continue
        if (isValidElement(value)) {
          const transformed = childTransform(value)
          if (transformed !== value) {
            changes[key] = transformed
          }
        }
      }
    }

    return (
      Object.keys(changes).length === 0
      ? element
      : cloneElement(element, changes, changes.children || element.props.children)
    )
  }

  return transform
}


export function withPackageName(packageName) {
  return {
    transformer(componentFunction) {
      const componentName = componentFunction.displayName || componentFunction.name
      const prefix = `${packageName}-${componentName}`
      const transform = transformWithPrefix(prefix)

      const transformedComponent = (props, ...args) =>
        transform(componentFunction(props, ...args), prefix, props.className)

      transformedComponent.displayName = `pacomo(${componentName})`

      // Add `className` propType, if none exists
      transformedComponent.propTypes = { className: PropTypes.string, ...componentFunction.propTypes }

      return hoistFunctionStatics(componentFunction, transformedComponent)
    },


    decorator(componentClass) {
      const componentName = componentClass.displayName || componentClass.name
      const prefix = `${packageName}-${componentName}`
      const transform = transformWithPrefix(prefix)

      return class DecoratedComponent extends componentClass {
        static displayName = `pacomo(${componentName})`

        // Add `className` propType, if none exists
        static propTypes = { className: PropTypes.string, ...componentClass.propTypes }

        render() {
          return transform(super.render(), prefix, this.props.className)
        }
      }
    },
  }
}
