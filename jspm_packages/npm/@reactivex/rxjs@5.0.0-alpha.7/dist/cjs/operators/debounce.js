/* */ 
'use strict';
exports.__esModule = true;
var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps)
      defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();
exports['default'] = debounce;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }});
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}
var _observablesPromiseObservable = require('../observables/PromiseObservable');
var _observablesPromiseObservable2 = _interopRequireDefault(_observablesPromiseObservable);
var _Subscriber3 = require('../Subscriber');
var _Subscriber4 = _interopRequireDefault(_Subscriber3);
var _utilTryCatch = require('../util/tryCatch');
var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);
var _utilErrorObject = require('../util/errorObject');
function debounce(durationSelector) {
  return this.lift(new DebounceOperator(durationSelector));
}
var DebounceOperator = (function() {
  function DebounceOperator(durationSelector) {
    _classCallCheck(this, DebounceOperator);
    this.durationSelector = durationSelector;
  }
  DebounceOperator.prototype.call = function call(observer) {
    return new DebounceSubscriber(observer, this.durationSelector);
  };
  return DebounceOperator;
})();
var DebounceSubscriber = (function(_Subscriber) {
  _inherits(DebounceSubscriber, _Subscriber);
  function DebounceSubscriber(destination, durationSelector) {
    _classCallCheck(this, DebounceSubscriber);
    _Subscriber.call(this, destination);
    this.durationSelector = durationSelector;
    this.debouncedSubscription = null;
    this.lastValue = null;
    this._index = 0;
  }
  DebounceSubscriber.prototype._next = function _next(value) {
    var destination = this.destination;
    var currentIndex = ++this._index;
    var debounce = _utilTryCatch2['default'](this.durationSelector)(value);
    if (debounce === _utilErrorObject.errorObject) {
      destination.error(_utilErrorObject.errorObject.e);
    } else {
      if (typeof debounce.subscribe !== 'function' && typeof debounce.then === 'function') {
        debounce = _observablesPromiseObservable2['default'].create(debounce);
      }
      this.lastValue = value;
      this.add(this.debouncedSubscription = debounce._subscribe(new DurationSelectorSubscriber(this, currentIndex)));
    }
  };
  DebounceSubscriber.prototype._complete = function _complete() {
    this.debouncedNext();
    this.destination.complete();
  };
  DebounceSubscriber.prototype.debouncedNext = function debouncedNext() {
    this.clearDebounce();
    if (this.lastValue != null) {
      this.destination.next(this.lastValue);
      this.lastValue = null;
    }
  };
  DebounceSubscriber.prototype.clearDebounce = function clearDebounce() {
    var debouncedSubscription = this.debouncedSubscription;
    if (debouncedSubscription !== null) {
      this.remove(debouncedSubscription);
      this.debouncedSubscription = null;
    }
  };
  _createClass(DebounceSubscriber, [{
    key: 'index',
    get: function get() {
      return this._index;
    }
  }]);
  return DebounceSubscriber;
})(_Subscriber4['default']);
var DurationSelectorSubscriber = (function(_Subscriber2) {
  _inherits(DurationSelectorSubscriber, _Subscriber2);
  function DurationSelectorSubscriber(parent, currentIndex) {
    _classCallCheck(this, DurationSelectorSubscriber);
    _Subscriber2.call(this, null);
    this.parent = parent;
    this.currentIndex = currentIndex;
  }
  DurationSelectorSubscriber.prototype.debounceNext = function debounceNext() {
    var parent = this.parent;
    if (this.currentIndex === parent.index) {
      parent.debouncedNext();
      if (!this.isUnsubscribed) {
        this.unsubscribe();
      }
    }
  };
  DurationSelectorSubscriber.prototype._next = function _next(unused) {
    this.debounceNext();
  };
  DurationSelectorSubscriber.prototype._error = function _error(err) {
    this.parent.error(err);
  };
  DurationSelectorSubscriber.prototype._complete = function _complete() {
    this.debounceNext();
  };
  return DurationSelectorSubscriber;
})(_Subscriber4['default']);
module.exports = exports['default'];
