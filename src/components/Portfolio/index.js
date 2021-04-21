import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPortfolioBegin } from '../../action/portfolio';

const showFunc = () => {
    [...document.querySelectorAll('.protfolio-card')].map((e, i)=>{
        if(e){
            setTimeout(() => {
                e.classList.add('done');
            }, 25*i);
        }
    });
    Array.from(document.querySelectorAll('.protfolio-year')).forEach((e, i)=>{
        if(e){
            setTimeout(() => {
                e.classList.add('done');
            }, 250*i);
        }
    });
}

const imageLoaded = (list) => {
    showFunc();
    Promise.all(Array.from(document.images).map(img => {
        if (img.complete)
            return Promise.resolve(img.naturalHeight !== 0);
        return new Promise(resolve => {
            img.addEventListener('load', () => resolve(true));
            img.addEventListener('error', () => resolve(false));
        });
    })).then(results => {
        if (results.every(res => res)){
            console.log('all images loaded successfully');
            showFunc();
        }else{
            console.log('some images failed to load, all finished loading');
            showFunc();
        }
    });
}



const Portfolio = () => {
    const dispatch = useDispatch();
    const list = useSelector(state => state.portfolioReducer);
    
    useEffect(() => {
        dispatch(fetchPortfolioBegin());
    }, []);

    useEffect(()=> {
        console.log('render 後執行');
        return () => {
            console.log(`render 移除後`);
        }
        //放空陣列只會在render後跑一次
    },[]);
    useEffect(()=> {
        console.log(`state改變成 ${list}`);
        console.log(`========`);
        imageLoaded(list);
        return () => {
            console.log(`state改變前 ${list}`);
        }
    },[list]);
    
    return (
        <div className="protfolio-content">
            {list.portfolioList.map((list,index)=>{
                return(
                    <div className="protfolio-list" key={index}>
                        <div className="protfolio-year">{list.years}</div>
                        <div className="protfolio-list-content">
                            {list.protfolio_list.map((e,i)=>{
                                return(
                                    <div className={"protfolio-card"} key={i}>
                                        <div className="protfolio-card-padding">
                                            <div className="protfolio-card-content">
                                                <div className="image-block">
                                                    <img src={e.image} />
                                                </div>
                                                <div className="wording-area">
                                                    <div className="text-block">
                                                        <div className="font-card-title">{e.name}</div>
                                                        {(e.text)?
                                                            <div className="font-card-text"
                                                                dangerouslySetInnerHTML={{__html: e.text}}
                                                            >
                                                            </div>:""
                                                        }
                                                    </div>
                                                    {(e.link_live||e.link_github)?
                                                        <div className="link-block">
                                                            {(e.link_live)?
                                                                <a href={e.link_live} className="font-card-icon font-card-icon--live" target="_blank" rel="nofollow noopener noreferrer">
                                                                    <i className="fa fa-desktop" aria-hidden="true"></i>
                                                                </a>:""
                                                            }
                                                            {(e.link_github)?
                                                                <a href={e.link_github} className="font-card-icon font-card-icon--github" target="_blank" rel="nofollow noopener noreferrer">
                                                                    <i className="fa fa-github" aria-hidden="true"></i>
                                                                </a>:""
                                                            }
                                                        </div>
                                                        :""
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
};


export default Portfolio; 
