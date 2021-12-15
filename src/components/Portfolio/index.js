import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPortfolioBegin } from '../../action/portfolio';
import PropTypes from 'prop-types';

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


const PortfolioCard = ({item}) => {
    const {
        image,
        text,
        link_live,
        link_github
    } = item;
    const gitlinkbuild = ( data ) => {
        if(data){
            if( Array.isArray(data) && data.length > 0 ){
                return(
                    data.map((link,index)=>{
                        return(
                            <a href={link} key={index} className="font-card-icon font-card-icon--github" target="_blank" rel="nofollow noopener noreferrer">
                                <i className="fa fa-github" aria-hidden="true"></i>
                            </a>
                        )
                    })
                );
            }else{
                return (
                    <a href={data} className="font-card-icon font-card-icon--github" target="_blank" rel="nofollow noopener noreferrer">
                        <i className="fa fa-github" aria-hidden="true"></i>
                    </a>
                );
            };
        }else{
            return "";
        };
    };

    return (
        <div className={"protfolio-card"}>
            <div className="protfolio-card-padding">
                <div className="protfolio-card-content">
                    <div className="image-block">
                        <img src={image} />
                    </div>
                    <div className="wording-area">
                        <div className="text-block">
                            <div className="font-card-title">{name}</div>
                            {(text)?
                                <div className="font-card-text"
                                    dangerouslySetInnerHTML={{__html: text}}
                                >
                                </div>:""
                            }
                        </div>
                        {(link_live||link_github)?
                            <div className="link-block">
                                {(link_live)?
                                    <a href={link_live} className="font-card-icon font-card-icon--live" target="_blank" rel="nofollow noopener noreferrer">
                                        <i className="fa fa-desktop" aria-hidden="true"></i>
                                    </a>:""
                                }
                                {gitlinkbuild(link_github)}
                            </div>
                            :""
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

PortfolioCard.propTypes = {
    item: PropTypes.shape({
        image: PropTypes.string,
        text: PropTypes.string,
        link_live: PropTypes.string,
        link_github: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array,
        ]),
    }),
};
PortfolioCard.defaultProps = {
    item: {
        image: '',
        text: '',
        link_live: '',
        link_github: '',
    },
};

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
                                console.log(e.hidden)
                                if(e.hidden!==true){
                                    return (
                                        <PortfolioCard item={e} key={i} />
                                    )
                                }
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
};


export default Portfolio; 
