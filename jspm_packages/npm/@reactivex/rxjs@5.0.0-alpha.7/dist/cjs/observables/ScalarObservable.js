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
var _Observable2 = require('../Observable');
var _Observable3 = _interopRequireDefault(_Observable2);
var _utilTryCatch = require('../util/tryCatch');
var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);
var _utilErrorObject = require('../util/errorObject');
var _ErrorObservable = require('./ErrorObservable');
var _ErrorObservable2 = _interopRequireDefault(_ErrorObservable);
var _EmptyObservable = require('./EmptyObservable');
var _EmptyObservable2 = _interopRequireDefault(_EmptyObservable);
var ScalarObservable = (function(_Observable) {
  _inherits(ScalarObservable, _Observable);
  function ScalarObservable(value, scheduler) {
    _classCallCheck(this, ScalarObservable);
    _Observable.call(this);
    this.value = value;
    this.scheduler = scheduler;
    this._isScalar = true;
  }
  ScalarObservable.create = function create(value, scheduler) {
    return new ScalarObservable(value, scheduler);
  };
  ScalarObservable.dispatch = function dispatch(state) {
    var done = state.done;
    var value = state.value;
    var subscriber = state.subscriber;
    if (done) {
      subscriber.complete();
      return;
    }
    subscriber.next(value);
    if (subscriber.isUnsubscribed) {
      return;
    }
    state.done = true;
    this.schedule(state);
  };
  ScalarObservable.prototype._subscribe = function _subscribe(subscriber) {
    var value = this.value;
    var scheduler = this.scheduler;
    if (scheduler) {
      subscriber.add(scheduler.schedule(ScalarObservable.dispatch, 0, {
        done: false,
        value: value,
        subscriber: subscriber
      }));
    } else {
      subscriber.next(value);
      if (!subscriber.isUnsubscribed) {
        subscriber.complete();
      }
    }
  };
  return ScalarObservable;
})(_Observable3['default']);
exports['default'] = ScalarObservable;
var proto = ScalarObservable.prototype;
proto.map = function(project, thisArg) {
  var result = _utilTryCatch2['default'](project).call(thisArg || this, this.value, 0);
  if (result === _utilErrorObject.errorObject) {
    return new _ErrorObservable2['default'](_utilErrorObject.errorObject.e);
  } else {
    return new ScalarObservable(project.call(thisArg || this, this.value, 0));
  }
};
proto.filter = function(select, thisArg) {
  var result = _utilTryCatch2['default'](select).call(thisArg || this, this.value, 0);
  if (result === _utilErrorObject.errorObject) {
    return new _ErrorObservable2['default'](_utilErrorObject.errorObject.e);
  } else if (result) {
    return this;
  } else {
    return new _EmptyObservable2['default']();
  }
};
proto.reduce = function(project, acc) {
  if (typeof acc === 'undefined') {
    return this;
  }
  var result = _utilTryCatch2['default'](project)(acc, this.value);
  if (result === _utilErrorObject.errorObject) {
    return new _ErrorObservable2['default'](_utilErrorObject.errorObject.e);
  } else {
    return new ScalarObservable(result);
  }
};
proto.scan = function(project, acc) {
  return this.reduce(project, acc);
};
proto.count = function(predicate, thisArg) {
  if (!predicate) {
    return new ScalarObservable(1);
  } else {
    var result = _utilTryCatch2['default'](predicate).call(thisArg || this, this.value, 0, this);
    if (result === _utilErrorObject.errorObject) {
      return new _ErrorObservable2['default'](_utilErrorObject.errorObject.e);
    } else {
      return new ScalarObservable(result ? 1 : 0);
    }
  }
};
proto.skip = function(count) {
  if (count > 0) {
    return new _EmptyObservable2['default']();
  }
  return this;
};
proto.take = function(count) {
  if (count > 0) {
    return this;
  }
  return new _EmptyObservable2['default']();
};
module.exports = exports['default'];
