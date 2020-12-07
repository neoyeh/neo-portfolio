import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { toBeInTheDocument } from '@testing-library/jest-dom';
import Counter from '../../../components/Counter';

describe('Counter', ()=>{
    test('Counter_ClickAddCount',()=>{
        const { getByTestId } = render(<Counter />);
        const addCountBtn = getByTestId('addCountBtn');
        const changeAddBtn = getByTestId('changeAddBtn');
        expect(getByTestId('counterBlock')).toBeInTheDocument();  
        expect(getByTestId('counter').textContent).toBe('0');   
        fireEvent.click(addCountBtn);   
        expect(getByTestId('counter').textContent).toBe('1');
        fireEvent.change(changeAddBtn,{
            target:{
                value: 200,
            },
        });   
        fireEvent.click(addCountBtn);  
        expect(getByTestId('counter').textContent).toBe('201');
        

    });
});