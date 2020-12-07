import React, { useState } from 'react';


{/* useState 設定改變state */}
const ComponentUseState = () => {
    const [count, setCount] = useState(2);
    return (
        <div>
            <div>useState 設定改變state</div>
            <h5>{count}</h5>
            <button type="button" onClick={ ()=>{setCount(count+1);} }>
                點我+1
            </button>
        </div>
    )
};


export default ComponentUseState; 
