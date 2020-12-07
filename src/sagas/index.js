import { all } from 'redux-saga/effects';
import toodlistSaga from './content';

function* rootSaga() {
  yield all([
    toodlistSaga(),
  ]);
}

export default rootSaga;