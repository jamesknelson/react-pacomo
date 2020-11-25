import 'babel-polyfill'
import {prefixedClassNames, withPackageName, transformWithPrefix} from './lib/pacomo'
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import TestUtils from 'react-addons-test-utils'
import assert from 'assert'


const testTransform = transformWithPrefix('test')
const { transformer, decorator } = withPackageName('prefix')


/*
 * Util
 */

function shallowRenderElement(element) {
 const shallowRenderer = TestUtils.createRenderer()
  shallowRenderer.render(element)
  return shallowRenderer.getRenderOutput()
}

function shallowRenderComponent(Component, props) {
  return shallowRenderElement(<Component {...props} />)
}


/*
 * Fixtures
 */

class FullComponent extends Component {
  render() {
    return <div className={{active: this.props.active}} />
  }
}
FullComponent.propTypes = {
  className: PropTypes.string.isRequired,
  active: PropTypes.bool,
}
FullComponent.defaultProps = {
  className: "defaultClassName",
  active: true,
}


class BareComponent extends Component {
  render() {
    return <div />
  }
}


class ContainerComponent extends Component {
  render() {
    return <div>{this.props.children}</div>
  }
}


function FullStatelessComponent(props) {
  return <div className={{active: props.active}} />
}
FullStatelessComponent.propTypes = {
  className: PropTypes.string.isRequired,
  active: PropTypes.bool,
}
FullStatelessComponent.defaultProps = {
  className: "defaultClassName",
  active: true,
}


function BareStatelessComponent(props) {
  return <div />
}


function ContainerStatelessComponent({children}) {
  return <div>{children}</div>
}


function nestedElement({active}) {
  return (
    <nav className='nav' untransformed={<div className="untransformed" />}>
      <ContainerStatelessComponent
        className={{link1: true, active: active == 'link1'}}
        focusable={<a className="Link" />}
        untransformed={[
          <div className="untransformed" />,
          <div className="untransformed" />,
        ]}
      >
        <span>Test</span>
        Test
      </ContainerStatelessComponent>
      <ContainerStatelessComponent
        className={{link2: true, active: active == 'link2'}}
        focusable={<a className="Link" />}
      >
        <span>Test</span>
        Test
      </ContainerStatelessComponent>
    </nav>
  )
}


/*
 * Tests
 */


describe('decorator', () => {
  it("should pass through propTypes from the original class", () => {
    const decoratedClass = decorator(FullComponent)

    assert.equal(
      decoratedClass.propTypes.className,
      PropTypes.string.isRequired,
      "className propType from origina class are passed through"
    )

    assert.equal(
      decoratedClass.propTypes.active,
      PropTypes.bool,
      "other propTypes from original class is passed through"
    )
  })

  it("should add a className propType if one doesn't already exist", () => {
    const decoratedClass = decorator(BareComponent)

    assert.equal(
      decoratedClass.propTypes.className,
      PropTypes.string,
      "className propType exists"
    )
  })
})


describe('transformer', () => {
  it("should pass through propTypes from the original function", () => {
    const transformedFunction = transformer(FullStatelessComponent)

    assert.equal(
      transformedFunction.propTypes.className,
      PropTypes.string.isRequired,
      "className propType from origina class are passed through"
    )

    assert.equal(
      transformedFunction.propTypes.active,
      PropTypes.bool,
      "other propTypes from original class is passed through"
    )
  })

  it("should add a className propType if one doesn't already exist", () => {
    const transformedFunction = transformer(BareStatelessComponent)

    assert.equal(
      transformedFunction.propTypes.className,
      PropTypes.string,
      "className propType exists"
    )
  })
})


describe('#render', () => {
  it("respects the values of passed in `props`", () => {
    const rendered = shallowRenderComponent(
      decorator(FullComponent),
      {className: 'passedIn', active: false}
    )

    assert.equal(
      rendered.props.className,
      'prefix-FullComponent  passedIn'
    )
  })

  it("repects the value of the original class's `defaultProps`", () => {
    const rendered = shallowRenderComponent(decorator(FullComponent))

    assert.equal(
      rendered.props.className,
      'prefix-FullComponent prefix-FullComponent-active defaultClassName'
    )
  })

  it("works correctly when `super.render` does not return a `className`", () => {
    const rendered = shallowRenderComponent(decorator(BareComponent))

    assert.equal(
      rendered.props.className,
      'prefix-BareComponent'
    )
  })

  it("adds `__pacomoSkip` to the any `children`", () => {
    const rendered = shallowRenderComponent(
      decorator(ContainerComponent),
      { children: <div className='icon' /> }
    )

    assert.equal(
      rendered.props.children[0].props.__pacomoSkip,
      true
    )
  })
})


