import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';

import portfolioReducer from '../reducer/portfolio';

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  portfolioReducer,
});

const middlewares = [sagaMiddleware];
if (process.env.NODE_ENV !== 'production') {
  middlewares.push(logger);
}

const store = createStore(rootReducer, applyMiddleware(...middlewares));

sagaMiddleware.run(rootSaga);

export default store;
