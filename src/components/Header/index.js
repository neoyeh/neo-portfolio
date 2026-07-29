import React, { Suspense } from 'react';
import {
  Switch, Route, NavLink,
} from 'react-router-dom';

import About from '../About';

// React Portfolio
const Portfolio = React.lazy(() => import('../Portfolio'));

// Three js
const ThreeJsWork = React.lazy(() => import('../ThreeJsWork'));
const CreeperContent = React.lazy(() => import('../CreeperContent'));

function Header() {
  return (
      <div>
          <div className="nav-bar">
              <ul className="nav-content">
                  {/* <li>
                    <NavLink activeClassName="active" to="/about">
                        <i className="fa fa-user-o" aria-hidden="true"></i>
                        <span>首頁</span>
                    </NavLink>
                </li>           */}
                  <li>
                      <NavLink exact activeClassName="active" to="/">
                          <i className="fa fa-cubes" aria-hidden="true" />
                          <span>Projects</span>
                      </NavLink>
                  </li>
                  {/* <li>
                    <NavLink activeClassName="active" to={`/threeJsWork`}>
                        <i className="fa fa-cube" aria-hidden="true"></i>
                        <span>3D</span>
                    </NavLink>
                </li>    */}
                  {/* <li>
                    <NavLink activeClassName="active" to={`/creeperContent`}>
                        <i className="fa fa-cube" aria-hidden="true"></i>
                        <span>Creeper</span>
                    </NavLink>
                </li> */}
                  {/* <li>
                    <NavLink activeClassName="active" to={`/portfolio`}>
                        <i className="fa fa-cubes" aria-hidden="true"></i>
                        <span>作品</span>
                    </NavLink>
                </li>           */}
                  {/* <li>
                    <NavLink activeClassName="active" to={`/ComponentUseEffect1`}>
                        <i className="fa fa-envelope-o" aria-hidden="true"></i>
                        <span>聯絡資訊</span>
                    </NavLink>
                </li> */}
              </ul>
          </div>
          <div className="page">
              <Suspense fallback={<div>Loading...</div>}>

                  <Switch>
                      <Route path="/about" component={About} />
                      <Route path="/threeJsWork" component={ThreeJsWork} />
                      <Route path="/creeperContent" component={CreeperContent} />
                      <Route path="/portfolio" component={Portfolio} />
                      <Route path="/" component={Portfolio} />
                  </Switch>
              </Suspense>

          </div>
      </div>
  );
}

export default Header;
