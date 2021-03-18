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
                    name:'My Portfolio',
                    text:"個人作品集切版</br>Independent Work</br>React hook | Responsive Web Design",
                    image:'https://fakeimg.pl/700x345/',
                    link_github:'https://neoyeh.github.io/neo-portfolio/dist/#/about/',
                },
                {
                    name:'VIVE Tracker 3.0',
                    image:'./img/2021-pdp-tracker3.jpg',
                    text:"品牌產品頁面切版</br>Independent Work</br>Scrollmagic | Responsive Web Design",
                    link_live:'https://www.vive.com/us/accessory/tracker3/',
                    link_github:'#',
                },
                {
                    name:'Facial Tracker',
                    image:'./img/2021-pdp-facial-tracker.jpg',
                    text:"品牌產品頁面切版</br>Independent Work</br>Responsive Web Design",
                    link_live:'https://www.vive.com/us/accessory/facial-tracker/',
                    link_github:'#',
                }
            ]
        },
        {
            years : '2020',
            protfolio_list : [
                {
                    name:'VIVE Landing Page',
                    image:'./img/2020-home-page-revamp.jpg',
                    text:"品牌首頁切版</br>Team Work</br>Responsive Web Design",
                    link_live:'https://www.vive.com/tw/',
                    link_github:'#',
                },
                {
                    name:'Aorus',
                    image:'./img/2020-pdp-aorus.jpg',
                    text:"活動頁面切版(已下架)</br>Independent Work</br>Responsive Web Design",
                    link_github:'#',
                },
                {
                    name:'HTC Desire 20 Pro',
                    image:'./img/2020-pdp-desire20pro.jpg',
                    text:"品牌手機切版</br>Independent Work</br>Scrollmagic | Responsive Web Design",
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-20-pro/',
                    link_github:'#',
                },
                {
                    name:'HTC Desire 20 Plus',
                    image:'./img/2020-pdp-sirocco.jpg',
                    text:"品牌手機切版</br>Independent Work</br>Scrollmagic | Responsive Web Design",
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                    link_github:'#',
                },
                {
                    name:'HTC U20 5G',
                    image:'./img/2020-pdp-u20-5g.jpg',
                    text:"品牌手機切版</br>Independent Work</br>Scrollmagic | Responsive Web Design",
                    link_live:'https://www.htc.com/tw/smartphones/htc-u20-5g/',
                    link_github:'#',
                },
                {
                    name:'VIVE BlackFriday 2020',
                    image:'./img/2020-promotion-bf-20.jpg',
                    text:"品牌活動頁面切版(已下架)</br>Independent Work</br>Responsive Web Design",
                    link_github:'#',
                },
                {
                    name:'Suger PAPA',
                    image:'./img/2020-sugerpapa.jpg',
                    text:"交友網站切版</br>Independent Work</br>Bootstrap4 | Responsive Web Design",
                    link_live:'https://www.asugarpapa.com/',
                    link_github:'#',
                },
            ]
        },
        {
            years : '2019',
            protfolio_list : [
                {
                    name:'VIVE COSMOS',
                    image:'./img/2019-pdp-cosmos-2019.jpg',
                    text:"產品介紹頁切版</br>Team Work</br>Scrollmagic | Responsive Web Design",
                    link_live:'https://www.vive.com/us/product/vive-cosmos/features/',
                    link_github:'#',
                },
                {
                    name:'HTC Desire 19s',
                    image:'./img/2019-pdp-desire19s.jpg',
                    text:"品牌手機切版</br>Independent Work</br>Scrollmagic | Responsive Web Design",
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'#',
                },
                {
                    name:'VIVE Reality System 2019',
                    image:'./img/2019-pdp-vive-vrs.jpg',
                    text:"產品介紹頁切版</br>Independent Work</br>Responsive Web Design",
                    link_live:'https://www.vive.com/us/vive-reality-system/',
                    link_github:'#',
                },
                {
                    name:'HTC Wildfire e',
                    image:'./img/2019-pdp-wildfire-e.jpg',
                    text:"品牌手機切版</br>Independent Work</br>Responsive Web Design",
                    link_live:'https://www.htc.com/af/smartphones/htc-wildfire-e/',
                    link_github:'#',
                },
                {
                    name:'HTC Wildfire e1',
                    image:'./img/2019-pdp-wildfire-e1.jpg',
                    text:"品牌手機切版</br>Independent Work</br>Responsive Web Design",
                    link_live:'https://www.htc.com/af/smartphones/htc-wildfire-e1-wildfire-e1-plus/',
                    link_github:'#',
                },
                {
                    name:'HTC Wildfire OP75',
                    image:'./img/2019-pdp-wildfire-op75.jpg',
                    text:"品牌手機切版</br>Independent Work</br>Responsive Web Design",
                    link_live:'https://www.htc.com/in/smartphones/htc-wildfire-r70/',
                    link_github:'#',
                }
            ]
        },
        {
            years : '2018',
            protfolio_list : [
                {
                    name:'富宇地產',
                    text:"富宇地產品牌網站切版串接</br>Independent Work</br>Bootstrap4 | Responsive Web Design",
                    image:'./img/2018-fuyu-property.jpg',
                    link_live:'http://www.fuyu-property.com.tw/',
                    link_github:'https://neoyeh.github.io/neo_yeh/wip/fuyu_estate/',
                },
                {
                    name:'富宇建設',
                    text:"富宇建設品牌網站切版串接</br>Independent Work</br>Bootstrap4 | Responsive Web Design",
                    image:'./img/2018-fuyu-langing.jpg',
                    link_live:'http://www.fu-yu.com/',
                    link_github:'#',
                },
                {
                    name:'Shopping99 Mobile',
                    text:"電商平台網站切版(平台已改版)</br>Independent Work</br>Bootstrap4 | Adaptive Web Design",
                    image:'./img/2018-shopping99-mobile.jpg',
                    link_github:'http://www.onepiece8088.acsite.org/neooo/work/shopping99/',
                },
                {
                    name:'Shopping99 Desktop',
                    text:"電商平台網站切版(平台已改版)</br>Independent Work</br>Bootstrap4 | Adaptive Web Design",
                    image:'./img/2018-shopping99-desktop.jpg',
                    link_github:'http://www.onepiece8088.acsite.org/neooo/work/shopping99-web/',
                },
                {
                    name:'VASELINE',
                    text:"凡士林品牌官網(網頁已下架)</br>Independent Work</br>Bootstrap4 | Responsive Web Design",
                    image:'./img/2018-vaseline.jpg',
                    link_github:'http://www.onepiece8088.acsite.org/neooo/work/vaseline/',
                },
            ]
        },
        {
            years : '2017',
            protfolio_list : [
                {
                    name:'178人力銀行 Landing Page',
                    text:"178人力銀行官網首頁(網頁已改版)</br>Independent Work</br>Bootstrap4 | Responsive Web Design",
                    image:'./img/2017-178.jpg',
                    link_github:'http://www.onepiece8088.acsite.org/neooo/work/job178/',
                }
            ]
        },
        {
            years : '2016',
            protfolio_list : [
                {
                    name:'部落格 Template',
                    text:"公司內部部落格Template</br>Independent Work</br>Bootstrap3 | Responsive Web Design",
                    image:'./img/2016-blog1.jpg',
                    link_github:'http://www.onepiece8088.acsite.org/neooo/blog/blog1/',
                }
            ]
        }
    ]);
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
            {list.map((list,index)=>{
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
