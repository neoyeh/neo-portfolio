import React, { useState, useEffect } from 'react';


{/* useState and useEffect2 生命週期 */}
const ComponentUseEffect = () => {
    const [count, setCount] = useState(2);
    useEffect(()=> {
        console.log('render 後執行');
        return () => {
            console.log(`render 移除後`);
        }
        //放空陣列只會在render後跑一次
    },[])
    useEffect(()=> {
        console.log(`state改變成 ${count}`);
        console.log(`========`);
        return () => {
            console.log(`state改變前 ${count}`);
        }
    },[count])

    return (
        <div>
            <h5>{count}</h5>
            <button type="button" onClick={ ()=>{setCount(count+1);} }>
                點我+1
            </button>
        </div>
    )
};

export const ComponentUseEffect1 = () => {
    return (
        <div>
            <div>useState and useEffect2 生命週期</div>
            <ComponentUseEffect />
        </div>
    )
};

export const ComponentUseEffect2 = () => {
    const [hiddenCounter, setHiddenCounter] = useState(false);
    return (
        <div>
            <div>useState and useEffect2 生命週期</div>
            <button type="button" onClick={ ()=>{setHiddenCounter(!hiddenCounter);} }>
                計數器開關
            </button>
            {hiddenCounter?null:<ComponentUseEffect/>}
        </div>
    )
};
