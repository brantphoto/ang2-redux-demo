/* */ 
'use strict';
exports.__esModule = true;
exports['default'] = debounceTime;
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
var _Subscriber2 = require('../Subscriber');
var _Subscriber3 = _interopRequireDefault(_Subscriber2);
var _schedulersNextTick = require('../schedulers/nextTick');
var _schedulersNextTick2 = _interopRequireDefault(_schedulersNextTick);
function debounceTime(dueTime) {
  var scheduler = arguments.length <= 1 || arguments[1] === undefined ? _schedulersNextTick2['default'] : arguments[1];
  return this.lift(new DebounceTimeOperator(dueTime, scheduler));
}
var DebounceTimeOperator = (function() {
  function DebounceTimeOperator(dueTime, scheduler) {
    _classCallCheck(this, DebounceTimeOperator);
    this.dueTime = dueTime;
    this.scheduler = scheduler;
  }
  DebounceTimeOperator.prototype.call = function call(subscriber) {
    return new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler);
  };
  return DebounceTimeOperator;
})();
var DebounceTimeSubscriber = (function(_Subscriber) {
  _inherits(DebounceTimeSubscriber, _Subscriber);
  function DebounceTimeSubscriber(destination, dueTime, scheduler) {
    _classCallCheck(this, DebounceTimeSubscriber);
    _Subscriber.call(this, destination);
    this.dueTime = dueTime;
    this.scheduler = scheduler;
    this.debouncedSubscription = null;
    this.lastValue = null;
  }
  DebounceTimeSubscriber.prototype._next = function _next(value) {
    this.clearDebounce();
    this.lastValue = value;
    this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
  };
  DebounceTimeSubscriber.prototype._complete = function _complete() {
    this.debouncedNext();
    this.destination.complete();
  };
  DebounceTimeSubscriber.prototype.debouncedNext = function debouncedNext() {
    this.clearDebounce();
    if (this.lastValue != null) {
      this.destination.next(this.lastValue);
      this.lastValue = null;
    }
  };
  DebounceTimeSubscriber.prototype.clearDebounce = function clearDebounce() {
    var debouncedSubscription = this.debouncedSubscription;
    if (debouncedSubscription !== null) {
      this.remove(debouncedSubscription);
      debouncedSubscription.unsubscribe();
      this.debouncedSubscription = null;
    }
  };
  return DebounceTimeSubscriber;
})(_Subscriber3['default']);
function dispatchNext(subscriber) {
  subscriber.debouncedNext();
}
module.exports = exports['default'];
