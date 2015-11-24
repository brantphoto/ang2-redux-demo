var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var module_1 = require();
from;
'angular2/angular2';
var module_2 = require();
from;
'redux';
var redux_thunk_1 = require('redux-thunk');
var reducers_1 = require('./reducers');
var createStoreWithMiddleware = applyMiddleware(redux_thunk_1["default"])(module_2["default"]);
var store = createStoreWithMiddleware(reducers_1["default"]);
var AppComponent = (function () {
    function AppComponent() {
    }
    AppComponent = __decorate([
        Component({
            selector: 'my-app',
            template: '<h1>My Second Angular 2 App</h1>'
        })
    ], AppComponent);
    return AppComponent;
})();
module_1["default"](AppComponent);
//[provider(store)]
