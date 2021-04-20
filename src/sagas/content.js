import { call, put, takeEvery } from 'redux-saga/effects';
import { FETCH_DATA_BEGIN, fetchDataSuccsee } from '../action/todolist';
import { getContent } from '../api/content';

function* fetchData(){
    // 使用 data 接收請求的資料
    const data = yield call(getContent);
    yield put(fetchDataSuccsee(data));
}
function* toodlistSaga() {
    yield takeEvery(FETCH_DATA_BEGIN, fetchData);
}
export default toodlistSaga;

