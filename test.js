import {createDecorator} from './lib/pacomo'
import {Component, DOM, PropTypes, createElement} from 'react'
import TestUtils from 'react-addons-test-utils'
import assert from 'assert'


/*
 * Util
 */

function renderComponent(component, props) {
  const shallowRenderer = TestUtils.createRenderer()
  shallowRenderer.render(createElement(component, props))
  return shallowRenderer.getRenderOutput()
}


/*
 * Fixtures
 */

class FullFeaturedComponent extends Component {
  render() {
    const className = this.pacomo({active: this.props.active})
    return createElement(DOM.div, {className})
  }
}
FullFeaturedComponent.propTypes = {
  className: PropTypes.string.isRequired,
  active: PropTypes.bool,
}
FullFeaturedComponent.defaultProps = {
  className: "defaultClassName",
  active: true,
}


class BareComponent extends Component {
  render() {
    return createElement(DOM.div)
  }
}


/*
 * Tests
 */


describe('decorator', () => {
  it("should pass through propTypes from the original class", () => {
    const decoratedClass = createDecorator('prefix')(FullFeaturedComponent)

    assert.equal(
      decoratedClass.propTypes.active,
      PropTypes.bool,
      "className propType from original class is passed through"
    )

    assert.equal(
      decoratedClass.propTypes.className,
      PropTypes.string.isRequired,
      "other propTypes from origina class are passed through"
    )
  })

  it("should add a className propType if one doesn't already exist", () => {
    const decoratedClass = createDecorator('prefix')(BareComponent)

    assert.equal(
      decoratedClass.propTypes.className,
      PropTypes.string,
      "className propType exists"
    )
  })

  it ("cannot be applied twice", () => {
    let error

    try {
      const decorator = createDecorator('prefix')
      decorator(decorator(BareComponent))
    }
    catch (ex) {
      error = ex
    }

    assert(
      !!error,
      "an error is thrown when a decorator is applied twice"
    )
  })
})


describe('#pacomo', () => {
  it("accepts an object, producing the correct result", () => {
    const pacomo = createDecorator('prefix')(FullFeaturedComponent).prototype.pacomo
    
    assert.equal(
      pacomo({
        active: true,
        inactive: false,
      }),
      'prefix-FullFeaturedComponent-active',
      "`pacomo` produces the correct string when an object is passed in"
    )
  })

  it("accepts a string, producing the correct result", () => {
    const pacomo = createDecorator('prefix')(BareComponent).prototype.pacomo
    
    assert.equal(
      pacomo('test'),
      'prefix-BareComponent-test',
      "`pacomo` produces the correct string when a string is passed in"
    )
  })
})


describe('#render', () => {
  it("appends passed in `className` to that returned by `super.render` and prefixes the component class name", () => {
    const rendered = renderComponent(
      createDecorator('prefix')(FullFeaturedComponent),
      {className: 'passedIn'}
    )

    assert.equal(
      rendered.props.className,
      'prefix-FullFeaturedComponent prefix-FullFeaturedComponent-active passedIn'
    )
  })

  it("repects the value of the original class's `defaultProps.className`", () => {
    const rendered = renderComponent(createDecorator('prefix')(FullFeaturedComponent))

    assert.equal(
      rendered.props.className,
      'prefix-FullFeaturedComponent prefix-FullFeaturedComponent-active defaultClassName'
    )
  })

  it("works correctly when `super.render` does not return a `className`", () => {
    const rendered = renderComponent(createDecorator('prefix')(BareComponent))

    assert.equal(
      rendered.props.className.trim(),
      'prefix-BareComponent'
    )
  })
})
