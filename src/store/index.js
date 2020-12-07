import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';
import todoReducer from '../reducer/todolist';

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
    todoReducer,
});
// const store = createStore(rootReducer);

const store = createStore(
    // rootReducer, applyMiddleware(logger),
    rootReducer, applyMiddleware(sagaMiddleware, logger),
);

sagaMiddleware.run(rootSaga);


export default store;