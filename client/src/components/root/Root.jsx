import React from 'react'
import {Route, Switch} from 'react-router'

import Layout from '../layout/Layout'

import DisclaimerContainer from '../disclaimer/DisclaimerContainer'
import HeaderContainer from '../header/HeaderContainer'
import FiltersContainer from '../filters/FiltersContainer'
import FiltersHiddenContainer from '../filters/FiltersHiddenContainer'
import InteractiveMap from '../filters/spatial/InteractiveMap'
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

import {SiteColors, styles} from '../../style/defaultStyles'
import {isHome, isSearch, validHomePaths, ROUTE} from '../../utils/urlUtils'
import NotFoundContainer from '../404/NotFoundContainer'

import earth from '../../../img/Earth.jpg'
import {browserUnsupported} from '../../utils/browserUtils'

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

const styleMapSpacer = (open, display, height) => {
  return {
    transition: open // immediate transition
      ? 'height .5s 0.0s, width 0.2s 0.2s' // width needs to start opening before max-height completes, or the transitionEnd check will not be able to compute height
      : 'width 0.2s 0.2s, height 0.2s 0.4s',
    height: height,
    display: display,
  }
}

// component
export default class Root extends React.Component {
  constructor(props) {
    super(props)
    const {showMap} = this.props
    // use state to prevent browser support check on every render
    this.state = {
      browserUnsupported: browserUnsupported(),
      open: showMap,
      display: showMap ? 'block' : 'none',
      height: showMap ? 'initial' : '0em',
    }
  }

  componentWillReceiveProps(nextProps) {
    let {map} = this.state
    if (map) {
      map.invalidateSize()
    } // Necessary to redraw map which isn't initially visible

    if (this.props.showMap != nextProps.showMap) {
      this.setState(prevState => {
        const isOpen = prevState.open
        const isDisplayed = prevState.display === 'block'
        const shouldClose = isOpen && isDisplayed
        const shouldOpen = !isOpen && !isDisplayed

        // these transitions do occasionally have timing issues, but I've only seen them when rapidly toggling a single element on and off..
        if (shouldOpen) {
          setTimeout(
            () =>
              this.setState({
                height: this.props.mapHeight,
              }),
            15
          )
        }
        if (shouldClose) {
          setTimeout(() => this.setState({display: 'none'}), 500)
        }

        const immediateTransition = shouldOpen
          ? {display: 'block'}
          : shouldClose
            ? {
                height: '0em',
              }
            : {}
        return {open: !isOpen, ...immediateTransition}
      })
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
    const {
      location,
      leftOpen,
      rightOpen,
      leftCallback,
      showMap,
      mapHeight,
    } = this.props

    const bannerVisible = isHome(location.pathname)
    const leftVisible = isSearch(location.pathname)
    const rightVisible = false

    const titleRow = (
      <div style={styles.hideOffscreen}>
        <Switch>
          <Route path={ROUTE.collections.path} exact>
            <h1 key="collection-result-title">Collection search results</h1>
          </Route>
          <Route path={ROUTE.granules.path}>
            <h1 key="granule-result-title">Granule search results</h1>
          </Route>
        </Switch>
      </div>
    )

    const {open, display, height} = this.state
    const middle = (
      <div style={{width: '100%'}}>
        <div style={styleMapSpacer(open, display, height)} />
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
              <InteractiveMap />
              <ResultsContainer />
            </div>
          </Route>

          <Route path={ROUTE.collections.path}>
            <div>
              <CollectionSearchLoadingContainer />
              <InteractiveMap />
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
          title={titleRow}
          /* - Left - */
          left={leftOpen ? <FiltersContainer /> : <FiltersHiddenContainer />}
          leftWidth={leftOpen ? '20em' : '2em'}
          leftOpen={leftOpen}
          leftVisible={leftVisible}
          leftCallback={leftCallback}
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
