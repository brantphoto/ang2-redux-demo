/* */ 
'use strict';
exports.__esModule = true;
exports.groupBy = groupBy;
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
var _Subscriber3 = require('../Subscriber');
var _Subscriber4 = _interopRequireDefault(_Subscriber3);
var _Observable2 = require('../Observable');
var _Observable3 = _interopRequireDefault(_Observable2);
var _Subject = require('../Subject');
var _Subject2 = _interopRequireDefault(_Subject);
var _utilMap = require('../util/Map');
var _utilMap2 = _interopRequireDefault(_utilMap);
var _utilFastMap = require('../util/FastMap');
var _utilFastMap2 = _interopRequireDefault(_utilFastMap);
var _groupBySupport = require('./groupBy-support');
var _utilTryCatch = require('../util/tryCatch');
var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);
var _utilErrorObject = require('../util/errorObject');
function groupBy(keySelector, elementSelector, durationSelector) {
  return new GroupByObservable(this, keySelector, elementSelector, durationSelector);
}
var GroupByObservable = (function(_Observable) {
  _inherits(GroupByObservable, _Observable);
  function GroupByObservable(source, keySelector, elementSelector, durationSelector) {
    _classCallCheck(this, GroupByObservable);
    _Observable.call(this);
    this.source = source;
    this.keySelector = keySelector;
    this.elementSelector = elementSelector;
    this.durationSelector = durationSelector;
  }
  GroupByObservable.prototype._subscribe = function _subscribe(subscriber) {
    var refCountSubscription = new _groupBySupport.RefCountSubscription();
    var groupBySubscriber = new GroupBySubscriber(subscriber, refCountSubscription, this.keySelector, this.elementSelector, this.durationSelector);
    refCountSubscription.setPrimary(this.source.subscribe(groupBySubscriber));
    return refCountSubscription;
  };
  return GroupByObservable;
})(_Observable3['default']);
exports.GroupByObservable = GroupByObservable;
var GroupBySubscriber = (function(_Subscriber) {
  _inherits(GroupBySubscriber, _Subscriber);
  function GroupBySubscriber(destination, refCountSubscription, keySelector, elementSelector, durationSelector) {
    _classCallCheck(this, GroupBySubscriber);
    _Subscriber.call(this);
    this.refCountSubscription = refCountSubscription;
    this.keySelector = keySelector;
    this.elementSelector = elementSelector;
    this.durationSelector = durationSelector;
    this.groups = null;
    this.destination = destination;
    this.add(destination);
  }
  GroupBySubscriber.prototype._next = function _next(x) {
    var key = _utilTryCatch2['default'](this.keySelector)(x);
    if (key === _utilErrorObject.errorObject) {
      this.error(key.e);
    } else {
      var groups = this.groups;
      var elementSelector = this.elementSelector;
      var durationSelector = this.durationSelector;
      if (!groups) {
        groups = this.groups = typeof key === 'string' ? new _utilFastMap2['default']() : new _utilMap2['default']();
      }
      var group = groups.get(key);
      if (!group) {
        groups.set(key, group = new _Subject2['default']());
        var groupedObservable = new _groupBySupport.GroupedObservable(key, group, this.refCountSubscription);
        if (durationSelector) {
          var duration = _utilTryCatch2['default'](durationSelector)(new _groupBySupport.GroupedObservable(key, group));
          if (duration === _utilErrorObject.errorObject) {
            this.error(duration.e);
          } else {
            this.add(duration._subscribe(new GroupDurationSubscriber(key, group, this)));
          }
        }
        this.destination.next(groupedObservable);
      }
      if (elementSelector) {
        var value = _utilTryCatch2['default'](elementSelector)(x);
        if (value === _utilErrorObject.errorObject) {
          this.error(value.e);
        } else {
          group.next(value);
        }
      } else {
        group.next(x);
      }
    }
  };
  GroupBySubscriber.prototype._error = function _error(err) {
    var _this = this;
    var groups = this.groups;
    if (groups) {
      groups.forEach(function(group, key) {
        group.error(err);
        _this.removeGroup(key);
      });
    }
    this.destination.error(err);
  };
  GroupBySubscriber.prototype._complete = function _complete() {
    var _this2 = this;
    var groups = this.groups;
    if (groups) {
      groups.forEach(function(group, key) {
        group.complete();
        _this2.removeGroup(group);
      });
    }
    this.destination.complete();
  };
  GroupBySubscriber.prototype.removeGroup = function removeGroup(key) {
    this.groups['delete'](key);
  };
  return GroupBySubscriber;
})(_Subscriber4['default']);
var GroupDurationSubscriber = (function(_Subscriber2) {
  _inherits(GroupDurationSubscriber, _Subscriber2);
  function GroupDurationSubscriber(key, group, parent) {
    _classCallCheck(this, GroupDurationSubscriber);
    _Subscriber2.call(this, null);
    this.key = key;
    this.group = group;
    this.parent = parent;
  }
  GroupDurationSubscriber.prototype._next = function _next(value) {
    this.group.complete();
    this.parent.removeGroup(this.key);
  };
  GroupDurationSubscriber.prototype._error = function _error(err) {
    this.group.error(err);
    this.parent.removeGroup(this.key);
  };
  GroupDurationSubscriber.prototype._complete = function _complete() {
    this.group.complete();
    this.parent.removeGroup(this.key);
  };
  return GroupDurationSubscriber;
})(_Subscriber4['default']);
