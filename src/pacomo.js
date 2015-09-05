import classNames from 'classnames'
import invariant from 'invariant'
import {PropTypes, cloneElement} from 'react'


export default function createDecorator(prefix) {
  return function decorator(component) {
    const componentName = component.displayName || component.name

    invariant(
      !component.prototype.pacomo,
      "pacomo must be applied to a class with no `pacomo` property"
    )

    return class extends component {
      static displayName = componentName

      // Add `className` propType, if none exists
      static propTypes =
        Object.assign(
          {className: PropTypes.string},
          component.propTypes
        )

      pacomo(...args) {
        return (
          classNames(...args)
            .split(/\s+/)
            .filter(name => name !== "")
            .map(name => `${prefix}-${componentName}-${name}`)
            .join(' ')
        )
      }

      render() {
        const result = super.render()
        return cloneElement(
          result,
          {className: `${prefix}-${componentName} ${result.props.className || ''} ${this.props.className || ''}`}
        )
      }
    }
  }
}
