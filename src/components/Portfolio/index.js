import React, { useState, useEffect } from 'react';

const showFunc = () => {
    [...document.querySelectorAll('.protfolio-card')].map((e,i)=>{
        const time = 1200/document.querySelectorAll('.protfolio-card').length;
        if(e){
            setTimeout(() => {
                e.classList.add('done');
            }, 500+time*i);
        }
    });
}

const imageLoaded = (list) => {
    // showFunc();
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
                                                <a href={e.link_live} target="_blank" rel="noreferrer noopener">
                                                    live site
                                                </a>
                                                <a href={e.link_github} target="_blank" rel="noreferrer noopener">
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
