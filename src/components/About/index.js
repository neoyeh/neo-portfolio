import React, { useState, useEffect } from 'react';
import moment from "moment";



const About = () => {
    const [list] = useState([
        {
            years : '2021',
            protfolio_list : [
                {
                    name:'HTC desire 20plus',
                    image:'https://www.htc.com/media/filer_public/htc/shared/homepage/zh-tw/2020/sirocco/20201006_sirocco_homebanner_mobile.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                    link_github:'#',
                },
                {
                    name:'bayamo',
                    image:'https://www.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'#',
                },
                {
                    name:'bayamo',
                    image:'https://www.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'#',
                },
                {
                    name:'bayamo',
                    image:'https://www.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'#',
                },
                {
                    name:'bayamo',
                    image:'https://www.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'#',
                },
                {
                    name:'bayamo',
                    image:'https://www.htc.com/media/filer_public/htc/fed-assets/phone2020/img/bayamo-pdp-kv-m.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'#',
                }
            ]
        },
        {
            years : '2020',
            protfolio_list : [
                {
                    name:'VIVE Homepage',
                    image:'./img/2020-home-page-revamp.jpg',
                    link_live:'https://www.vive.com/tw/',
                    link_github:'#',
                },
                {
                    name:'Aorus',
                    image:'./img/2020-pdp-aorus.jpg',
                    link_live:'#',
                    link_github:'#',
                },
                {
                    name:'HTC Desire 20 Pro',
                    image:'./img/2020-pdp-desire20pro.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-20-pro/',
                    link_github:'#',
                },
                {
                    name:'HTC Desire 20 Plus',
                    image:'./img/2020-pdp-sirocco.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-20-plus/',
                    link_github:'#',
                },
                {
                    name:'HTC U20 5G',
                    image:'./img/2020-pdp-u20-5g.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-u20-5g/',
                    link_github:'#',
                },
                {
                    name:'VIVE BlackFriday 2020',
                    image:'./img/2020-promotion-bf-20.jpg',
                    link_live:'#',
                    link_github:'#',
                }
            ]
        },
        {
            years : '2019',
            protfolio_list : [
                {
                    name:'VIVE COSMOS',
                    image:'./img/2019-pdp-cosmos-2019.jpg',
                    link_live:'https://www.vive.com/us/product/vive-cosmos/features/',
                    link_github:'#',
                },
                {
                    name:'HTC Desire 19s',
                    image:'./img/2019-pdp-desire19s.jpg',
                    link_live:'https://www.htc.com/tw/smartphones/htc-desire-19s/',
                    link_github:'#',
                },
                {
                    name:'VIVE Reality System 2019',
                    image:'./img/2019-pdp-vive-vrs.jpg',
                    link_live:'https://www.vive.com/us/vive-reality-system/',
                    link_github:'#',
                },
                {
                    name:'HTC Wildfire e',
                    image:'./img/2019-pdp-wildfire-e.jpg',
                    link_live:'https://www.htc.com/af/smartphones/htc-wildfire-e/',
                    link_github:'#',
                },
                {
                    name:'HTC Wildfire e1',
                    image:'./img/2019-pdp-wildfire-e1.jpg',
                    link_live:'https://www.htc.com/af/smartphones/htc-wildfire-e1-wildfire-e1-plus/',
                    link_github:'#',
                },
                {
                    name:'HTC Wildfire OP75',
                    image:'./img/2019-pdp-wildfire-op75.jpg',
                    link_live:'https://www.htc.com/in/smartphones/htc-wildfire-r70/',
                    link_github:'#',
                }
            ]
        }
    ])
    const years = moment().diff('1991-08-08', 'years');
    useEffect(()=> {
        console.log('render 後執行');
        console.log(years);
        return () => {
            console.log(`render 移除後`);
        }
        //放空陣列只會在render後跑一次
    },[])
    useEffect(()=> {
        console.log(`state改變成 ${list}`);
        console.log(`========`);
        return () => {
            console.log(`state改變前 ${list}`);
        }
    },[list])
    
    return (
        <div className="protfolio-content">
            {years}
        </div>
    )
};


export default About; 
