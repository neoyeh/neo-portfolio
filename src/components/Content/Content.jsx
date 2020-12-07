import React  from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDataBegin } from '../../action/todolist';
import PropTypes from 'prop-types';

const Content = (props) => {
    const { match } = props;
    const dispatch = useDispatch();
    const data = useSelector(state => state.todoReducer);
    return (
        <div data-testid="contentBlock">
            <div>match: {JSON.stringify(match)}</div>
            <div data-testid="contentData">
                {data ? JSON.stringify(data) : '暫無資料'}
            </div>
            <button type="button"
                onClick={() => { dispatch(fetchDataBegin()); }}
                data-testid="fetchContentDataBtn"
            >
                獲取資料
            </button>
        </div>
    )
}
Content.propTypes = {
    match: PropTypes.shape({}),
};
Content.defaultProps = {
    match: {},
};

export default Content;
