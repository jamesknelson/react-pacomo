import classNames from 'classnames'
import { isValidElement, cloneElement, Children, PropTypes } from 'react'

export class PacomoStrategy {

    constructor(packageName){
        this.packageName = packageName;
    }

    static withPackageName(packageName){
        return new PacomoStrategy(packageName)
    }

    getComponentName(component){
        return component.displayName || component.name;
    }

    getComponentClassName(component){
        const componentName = this.getComponentName(component);
        return  `${this.packageName}-${componentName}`;
    }

    getPropClassName(component, name){
        const prefix = this.getComponentClassName(component);
        return `${prefix}-${name}`;
    }

}

export function prefixedClassNames(strategy, component, ...args) {
  return (
    classNames(...args)
      .split(/\s+/)
      .filter(name => !!name)
      .map(name => strategy.getPropClassName(component, name))
      .join(' ')
  )
}


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


// Applies `fn` to all passed in props which are react elements, with
// *updated* elements being returned as a new `props`-like object.
//
// Optionally, `childrenOnly` can be set to true to ignore non-children
// props. This is useful for DOM elements which are guaranteed to have
// no element children anywhere except `props.children`.
function transformElementProps(props, fn, childrenOnly) {
  const changes = {}

  if (typeof props.children === 'object') {
    const children = Children.toArray(props.children)
    const transformedChildren = children.map(fn)

    if (transformedChildren.some((transformed, i) => transformed != children[i])) {
      changes.children = transformedChildren
    }
  }

  if (!childrenOnly) {
    for (let key of Object.keys(props)) {
      if (key == 'children') continue
      const value = props[key]
      if (isValidElement(value)) {
        const transformed = fn(value)
        if (transformed !== value) {
          changes[key] = transformed
        }
      }
    }
  }

  return changes
}


function cloneElementWithSkip(element) {
  return cloneElement(element, {__pacomoSkip: true})
}


// Add the `__pacomoSkip` prop to any elements in the passed in `props` object
function skipPropElements(props) {
  return Object.assign({}, props, transformElementProps(props, cloneElementWithSkip))
}


export function transformWithPrefix(strategy, componentFunction) {
  const childTransform = element => transform(element)

  // Prefix all `className` props on the passed in ReactElement object, its
  // children, and elements on `props`.
  //
  // Optionally prefix with a `rootClass` and postfix with `suffixClass`.
  function transform(element, rootClass, suffixClasses='') {
    if (typeof element !== 'object' || element.props.__pacomoSkip) return element

    const changes = transformElementProps(
      element.props,
      childTransform,
      typeof element.type !== 'function'
    )

    if (element.props.className) {
      changes.className = `${rootClass || ''} ${prefixedClassNames(strategy, componentFunction, element.props.className)} ${suffixClasses}`
    }
    else if (rootClass) {
      changes.className = `${rootClass} ${suffixClasses}`
    }

    return (
      Object.keys(changes).length === 0
      ? element
      : cloneElement(element, changes, changes.children || element.props.children)
    )
  }

  return transform
}

export function withPackageName(packageName){
    return withStrategy(PacomoStrategy.withPackageName(packageName));
}

export function withStrategy(strategy) {
  return {
    // Transform a stateless function component
    transformer(componentFunction) {
      const componentName = strategy.getComponentName(componentFunction);
      const transform = transformWithPrefix(strategy, componentFunction)

      const transformedComponent = (props, ...args) =>
        transform(
          componentFunction(skipPropElements(props), ...args),
          strategy.getComponentClassName(componentFunction),
          props.className
        )

      transformedComponent.displayName = `pacomo(${componentName})`

      // Add `className` propType, if none exists
      transformedComponent.propTypes = { className: PropTypes.string, ...componentFunction.propTypes }

      return hoistFunctionStatics(componentFunction, transformedComponent)
    },


    // Transform a React.Component class
    decorator(componentClass) {
      const componentName = strategy.getComponentName(componentClass);
      const transform = transformWithPrefix(strategy, componentClass)

      const DecoratedComponent = class DecoratedComponent extends componentClass {
        render() {
          const rawProps = this.props
          this.props = skipPropElements(this.props)
          const transformed = transform(super.render(), strategy.getComponentClassName(componentClass), this.props.className)
          this.props = rawProps
          return transformed
        }
      }

      DecoratedComponent.displayName = `pacomo(${componentName})`

      return DecoratedComponent
    },
  }
}
