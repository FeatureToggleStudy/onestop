import React from 'react'
import {Route, Switch} from 'react-router'

import Layout from '../layout/Layout'

import DisclaimerContainer from '../disclaimer/DisclaimerContainer'
import HeaderContainer from '../header/HeaderContainer'
import FiltersContainer from '../filters/FiltersContainer'
import FiltersHiddenContainer from '../filters/FiltersHiddenContainer'
import ResultsContainer from '../results/ResultsContainer'
import ErrorContainer from '../error/ErrorContainer'
import LandingContainer from '../landing/LandingContainer'
import DetailContainer from '../collections/detail/DetailContainer'
import Help from '../help/Help'

import AboutContainer from '../about/AboutContainer'
import CartContainer from '../cart/CartContainer'

import CollectionGetDetailLoadingContainer from '../loading/CollectionGetDetailLoadingContainer'
import GranuleSearchLoadingContainer from '../loading/GranuleSearchLoadingContainer'
import CollectionSearchLoadingContainer from '../loading/CollectionSearchLoadingContainer'

import FooterContainer from '../footer/FooterContainer'

import {SiteColors} from '../../style/defaultStyles'
import {
  isHome,
  isSearch,
  validHomePaths,
  ROUTE,
  isGranuleListPage,
} from '../../utils/urlUtils'
import NotFoundContainer from '../404/NotFoundContainer'

import earth from '../../../img/Earth.jpg'
import {browserUnsupported} from '../../utils/browserUtils'
import CollectionMapContainer from '../filters/collections/CollectionMapContainer'

const styleBrowserWarning = {
  background: SiteColors.WARNING,
  textAlign: 'center',
  padding: '0.618em',
  fontSize: '1.2em',
}

const styleBrowserWarningLink = {
  color: 'rgb(169, 226, 255)',
}

const styleBrowserWarningParagraph = {
  textAlign: 'center',
}

// component
export default class Root extends React.Component {
  constructor(props) {
    super(props)
    // use state to prevent browser support check on every render
    this.state = {
      browserUnsupported: browserUnsupported(),
    }
  }

  browserUnsupportedWarning = () => {
    const wikiUrl =
      'https://github.com/cedardevs/onestop/wiki/OneStop-Client-Supported-Browsers'
    return (
      <aside role="alert" style={styleBrowserWarning}>
        <p style={styleBrowserWarningParagraph}>
          The browser that you are using to view this page is not currently
          supported. For a list of currently supported & tested browsers, please
          visit the
          <span>
            {' '}
            <a style={styleBrowserWarningLink} href={wikiUrl}>
              OneStop Documentation
            </a>
          </span>.
        </p>
      </aside>
    )
  }

  render() {
    const {location, leftOpen, rightOpen, leftCallback, showMap} = this.props

    const bannerVisible = isHome(location.pathname)
    const leftVisible = isSearch(location.pathname)
    const onGranuleListPage = isGranuleListPage(location.pathname)
    const rightVisible = false

    const hiddenAccessibilityHeading = (
      <Switch>
        <Route path={ROUTE.collections.path} exact>
          <h1 key="collection-result-title">Collection search results</h1>
        </Route>
        <Route path={ROUTE.granules.path}>
          <h1 key="granule-result-title">Granule search results</h1>
        </Route>
      </Switch>
    )

    const {open, display, height} = this.state
    const middle = (
      <div style={{width: '100%'}}>
        <Switch>
          {/*Each page inside this switch should have a Meta!*/}
          <Route path={`/:path(${validHomePaths.join('|')})`} exact>
            <LandingContainer />
          </Route>

          <Route path={ROUTE.details.path}>
            {/*TODO parameterize this path!*/}
            <div>
              <CollectionGetDetailLoadingContainer />
              <DetailContainer />
            </div>
          </Route>

          <Route path={ROUTE.granules.path}>
            <div>
              <GranuleSearchLoadingContainer />
              <ResultsContainer />
            </div>
          </Route>

          <Route path={ROUTE.collections.path}>
            <div>
              <CollectionSearchLoadingContainer />
              <ResultsContainer />
            </div>
          </Route>

          <Route path={ROUTE.about.path}>
            <AboutContainer />
          </Route>

          <Route path={ROUTE.help.path}>
            <Help />
          </Route>

          <Route path={ROUTE.cart.path}>
            <CartContainer />
          </Route>

          <Route path={ROUTE.error.path}>
            <ErrorContainer />
          </Route>

          {/* 404 not found */}
          <Route component={NotFoundContainer} />
        </Switch>
      </div>
    )

    // POPULATE LAYOUT
    if (this.state.browserUnsupported) {
      return this.browserUnsupportedWarning()
    }
    else {
      return (
        <Layout
          location={location}
          /* - Disclaimer - */
          disclaimer={<DisclaimerContainer />}
          /* - Header - */
          header={
            <HeaderContainer showSearchInput={!isHome(location.pathname)} />
          }
          /* - Banner - */
          bannerGraphic={earth}
          bannerHeight={'30em'}
          bannerArcHeight={'15em'}
          bannerVisible={bannerVisible}
          hiddenAccessibilityHeading={hiddenAccessibilityHeading}
          /* - Left - */
          left={
            leftOpen ? (
              <FiltersContainer />
            ) : (
              <FiltersHiddenContainer
                text={onGranuleListPage ? 'File Filters' : 'Collection Filters'}
              />
            )
          }
          leftWidth={leftOpen ? '20em' : '2em'}
          leftOpen={leftOpen}
          leftVisible={leftVisible}
          leftCallback={leftCallback}
          /* - Drawer - */
          drawer={<CollectionMapContainer selection={true} features={false} />}
          drawerOpen={showMap}
          onDrawerOpen={rect => {
            console.log('onDrawerOpen::rect', rect)
          }}
          /* - Middle - */
          middle={middle}
          /* - Right - */
          right={rightOpen ? null : null}
          rightWidth={rightOpen ? '20em' : '2em'}
          rightOpen={rightOpen}
          rightVisible={rightVisible}
          /* - Footer - */
          footer={<FooterContainer />}
        />
      )
    }
  }
}
