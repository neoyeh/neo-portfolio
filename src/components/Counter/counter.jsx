import React, { useState } from 'react';

const Counter = () => {
    const [count, setCount] = useState(0);
    const [add, setAdd] = useState(1);
    const handleClick = () => {
        setCount(count + add);
    };
    const handleChange = (e) => {
        setAdd(Number(e.target.value));
    };
    return (
        <div data-testid="counterBlock">
            <div data-testid="counter">{count}</div>
            <input type="number"
                data-testid="changeAddBtn"
                onChange={handleChange}
                value={add} 
            />
            <button
                data-testid="addCountBtn"
                type="button"
                onClick={handleClick}
            >
                點我加{add}
            </button>
        </div>
    )
}

export default Counter;