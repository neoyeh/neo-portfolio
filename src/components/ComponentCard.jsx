import React, { useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const size_28 = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRNAeTBi2aqvtU2-J_aaIBMGXn3GCyLCUGMjrbxgFX4S7vlK4FF&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRNAeTBi2aqvtU2-J_aaIBMGXn3GCyLCUGMjrbxgFX4S7vlK4FF&usqp=CAU',
];

const Tool = (props) => {
    const { max, min } = props;
    const data = useContext(Cardcontent);
    const width = (data.itemList.length>0)?data.itemList.filter(e=>e.id===data.checked)[0].width:0;
    const handleChange = (e) => {
        const value = e.target.value;
        const newList = data.itemList.map(e=>{
            if(e.id===data.checked){
                e.width = value
            }
            return e
        });
        data.setItemList(newList)
    }
    return (
        <>
            <div>size:</div>
            <div className="tool-content tool-size">
                <label><span>{width}</span>px :</label>
                <input type="range" 
                    min={min} 
                    max={max}
                    onChange={handleChange}
                    value={width}
                />
            </div>
        </>
    )
}
Tool.protoTypes = {
    type: PropTypes.string,
    max: PropTypes.number,
    min: PropTypes.number,
};
Tool.defaultProps = {
    type: 'size',
    max: 40,
    min: 15,
};

const CardTool = () => {
    return (
        <div className="card-tool">
            <Tool />
        </div>
    )
}

const CardItem = (props) => {
    const { url, index } = props;
    const data = useContext(Cardcontent);
    // console.log(data);
    return (
        <div className="card-item">
            <label htmlFor={`${index}-${data.origin}`}>
                <input type="radio" 
                    id={`${index}-${data.origin}`}
                    value={`${index}-${data.origin}`}
                    name={`i-${data.origin}`}
                    onChange={()=>{data.setChecked(`${index}-${data.origin}`)}}
                    checked={data.checked===`${index}-${data.origin}`}
                />
                <div className="card-image">
                    <img src={url} 
                        style={{
                            width: data.itemList[index].width,
                            height: data.itemList[index].width,
                        }}
                    />
                </div>
                <div>{data.itemList[index].width}</div>
            </label>
        </div>
    )
}

const Cardcontent = createContext();
const CardCaption = (props) => {
    const { origin, imgList } = props;
    const [checked, setChecked] = useState(`0-${origin}`);
    const imgListMap = imgList.map((i, index)=>{
        const id = `${index}-${origin}`;
        return {
            url: i,
            width: origin,
            id: id,
        }
    });
    const [itemList, setItemList] = useState(imgListMap);
    return (
        <Cardcontent.Provider value={{
            origin, itemList, checked, setChecked, setItemList
        }}>
            <div className="card-caption"
                data-origin={origin}
            >
                <CardTool />
                <div className={`card-content card-content-${origin}`}>
                    {
                        imgList.map((i, index) =>{
                            return(
                                <CardItem
                                    index={index}
                                    key={index}
                                    url={i}
                                />
                            )
                        })
                    }
                </div>
            </div>
        </Cardcontent.Provider>
    )
}
CardCaption.protoTypes = {
    origin: PropTypes.number,
    imgList: PropTypes.array,
};
CardCaption.defaultProps = {
    origin: 28,
    imgList: [],
};








const App = () => {
    return (
        <div className="container">
            <CardCaption origin={28} imgList={size_28} />
        </div>
    )
}
export default App;