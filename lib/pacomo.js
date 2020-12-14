'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.prefixedClassNames = prefixedClassNames;
exports.transformWithPrefix = transformWithPrefix;
exports.withPackageName = withPackageName;

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function prefixedClassNames(prefix) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return _classnames2.default.apply(undefined, args).split(/\s+/).filter(function (name) {
    return name !== "";
  }).map(function (name) {
    return prefix + '-' + name;
  }).join(' ');
}

var ignoredFunctionStatics = Object.getOwnPropertyNames(function () {}).concat(['displayName', 'propTypes', 'name']);

function hoistFunctionStatics(source, target) {
  Object.getOwnPropertyNames(source).forEach(function (key) {
    if (ignoredFunctionStatics.indexOf(key) < 0) {
      target[key] = source[key];
    }
  });
  return target;
}

// Applies `fn` to all passed in props which are react elements, with
// *updated* elements being returned as a new `props`-like object.
//
// Optionally, `childrenOnly` can be set to true to ignore non-children
// props. This is useful for DOM elements which are guaranteed to have
// no element children anywhere except `props.children`.
function transformElementProps(props, fn, childrenOnly) {
  var changes = {};

  if (_typeof(props.children) === 'object') {
    var children = _react.Children.toArray(props.children);
    var transformedChildren = children.map(fn);

    if (transformedChildren.some(function (transformed, i) {
      return transformed != children[i];
    })) {
      changes.children = transformedChildren;
    }
  }

  if (!childrenOnly) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(props)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        if (key == 'children') continue;
        var value = props[key];
        if ((0, _react.isValidElement)(value)) {
          var transformed = fn(value);
          if (transformed !== value) {
            changes[key] = transformed;
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  return changes;
}

function cloneElementWithSkip(element) {
  return (0, _react.cloneElement)(element, { 'data-pacomoskip': true });
}

// Add the `__pacomoSkip` prop to any elements in the passed in `props` object
function skipPropElements(props) {
  return Object.assign({}, props, transformElementProps(props, cloneElementWithSkip));
}

function transformWithPrefix(prefix) {
  var childTransform = function childTransform(element) {
    return transform(element);
  };

  // Prefix all `className` props on the passed in ReactElement object, its
  // children, and elements on `props`.
  //
  // Optionally prefix with a `rootClass` and postfix with `suffixClass`.
  function transform(element, rootClass) {
    var suffixClasses = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) !== 'object' || element.props['data-pacomoskip']) return element;

    var changes = transformElementProps(element.props, childTransform, typeof element.type !== 'function');

    if (element.props.className) {
      changes.className = ((rootClass || '') + ' ' + prefixedClassNames(prefix, element.props.className) + ' ' + suffixClasses).trim();
    } else if (rootClass) {
      changes.className = (rootClass + ' ' + suffixClasses).trim();
    }

    return Object.keys(changes).length === 0 ? element : (0, _react.cloneElement)(element, changes, changes.children || element.props.children);
  }

  return transform;
}

function withPackageName(packageName) {
  return {
    // Transform a stateless function component
    transformer: function transformer(componentFunction) {
      var componentName = componentFunction.displayName || componentFunction.name;
      var prefix = packageName + '-' + componentName;
      var transform = transformWithPrefix(prefix);

      var transformedComponent = function transformedComponent(props) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        return transform(componentFunction.apply(undefined, [skipPropElements(props)].concat(args)), prefix, props.className);
      };

      // Add `className` propType, if none exists
      transformedComponent.propTypes = _extends({ className: _propTypes2.default.string }, componentFunction.propTypes);

      return hoistFunctionStatics(componentFunction, transformedComponent);
    },


    // Transform a React.Component class
    decorator: function decorator(componentClass) {
      var componentName = componentClass.displayName || componentClass.name;
      var prefix = packageName + '-' + componentName;
      var transform = transformWithPrefix(prefix);

      var DecoratedComponent = function (_componentClass) {
        _inherits(DecoratedComponent, _componentClass);

        function DecoratedComponent() {
          _classCallCheck(this, DecoratedComponent);

          return _possibleConstructorReturn(this, (DecoratedComponent.__proto__ || Object.getPrototypeOf(DecoratedComponent)).apply(this, arguments));
        }

        _createClass(DecoratedComponent, [{
          key: 'render',
          value: function render() {
            var rawProps = this.props;
            this.props = skipPropElements(this.props);
            var transformed = transform(_get(DecoratedComponent.prototype.__proto__ || Object.getPrototypeOf(DecoratedComponent.prototype), 'render', this).call(this), prefix, this.props.className);
            this.props = rawProps;
            return transformed;
          }
        }]);

        return DecoratedComponent;
      }(componentClass);

      // Add `className` propType, if none exists
      DecoratedComponent.propTypes = _extends({ className: _propTypes2.default.string }, componentClass.propTypes);

      return DecoratedComponent;
    }
  };
}