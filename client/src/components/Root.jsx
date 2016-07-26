const logoPath = require('../../img/noaa_logo_circle_72x72.svg')

import React from 'react'
import DetailContainer from '../detail/DetailContainer'
import SearchContainer from '../search/SearchContainer'
import Breadcrumbs from 'react-breadcrumbs'
//import FacetContainer from '../facet/FacetContainer'
import Favicon from 'react-favicon'
import Footer from './Footer.jsx'
import Header from './Header.jsx'
import AlphaBanner from './AlphaBanner.jsx'
import styles from './root.css'


const Root = ({children, routes, params, location}) => {
    // Conditionally show some elements while not on main landing page
    let breadcrumbs, searchContainer
    if (location.pathname !== "/"){
        breadcrumbs = <Breadcrumbs
          routes={routes}
          params={params}
        />
        searchContainer = <SearchContainer/>
    }
    return <div>
      <Favicon url={["//www.noaa.gov/sites/all/themes/custom/noaa/favicon.ico"]}/>
      <AlphaBanner/>
      <DetailContainer/>
      <div className={styles.bottomBorder}>
        <div className={styles.panel}>
          <div className={'pure-g'}>
            <div className={'pure-u-3-5'}>
                <img className={styles.logo} id='logo' src={logoPath} alt="NOAA Logo"/>
                <div className={styles.orgBox}>
                    <a className={styles.orgName} href="/">National Oceanic and Atmospheric Administration</a>
                    <a className={styles.deptName} href="//www.commerce.gov">U.S. Department of Commerce</a>
                </div>
            </div>
            <div className={`pure-u-2-5 ${styles.searchFacet}`}>
                {searchContainer}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.breadCrumbs}>
      {breadcrumbs}
      </div>
      <div className={styles.results}>
          {children}
      </div>
      <Footer/>
    </div>
}


export default Root
