"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prefixedClassNames = prefixedClassNames;
exports.transformWithPrefix = transformWithPrefix;
exports.withPackageName = withPackageName;
var _classnames = _interopRequireDefault(require("classnames"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _react = require("react");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function prefixedClassNames(prefix) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  return _classnames["default"].apply(void 0, args).split(/\s+/).filter(function (name) {
    return name !== "";
  }).map(function (name) {
    return "".concat(prefix, "-").concat(name);
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
    for (var _i = 0, _Object$keys = Object.keys(props); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];
      if (key == 'children') continue;
      var value = props[key];
      if ( /*#__PURE__*/(0, _react.isValidElement)(value)) {
        var transformed = fn(value);
        if (transformed !== value) {
          changes[key] = transformed;
        }
      }
    }
  }
  return changes;
}
function cloneElementWithSkip(element) {
  return /*#__PURE__*/(0, _react.cloneElement)(element, {
    __pacomoSkip: true
  });
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
    if (_typeof(element) !== 'object' || element.props['__pacomoSkip']) return element;
    console.log('Skipping transformation due to __pacomoSkip');
    var changes = transformElementProps(element.props, childTransform, typeof element.type !== 'function');
    if (element.props.className) {
      changes.className = "".concat(rootClass || '', " ").concat(prefixedClassNames(prefix, element.props.className), " ").concat(suffixClasses).trim();
    } else if (rootClass) {
      changes.className = "".concat(rootClass, " ").concat(suffixClasses).trim();
    }
    return Object.keys(changes).length === 0 ? element : /*#__PURE__*/(0, _react.cloneElement)(element, changes, changes.children || element.props.children);
  }
  return transform;
}
function withPackageName(packageName) {
  return {
    // Transform a stateless function component
    transformer: function transformer(componentFunction) {
      var componentName = componentFunction.displayName || componentFunction.name;
      var prefix = "".concat(packageName, "-").concat(componentName);
      var transform = transformWithPrefix(prefix);
      var transformedComponent = function transformedComponent(props) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        return transform(componentFunction.apply(void 0, [skipPropElements(props)].concat(args)), prefix, props.className);
      };

      // Add `className` propType, if none exists
      transformedComponent.propTypes = _objectSpread({
        className: _propTypes["default"].string
      }, componentFunction.propTypes);
      return hoistFunctionStatics(componentFunction, transformedComponent);
    },
    // Transform a React.Component class
    decorator: function decorator(componentClass) {
      var componentName = componentClass.displayName || componentClass.name;
      var prefix = "".concat(packageName, "-").concat(componentName);
      var transform = transformWithPrefix(prefix);
      var DecoratedComponent = /*#__PURE__*/function (_componentClass) {
        _inherits(DecoratedComponent, _componentClass);
        var _super = _createSuper(DecoratedComponent);
        function DecoratedComponent() {
          _classCallCheck(this, DecoratedComponent);
          return _super.apply(this, arguments);
        }
        _createClass(DecoratedComponent, [{
          key: "render",
          value: function render() {
            var rawProps = this.props;
            this.props = skipPropElements(this.props);
            var transformed = transform(_get(_getPrototypeOf(DecoratedComponent.prototype), "render", this).call(this), prefix, this.props.className);
            this.props = rawProps;
            return transformed;
          }
        }]);
        return DecoratedComponent;
      }(componentClass);

      // Add `className` propType, if none exists
      DecoratedComponent.propTypes = _objectSpread({
        className: _propTypes["default"].string
      }, componentClass.propTypes);
      return DecoratedComponent;
    }
  };
}