describe('stateless render', () => {
  it("respects the values of passed in `props`", () => {
    const rendered = shallowRenderComponent(
      transformer(FullStatelessComponent),
      {className: 'passedIn', active: false}
    )

    assert.equal(
      rendered.props.className,
      'prefix-FullStatelessComponent  passedIn'
    )
  })

  it("repects the value of the original class's `defaultProps`", () => {
    const rendered = shallowRenderComponent(transformer(FullStatelessComponent))

    assert.equal(
      rendered.props.className,
      'prefix-FullStatelessComponent prefix-FullStatelessComponent-active defaultClassName'
    )
  })

  it("works correctly when `super.render` does not return a `className`", () => {
    const rendered = shallowRenderComponent(transformer(BareStatelessComponent))

    assert.equal(
      rendered.props.className,
      'prefix-BareStatelessComponent'
    )
  })

  it("adds `__pacomoSkip` to the any `children`", () => {
    const rendered = shallowRenderComponent(
      transformer(ContainerStatelessComponent),
      { children: <div className='icon' /> }
    )

    assert.equal(
      rendered.props.children[0].props.__pacomoSkip,
      true
    )
  })
})


describe('prefixedClassNames', () => {
  it("accepts an object, producing the correct result", () => {
    assert.equal(
      prefixedClassNames('test-prefix', {
        active: true,
        inactive: false,
      }),
      'test-prefix-active',
      "`classNames` produces the correct string when an object is passed in"
    )
  })

  it("accepts a string, producing the correct result", () => {
    assert.equal(
      prefixedClassNames('test-prefix', 'test1', 'test2'),
      'test-prefix-test1 test-prefix-test2',
      "`classNames` produces the correct string when a string is passed in"
    )
  })
})


describe('transformWithPrefix', () => {
  it("does not transform elements with the __pacomoSkip prop", () => {
    const originalElement = <div className="test" __pacomoSkip />
    const transformedElement = testTransform(originalElement)

    assert.equal(
      originalElement,
      transformedElement
    )
  })

  it("transforms the passed in element", () => {
    const transformed = testTransform(nestedElement({active: 'link1'}))

    assert.equal(
      transformed.props.className,
      'test-nav'
    )
  })

  it("transforms passed in child elements", () => {
    const transformed = testTransform(nestedElement({active: 'link1'}))

    assert.equal(
      transformed.props.children[0].props.className,
      'test-link1 test-active'
    )
    assert.equal(
      transformed.props.children[1].props.className,
      'test-link2'
    )
  })

  it("transforms element props on custom components", () => {
    const transformed = testTransform(nestedElement({active: 'link1'}))

    assert.equal(
      transformed.props.children[0].props.focusable.props.className,
      'test-Link'
    )
  })

  it("does not transform elements with nothing to transform", () => {
    const originalElement = nestedElement({active: 'link1'})
    const transformedElement = testTransform(originalElement)

    assert.equal(
      transformedElement.props.children[0].props.children[0],
      originalElement.props.children[0].props.children[0]
    )
    assert.equal(
      transformedElement.props.children[0].props.children[0].className,
      originalElement.props.children[0].props.children[0].className
    )
  })

  it("does not transform arrays of element props on custom components", () => {
    const originalElement = nestedElement({active: 'link1'})
    const transformedElement = testTransform(originalElement)

    assert.equal(
      transformedElement.props.untransformed,
      originalElement.props.untransformed
    )
  })

  it("does not transform element props on DOM elements", () => {
    const originalElement = nestedElement({active: 'link1'})
    const transformedElement = testTransform(originalElement)

    assert.equal(
      transformedElement.props.children[0].props.untransformed,
      originalElement.props.children[0].props.untransformed
    )
  })
})
