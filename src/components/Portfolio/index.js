import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPortfolioBegin } from '../../action/portfolio';
import PropTypes from 'prop-types';
import LazyImage from "../lazy-image.js";

const PortfolioCard = ({item}) => {
    const {
        project_name,
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
                        <LazyImage 
                            src={image} 
                            srcset={image} 
                            alt={project_name}
                        />
                    </div>
                    <div className="wording-area">
                        <div className="text-block">
                            <div className="font-card-title">{project_name}</div>
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
