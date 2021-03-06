/* */ 
'use strict';
exports.__esModule = true;
exports['default'] = min;
var _reduceSupport = require('../reduce-support');
function min(comparer) {
  var min = typeof comparer === 'function' ? comparer : function(x, y) {
    return x < y ? x : y;
  };
  return this.lift(new _reduceSupport.ReduceOperator(min));
}
module.exports = exports['default'];
