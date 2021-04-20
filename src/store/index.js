import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';

import todoReducer from '../reducer/todolist';
import portfolioReducer from '../reducer/portfolio';

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
    todoReducer,
    portfolioReducer,
});
// const store = createStore(rootReducer);

const store = createStore(
    // rootReducer, applyMiddleware(logger),
    rootReducer, applyMiddleware(sagaMiddleware, logger),
);

sagaMiddleware.run(rootSaga);


export default store;