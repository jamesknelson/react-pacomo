# react-pacomo

React-pacomo transforms your component `className` props by prefixing them with a [pacomo](http://unicornstandard.com/packages/pacomo.html), or `packageName-ComponentName-` namespace. As a result, **your component's CSS will be effectively locally scoped** -- just like with [CSS Modules](https://github.com/css-modules/css-modules), but *without requiring a build step*. React-pacomo also takes care of other common tasks like selecting classes and handling `props.className`.

React-pacomo's **output is predicatable**. This means that when you *do* want to override component CSS, you *can*. This makes it more suited for public libraries than inline style or CSS Modules.

## Installation

```
npm install react-pacomo --save
```

## What react-pacomo does

Say you've got a `NavItem` component which renders some JSX:

```jsx
class NavItem extends Component {
  render() {
    return <a
      href="/contacts"
      className={`NavItem ${this.props.active ? 'active' : ''}`}
    >
      <Icon className='icon' type={this.props.type} />
      <span className='label'>{this.props.label}</span>
    </a>
  }
}
```

While this works, it *won't* work if you ever import a library which defines *other* styles for `.icon`, `.NavItem`, etc. -- which is why you need to namespace your classes.

If your app is called `unicorn`, your namespaced component will look something like this:

```jsx
class NavItem extends Component {
  render() {
    return <a
      href="/contacts"
      className={`unicorn-NavItem ${this.props.active ? 'unicorn-NavItem-active' : ''}`}
    >
      <Icon className='unicorn-NavItem-icon' type={this.props.type} />
      <span className='unicorn-NavItem-label'>{this.props.label}</span>
    </a>
  }
}
```

But while your styles are now safe from interference, repeatedly typing long strings isn't fun. So let's apply react-pacomo's [higher order component](http://jamesknelson.com/structuring-react-applications-higher-order-components/). By using `pacomoDecorator`, the following component will emit *exactly* the same HTML and `className` props as the above snippet:

```jsx
@pacomoDecorator
class NavItem extends Component {
  render() {
    return <a
      href="/contacts"
      className={{active: this.props.active}}
    >
      <Icon className='icon' type={this.props.type} />
      <span className='label'>{this.props.label}</span>
    </a>
  }
}
```

And just like that, you'll never have to manually write namespaces again!

## Adding react-pacomo to your project

There are two methods for applying automatic namespacing to your components; a `decorator` function for component *classes*, and a `transformer` function used with stateless *function* components.

Neither of these methods are directly accessible. Instead, react-pacomo exports a `withPackageName` function which returns an object with `decorator` and `transformer` functions scoped to your package:

```javascript
import { withPackageName } from 'react-pacomo'
const { decorator, transformer } = withPackageName('unicorn')
```

### `decorator(ComponentClass)`

This function will return a new component which automatically namespaces `className` props within the wrapped class's `render` method.

Use it as a wrapper function, or as an ES7 decorator:

```javascript
// As an ES7 decorator
@decorator
class MyComponent extends React.Component {
  ...
}

// As a wrapper function
var MyComponent = decorator(React.createClass({
  ...
}))
```

### `transformer(ComponentFunction)`

This function will return a new stateless component function which automatically namespaces `className` props within the wrapped stateless component function.

```javascript
const MyComponent = props => { ... }

const WrappedComponent = transformer(MyComponent)
```

## Transformation Details

**react-pacomo** works by applying a transformation to the `ReactElement` which your component renders. The rules involved are simple:

### Your root element receives the namespace itself as a class

The pacomo guidelines specify that your component's root element *must* have a CSS class following the format `packageName-ComponentName`.

For example:

```jsx
let Wrapper = props => <div {...props}>{props.children}</div>
Wrapper = transformer(Wrapper)
```

Rendering `<Wrapper />` will automatically apply an `app-Wrapper` CSS class to the rendered `<div>`.

### `className` is run through the classnames package, then namespaced

This means that you use [classnames](https://www.npmjs.com/package/classnames) objects within your `className` props!

For example:

```jsx
@decorator
class NavItem extends Component {
  render() {
    return <a
      href={this.props.href}
      className={{active: this.props.active}}
    >
  }
}
```

If `this.props.active` is true, your element will receive the class `app-NavItem-active`. If it is false, it won't.

### If your component's `props` contain a `className`, it is appended as-is

Since any `className` you to add your returned `ReactElement` will be automatically namespaced, you can't manually handle `props.className`. Instead, **react-pacomo** will automatically append it to your root element's `className`.

For example, if we used the NavItem component from above within a SideNav component, we could still pass a `className` to it:

```jsx
@decorator
class SideNav extends Component {
  render() {
    return <div>
      <NavItem className='contacts' href='/contacts' active={true}>
        Contacts
      </NavItem>
      <NavItem className='projects' href='/projects'>
        Projects
      </NavItem>
    </div>
  }
}
```

The resulting HTML will look like this:

```html
<div class='app-SideNav'>
  <a className='app-NavItem app-NavItem-active app-SideNav-contacts' href='/contacts'>
    Contacts
  </a>
  <a className='app-NavItem app-SideNav-projects' href='/projects'>
    Projects
  </a>
</div>
```

### Child elements are recursively transformed

The upshot of this is that you can still use `className` on children. But keep in mind that huge component trees will take time to transform - whether you they need transforming or not.

While it is good practice to keep your components small and to the point *anyway*, it is especially important if you're using react-pacomo.

### Elements found in props of custom components are recursively transformed

Not all elements you create will be appear under another element's children. For example, take this snippet:

```jsx
<OneOrTwoColumnLayout
  left={<DocumentList className='contact-list' {...props} />}
  right={children}
/>
```

If we only scanned our rendered element's `children`, we'd miss the `className` on the `<DocumentList>` which we passed to `left`.

To take care of this, react-pacomo will also recursively transform elements on the `props` of custom React components. However, it will *not* look within arrays or objects.

## Tips

### You only need to call `withPackageName` once

As you'll likely be using the `decorator` or `transformer` functions across most of your components, you can make your life easier by exporting them from a file in your `utils` directory.

For an example, see `utils/pacomo.js` in the [unicorn-standard-boilerplate](http://unicornstandard.com/packages/boilerplate.html) project:

```javascript
import { withPackageName } from 'react-pacomo'

export const {
  decorator: pacomoDecorator,
  transformer: pacomoTransformer,
} = withPackageName('app')
```

While `decorator` and `transformer` are easily understood in the context of an object returned by `withPackageName`, you'll probably want to rename them for your exports. My convention is to call them `pacomoDecorator` and `pacomoTransformer`.

### Define `displayName` on your components

While **react-pacomo** *can* detect component names from their component's function or class `name` property, most minifiers mangle these names by default. This can cause inconsistent behavior between your development and production builds.

The solution to this is to *make sure you specify a `displayName` property on your components*. Your `displayName` is given priority over your function or class `name`, and it is good practice to define it *anyway*.

But if you *insist* that setting `displayName` is too much effort, make sure to tell your minifier to keep your function names intact. The method varies wildly based on your build system, but on the odd chance you're using `UglifyJsPlugin` with Wepback, the required configuration will look something like this:

```javascript
new webpack.optimize.UglifyJsPlugin({
  compressor: {screw_ie8: true, keep_fnames: true, warnings: false},
  mangle: {screw_ie8: true, keep_fnames: true}
})
```

### Use the LESS/SCSS parent selector (`&`)

While **react-pacomo** will prevent repetition in your *JavaScript*, it can't do anything about your *CSS*.

Luckily, since you're probably already using LESS or SCSS, the solution is simple: begin your selectors with `&-`.

In practice, this looks something like this:

```less
.app-Paper {
  //...

  &-rounded {
    //...
  }

  &-inner {
    //...
  }

  &-rounded &-inner {
    //...
  }
}
```

### Following the Pacomo CSS Guidelines

Namespacing your classes is the first step to taming your CSS, but it isn't the only one. The Pacomo System provides a number of other [guidelines](http://unicornstandard.com/packages/pacomo.html). Read them and use them.

## Comparisons with other solutions

### CSS Moudles

Like react-pacomo, [CSS Modules](https://github.com/css-modules/css-modules)** automatically namespace your CSS classes. However, instead of runtime prefixing with React, it relies on your build system to do the prefixing.

Use CSS Modules instead when performance counts, you don't mind being a little more verbose, and you're *not* writing a library (where being able to monkey patch is important).

#### Pros

- No runtime transformation (and thus possibly faster)
- CSS class names can be minified (meaning less data over the wire)
- Does not require a `displayName` when minifed

#### Cons

- Depends on a build system
- Does not handle `props.className` automatically
- Does not append a root class automatically
- DOes not handle [classnames](npmjs.com/package/classnames) objects
- You don't know your class names ahead of time, meaning no monkey-patching

### Inline Style

Inline Style takes a completely different approach, assigning your styles directly to the element's `style` property instead of using CSS.

While this *may* be useful when sharing code between react-native and react-dom, [it has a number of drawbacks](http://jamesknelson.com/why-you-shouldnt-style-with-javascript/). Unless you're writing an exclusively native app, I recommend using react-pacomo or CSS Modules for your web app styles instead.

#### Pros

- Styles can be re-used with react-native apps
- Styles can be processed with JavaScript

#### Cons

- **Cannot re-use existing CSS code or tooling**
- Inline Style has the highest priority, preventing monkey patching
- Media queries and pseudo selectors are complicated or impossible

## FAQ

### Isn't this just BEM?

No.

BEM goes further than react-pacomo by distinguishing between *modifiers* and *elements*.

For a BEM-based project, use something like [react-bem](https://github.com/cuzzo/react-bem).

### Why should I use react-pacomo over BEM-based modules like react-bem?

Given most React components are very small and have limited scope, BEM is probably overkill. If you find your components are getting big enough that you think it might make sense to distinguish between elements and modifiers (like BEM), you probably should instead focus on re-factoring your app into smaller components.

## Related Projects

- [unicorn-standard-boilerplate](http://unicornstandard.com/packages/boilerplate.html) is a great example of how to use pacomo, as well as a number of other technologies from the Unicorn Standard project.
- [The Pacomo Specification](http://unicornstandard.com/packages/pacomo.html) contains the guidelines which this project follows.
