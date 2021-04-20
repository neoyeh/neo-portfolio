import React  from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDataBegin } from '../action/todolist';

import ComponentRedux from './ComponentRedux.jsx';


const Content = () => {
    const dispatch = useDispatch();
    
    const data = useSelector(state => state.todoReducer);
    return (
        <div>
            <div>
                {data ? JSON.stringify(data) : '暫無資料'}
            </div>
            <button type="button"
                onClick={() => { dispatch(fetchDataBegin()); }}
            >
                獲取資料
            </button>
        </div>
    )
}

 
const Main = (props) => {
    return (
        <div>
            <div>redux & saga</div>
            <ComponentRedux>
                <Content />
            </ComponentRedux>
        </div>
    )
}

export default Content;
