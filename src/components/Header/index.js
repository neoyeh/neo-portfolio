
import React from 'react';
import { Switch, Route, Link, NavLink} from 'react-router-dom';


{/* useState */}
import ComponentUseState from '../ComponentUseState'; 
{/* useEffect */}
import { ComponentUseEffect1,ComponentUseEffect2 } from '../ComponentUseEffect'; 
{/* proptypes */}
import ComponentPropType from '../ComponentPropType';
{/* useContext */}
import ComponentContent from '../ComponentContent';
{/* redux */}
import ComponentRedux from '../ComponentRedux';
{/* redux&saga */}
import ComponentSaga from '../ComponentSaga';
{/* twitch img resize */}
import ComponentCard from '../ComponentCard';
{/* Router match */}
import ComponentRouterMatch from '../Content';
{/* React Testing Library */}
import ComponentTesting from '../Counter';
{/* React Testing Library */}
import Portfolio from '../Portfolio';




const Header = () => (
    <div>
        <div className="nav-bar">
            <ul className="nav-content">
                {/* <li><Link to="/componentUseState">ComponentUseState</Link></li>
                <li><Link to="/componentUseEffect1">ComponentUseEffect1</Link></li>
                <li><Link to="/componentUseEffect2">ComponentUseEffect2</Link></li>
                <li><Link to="/componentPropType">ComponentPropType</Link></li>
                <li><Link to="/componentContent">ComponentContent</Link></li>
                <li><Link to="/componentRedux">ComponentRedux</Link></li>
                <li><Link to="/componentSaga">ComponentSaga</Link></li>
                <li><Link to="/componentCard">ComponentCard</Link></li>
                <li><Link to={`/componentRouterMatch/test`}>ComponentRouterMatch</Link></li>
                <li><Link to={`/componentTesting`}>ComponentTesting</Link></li> */}

                <li>
                    <NavLink activeClassName="active" to="/ComponentUseState">
                        <i className="fa fa-user-o" aria-hidden="true"></i>
                        <span>首頁</span>    
                    </NavLink>
                </li>          
                <li>
                    <NavLink activeClassName="active" to={`/portfolio`}>
                        <i className="fa fa-cubes" aria-hidden="true"></i>
                        <span>作品</span>    
                    </NavLink>
                </li>         
                <li>
                    <NavLink activeClassName="active" to={`/ComponentUseEffect1`}>
                        <i className="fa fa-envelope-o" aria-hidden="true"></i>
                        <span>聯絡資訊</span>    
                    </NavLink>
                </li>
            </ul>
        </div>
        <div className="page"> 
            <Switch>
                <Route path="/componentUseState" component={ComponentUseState} />
                <Route path="/componentUseEffect1" component={ComponentUseEffect1} />
                <Route path="/componentUseEffect2" component={ComponentUseEffect2} />
                <Route path="/componentPropType" render={() => <ComponentPropType names={['1','2','3','4']} />} />
                <Route path="/componentContent" component={ComponentContent} />
                <Route path="/componentRedux" component={ComponentRedux} />
                <Route path="/componentSaga" component={ComponentSaga} />
                <Route path="/componentCard" component={ComponentCard} />
                <Route path="/componentRouterMatch/:taskName" component={ComponentRouterMatch} />
                <Route path="/componentTesting" component={ComponentTesting} />
                <Route path="/portfolio" component={Portfolio} />
            </Switch>
        </div>
    </div>
);

export default Header; 