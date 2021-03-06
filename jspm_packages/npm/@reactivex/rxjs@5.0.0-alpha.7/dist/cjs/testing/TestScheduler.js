/* */ 
'use strict';
exports.__esModule = true;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
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
var _Observable = require('../Observable');
var _Observable2 = _interopRequireDefault(_Observable);
var _schedulersVirtualTimeScheduler = require('../schedulers/VirtualTimeScheduler');
var _schedulersVirtualTimeScheduler2 = _interopRequireDefault(_schedulersVirtualTimeScheduler);
var _Notification = require('../Notification');
var _Notification2 = _interopRequireDefault(_Notification);
var _ColdObservable = require('./ColdObservable');
var _ColdObservable2 = _interopRequireDefault(_ColdObservable);
var _HotObservable = require('./HotObservable');
var _HotObservable2 = _interopRequireDefault(_HotObservable);
var _SubscriptionLog = require('./SubscriptionLog');
var _SubscriptionLog2 = _interopRequireDefault(_SubscriptionLog);
var TestScheduler = (function(_VirtualTimeScheduler) {
  _inherits(TestScheduler, _VirtualTimeScheduler);
  function TestScheduler(assertDeepEqual) {
    _classCallCheck(this, TestScheduler);
    _VirtualTimeScheduler.call(this);
    this.assertDeepEqual = assertDeepEqual;
    this.hotObservables = [];
    this.flushTests = [];
  }
  TestScheduler.prototype.createColdObservable = function createColdObservable(marbles, values, error) {
    if (marbles.indexOf('^') !== -1) {
      throw new Error('Cold observable cannot have subscription offset "^"');
    }
    if (marbles.indexOf('!') !== -1) {
      throw new Error('Cold observable cannot have unsubscription marker "!"');
    }
    var messages = TestScheduler.parseMarbles(marbles, values, error);
    return new _ColdObservable2['default'](messages, this);
  };
  TestScheduler.prototype.createHotObservable = function createHotObservable(marbles, values, error) {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('Hot observable cannot have unsubscription marker "!"');
    }
    var messages = TestScheduler.parseMarbles(marbles, values, error);
    var subject = new _HotObservable2['default'](messages, this);
    this.hotObservables.push(subject);
    return subject;
  };
  TestScheduler.prototype.materializeInnerObservable = function materializeInnerObservable(observable, outerFrame) {
    var _this = this;
    var messages = [];
    observable.subscribe(function(value) {
      messages.push({
        frame: _this.frame - outerFrame,
        notification: _Notification2['default'].createNext(value)
      });
    }, function(err) {
      messages.push({
        frame: _this.frame - outerFrame,
        notification: _Notification2['default'].createError(err)
      });
    }, function() {
      messages.push({
        frame: _this.frame - outerFrame,
        notification: _Notification2['default'].createComplete()
      });
    });
    return messages;
  };
  TestScheduler.prototype.expectObservable = function expectObservable(observable) {
    var _this2 = this;
    var unsubscriptionMarbles = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var actual = [];
    var flushTest = {
      actual: actual,
      ready: false
    };
    var unsubscriptionFrame = TestScheduler.parseMarblesAsSubscriptions(unsubscriptionMarbles).unsubscribedFrame;
    var subscription = undefined;
    this.schedule(function() {
      subscription = observable.subscribe(function(x) {
        var value = x;
        if (x instanceof _Observable2['default']) {
          value = _this2.materializeInnerObservable(value, _this2.frame);
        }
        actual.push({
          frame: _this2.frame,
          notification: _Notification2['default'].createNext(value)
        });
      }, function(err) {
        actual.push({
          frame: _this2.frame,
          notification: _Notification2['default'].createError(err)
        });
      }, function() {
        actual.push({
          frame: _this2.frame,
          notification: _Notification2['default'].createComplete()
        });
      });
    }, 0);
    if (unsubscriptionFrame !== Number.POSITIVE_INFINITY) {
      this.schedule(function() {
        return subscription.unsubscribe();
      }, unsubscriptionFrame);
    }
    this.flushTests.push(flushTest);
    return {toBe: function toBe(marbles, values, errorValue) {
        flushTest.ready = true;
        flushTest.expected = TestScheduler.parseMarbles(marbles, values, errorValue, true);
      }};
  };
  TestScheduler.prototype.expectSubscriptions = function expectSubscriptions(actualSubscriptionLogs) {
    var flushTest = {
      actual: actualSubscriptionLogs,
      ready: false
    };
    this.flushTests.push(flushTest);
    return {toBe: function toBe(marbles) {
        var marblesArray = typeof marbles === 'string' ? [marbles] : marbles;
        flushTest.ready = true;
        flushTest.expected = marblesArray.map(function(marbles) {
          return TestScheduler.parseMarblesAsSubscriptions(marbles);
        });
      }};
  };
  TestScheduler.prototype.flush = function flush() {
    var hotObservables = this.hotObservables;
    while (hotObservables.length > 0) {
      hotObservables.shift().setup();
    }
    _VirtualTimeScheduler.prototype.flush.call(this);
    var readyFlushTests = this.flushTests.filter(function(test) {
      return test.ready;
    });
    while (readyFlushTests.length > 0) {
      var test = readyFlushTests.shift();
      this.assertDeepEqual(test.actual, test.expected);
    }
  };
  TestScheduler.parseMarblesAsSubscriptions = function parseMarblesAsSubscriptions(marbles) {
    if (typeof marbles !== 'string') {
      return new _SubscriptionLog2['default'](Number.POSITIVE_INFINITY);
    }
    var len = marbles.length;
    var groupStart = -1;
    var subscriptionFrame = Number.POSITIVE_INFINITY;
    var unsubscriptionFrame = Number.POSITIVE_INFINITY;
    for (var i = 0; i < len; i++) {
      var frame = i * this.frameTimeFactor;
      var c = marbles[i];
      switch (c) {
        case '-':
        case ' ':
          break;
        case '(':
          groupStart = frame;
          break;
        case ')':
          groupStart = -1;
          break;
        case '^':
          if (subscriptionFrame !== Number.POSITIVE_INFINITY) {
            throw new Error('Found a second subscription point \'^\' in a ' + 'subscription marble diagram. There can only be one.');
          }
          subscriptionFrame = groupStart > -1 ? groupStart : frame;
          break;
        case '!':
          if (unsubscriptionFrame !== Number.POSITIVE_INFINITY) {
            throw new Error('Found a second subscription point \'^\' in a ' + 'subscription marble diagram. There can only be one.');
          }
          unsubscriptionFrame = groupStart > -1 ? groupStart : frame;
          break;
        default:
          throw new Error('There can only be \'^\' and \'!\' markers in a ' + 'subscription marble diagram. Found instead \'' + c + '\'.');
      }
    }
    if (unsubscriptionFrame < 0) {
      return new _SubscriptionLog2['default'](subscriptionFrame);
    } else {
      return new _SubscriptionLog2['default'](subscriptionFrame, unsubscriptionFrame);
    }
  };
  TestScheduler.parseMarbles = function parseMarbles(marbles, values, errorValue) {
    var materializeInnerObservables = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
    if (marbles.indexOf('!') !== -1) {
      throw new Error('Conventional marble diagrams cannot have the ' + 'unsubscription marker "!"');
    }
    var len = marbles.length;
    var testMessages = [];
    var subIndex = marbles.indexOf('^');
    var frameOffset = subIndex === -1 ? 0 : subIndex * -this.frameTimeFactor;
    var getValue = typeof values !== 'object' ? function(x) {
      return x;
    } : function(x) {
      if (materializeInnerObservables && values[x] instanceof _ColdObservable2['default']) {
        return values[x].messages;
      }
      return values[x];
    };
    var groupStart = -1;
    for (var i = 0; i < len; i++) {
      var frame = i * this.frameTimeFactor;
      var notification = undefined;
      var c = marbles[i];
      switch (c) {
        case '-':
        case ' ':
          break;
        case '(':
          groupStart = frame;
          break;
        case ')':
          groupStart = -1;
          break;
        case '|':
          notification = _Notification2['default'].createComplete();
          break;
        case '^':
          break;
        case '#':
          notification = _Notification2['default'].createError(errorValue || 'error');
          break;
        default:
          notification = _Notification2['default'].createNext(getValue(c));
          break;
      }
      frame += frameOffset;
      if (notification) {
        testMessages.push({
          frame: groupStart > -1 ? groupStart : frame,
          notification: notification
        });
      }
    }
    return testMessages;
  };
  return TestScheduler;
})(_schedulersVirtualTimeScheduler2['default']);
exports.TestScheduler = TestScheduler;
