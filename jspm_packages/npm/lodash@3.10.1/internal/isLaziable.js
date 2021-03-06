/* */ 
var LazyWrapper = require('./LazyWrapper'),
    getData = require('./getData'),
    getFuncName = require('./getFuncName'),
    lodash = require('../chain/lodash');
function isLaziable(func) {
  var funcName = getFuncName(func),
      other = lodash[funcName];
  if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
    return false;
  }
  if (func === other) {
    return true;
  }
  var data = getData(other);
  return !!data && func === data[0];
}
module.exports = isLaziable;
