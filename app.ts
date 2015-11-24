import bootstrap, Component from 'angular2/angular2';
import bind from 'angular2/di';
import createStore, applyMiddleware from 'redux';
import thunk from 'redux-thunk';
import provider from  'ng2-redux';
import rootReducer from './reducers';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(rootReducer);

@Component({
    selector: 'my-app',
    template: '<h1>My Second Angular 2 App</h1>'
})
class AppComponent { }

bootstrap(AppComponent);

    //[provider(store)]
