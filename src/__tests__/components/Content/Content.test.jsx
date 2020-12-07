import React from 'react';
import { createStore, combineReducers } from 'redux';
import * as ReactRedux from 'react-redux';
import { render, fireEvent } from '@testing-library/react';
import { toBeInTheDocument } from '@testing-library/jest-dom';
import Content from '../../../components/Content';
import todoReducer from '../../../reducer/todolist';




const { Provider } = ReactRedux;

const generateComponent = (component, initState) => {
    function combined(state = {}, action) {
        return {
            todoReducer: todoReducer(state.todoReducer, action)
        }
    };
    const store = createStore(combined, { todoReducer: initState });
  
    return render(
        <Provider store={store}>
            {component}
        </Provider>,
    );
};

describe('Content', ()=>{
    test('Content_Check_Render', () => {
        const { getByTestId } = generateComponent(<Content />);

        expect(getByTestId('contentBlock')).toBeInTheDocument();
    });

    test('Content_Click_ExecuteDispatch', () => {
        const mockDispatch = jest.fn();
        const mockUseDispatch = jest.spyOn(ReactRedux, 'useDispatch');
        mockUseDispatch.mockReturnValue(mockDispatch);

        const { getByTestId } = generateComponent(<Content />);
        const fetchContentDataBtn = getByTestId('fetchContentDataBtn');
        fireEvent.click(fetchContentDataBtn);

        expect(mockDispatch.mock.calls[0][0]).toEqual({ type: 'FETCH_DATA_BEGIN' });
    });

    test('Content_Render_ContentData', () => {
        const testInitState = { data: { test: 'test' } };
    
        const { getByTestId } = generateComponent(<Content />, testInitState);
    
        const contentBlock = getByTestId('contentData');
        expect(contentBlock.textContent).toBe(JSON.stringify(testInitState));
    });


});