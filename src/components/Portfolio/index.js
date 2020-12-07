import React, { useState, useEffect } from 'react';

const showFunc = (list=[]) => {
    list.map((e,i)=>{
        const $ele = document.querySelector(`.protfolio-card--${i}`);
        const time = 1200/list.length;
        if($ele){
            setTimeout(() => {
                $ele.classList.add('done');
            }, 500+time*i);
        }
    });
}

const imageLoaded = (callback, callback_data) => {
    if(typeof(callback)!=='function') return;
    let imgs = document.images,
        len = imgs.length,
        counter = 0;
    const countFunc = () => {
        counter++
        if(counter===len){
            callback.call(this,callback_data);
        }
    }
    [].forEach.call( imgs, function( img ) {
        if(img.complete)
        countFunc
        else
        img.addEventListener( 'load', countFunc, false );
        img.addEventListener('error', function(e) {
            console.log(e,'image error')
            countFunc
        })
    } );
}
 

const Portfolio = () => {
    const [list] = useState([
        {
            name:'HTC desire 20plus',
            image:'https://www.htc.com/media/filer_public/htc/shared/homepage/zh-tw/2020/sirocco/20201006_sirocco_homebanner_mobile.jpg',
            link_live:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
            link_github:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
        },
        {
            name:'bayamo',
            image:'https://htc-cms.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
            link_live:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
            link_github:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
        },
        {
            name:'bayamo',
            image:'https://htc-cms.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
            link_live:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
            link_github:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
        },
        {
            name:'bayamo',
            image:'https://htc-cms.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
            link_live:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
            link_github:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
        },
        {
            name:'bayamo',
            image:'https://htc-cms.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
            link_live:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
            link_github:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
        },
        {
            name:'bayamo',
            image:'https://htc-cms.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
            link_live:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
            link_github:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
        },
        {
            name:'bayamo',
            image:'https://htc-cms.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
            link_live:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
            link_github:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
        },
        {
            name:'bayamo',
            image:'https://htc-cms.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
            link_live:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
            link_github:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
        },
        {
            name:'bayamo',
            image:'https://htc-cms.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
            link_live:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
            link_github:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
        },
        {
            name:'bayamo',
            image:'https://htc-cms.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
            link_live:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
            link_github:'https://htc-cms.htc.com/tw/smartphones/htc-desire-19s/',
        },
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
        imageLoaded(showFunc,list);
        return () => {
            console.log(`state改變前 ${list}`);
        }
    },[list])
    return (
        <div className="protfolio-content">
            <div className="protfolio-list">
                {list.map((e,i)=>{
                    return(
                        <div className={"protfolio-card--"+i+" protfolio-card"} key={i}>
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
        </div>
    )
};


export default Portfolio; 
