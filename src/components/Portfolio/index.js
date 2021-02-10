import React, { useState, useEffect } from 'react';

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
    const [list] = useState([
        {
            years : '2021',
            protfolio_list : [
                {
                    name:'HTC desire 20plus',
                    image:'https://www.htc.com/media/filer_public/htc/shared/homepage/zh-tw/2020/sirocco/20201006_sirocco_homebanner_mobile.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                },
                {
                    name:'bayamo',
                    image:'https://www.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                },
                {
                    name:'bayamo',
                    image:'https://www.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                },
                {
                    name:'bayamo',
                    image:'https://www.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                },
                {
                    name:'bayamo',
                    image:'https://www.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                },
                {
                    name:'bayamo',
                    image:'https://www.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                }
            ]
        },
        {
            years : '2020',
            protfolio_list : [
                {
                    name:'vive-homepage-revamp',
                    image:'./img/2020-home-page-revamp.jpg',
                    link_live:'https://www.vive.com/tw/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                },
                {
                    name:'aorus',
                    image:'./img/2020-pdp-aorus.jpg',
                    link_live:'#',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                },
                {
                    name:'htc-desire20pro',
                    image:'./img/2020-pdp-desire20pro.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-20-pro/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                },
                {
                    name:'htc-sirocco',
                    image:'./img/2020-pdp-sirocco.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                },
                {
                    name:'htc-u20-5g',
                    image:'./img/2020-pdp-u20-5g.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-u20-5g/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                },
                {
                    name:'vive-bf-20',
                    image:'./img/2020-promotion-bf-20.jpg',
                    link_live:'#',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                }
            ]
        },
        {
            years : '2019',
            protfolio_list : [
                {
                    name:'vive-cosmos-2019',
                    image:'./img/2019-pdp-cosmos-2019.jpg',
                    link_live:'https://www.vive.com/us/product/vive-cosmos/features/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                },
                {
                    name:'htc-desire19s',
                    image:'./img/2019-pdp-desire19s.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                },
                {
                    name:'vive-vrs',
                    image:'./img/2019-pdp-vive-vrs.jpg',
                    link_live:'https://www.vive.com/us/vive-reality-system/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                },
                {
                    name:'htc-wildfire-e',
                    image:'./img/2019-pdp-wildfire-e.jpg',
                    link_live:'https://www.htc.com/af/smartphones/htc-wildfire-e/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                },
                {
                    name:'htc-wildfire-e1',
                    image:'./img/2019-pdp-wildfire-e1.jpg',
                    link_live:'https://www.htc.com/af/smartphones/htc-wildfire-e1-wildfire-e1-plus/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                },
                {
                    name:'htc-wildfire-op75',
                    image:'./img/2019-pdp-wildfire-op75.jpg',
                    link_live:'https://www.htc.com/in/smartphones/htc-wildfire-r70/',
                    link_github:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                }
            ]
        }
    ])
    useEffect(()=> {
        console.log('render 後執行');
        return () => {
            console.log(`render 移除後`);
        }
        //放空陣列只會在render後跑一次
    },[])
    useEffect(()=> {
        console.log(`state改變成 ${list}`);
        console.log(`========`);
        imageLoaded(list);
        return () => {
            console.log(`state改變前 ${list}`);
        }
    },[list])
    
    return (
        <div className="protfolio-content">
            {list.map((list,index)=>{
                return(
                    <div className="protfolio-list" key={index}>
                        <div className="protfolio-year">{list.years}</div>
                        {list.protfolio_list.map((e,i)=>{
                            return(
                                <div className={"protfolio-card"} key={i}>
                                    <div className="protfolio-card-padding">
                                        <div className="protfolio-card-content">
                                            <div className="image-block">
                                                <img src={e.image} />
                                            </div>
                                            <div className="link-block">
                                                <a href={e.link_live} target="_blank" rel="nofollow noopener noreferrer">
                                                    live site
                                                </a>
                                                <a href={e.link_github} target="_blank" rel="nofollow noopener noreferrer">
                                                    local site
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
};


export default Portfolio; 
