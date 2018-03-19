import React, {Component} from 'react'

import Container from '../layout/Container'

import BannerContainer from './banner/BannerContainer'
import HeaderContainer from './HeaderContainer'
import MapContainer from '../search/map/MapContainer'

import FiltersContainer from '../filter/FiltersContainer'
import FiltersHiddenContainer from '../filter/FiltersHiddenContainer'

import LoadingBarContainer from '../loading/LoadingBarContainer'

import FooterContainer from './FooterContainer'
import styles from './root.css'

const pattern = require('../../img/topography.png')

const styleBackgroundImage = {
  background: `url(${pattern}) repeat`,
  backgroundSize: '50em',
}

const styleBackgroundGradient = {
  background:
    'linear-gradient(0deg, rgba(130, 186, 255, .5) 0%, rgba(225, 225, 235, .5) 100%)',
}

// component
export default class Root extends Component {
  constructor(props) {
    super(props)

    this.hasUnsupportedFeatures = this.hasUnsupportedFeatures.bind(this)
    this.location = props.location.pathname
    this.state = {
      leftVisible: true,
      rightVisible: false,
      tabCurrent: 'Search Results',
      browserWarning: this.hasUnsupportedFeatures(),
    }
  }

  componentWillUpdate(nextProps) {
    this.location = nextProps.location.pathname
  }

  hasUnsupportedFeatures() {
    let browserWarning = false
    const htmlClasses = document.documentElement.className.split(' ')
    htmlClasses.forEach(htmlClass => {
      if (htmlClass.startsWith('no-')) {
        browserWarning = true
        return
      }
    })
    return browserWarning
  }

  unsupportedBrowserWarning() {
    const wikiUrl =
      'https://github.com/cedardevs/onestop/wiki/OneStop-Client-Supported-Browsers'
    return (
      <aside role="alert" className={styles.browserWarning}>
        <span
          className={styles.close}
          onClick={() => {
            this.setState({browserWarning: false})
          }}
        >
          x
        </span>
        <p>
          The browser that you are using to view this page is not currently
          supported. For a list of currently supported & tested browsers, please
          visit the
          <span>
            {' '}
            <a href={wikiUrl}>OneStop Documentation</a>
          </span>
        </p>
      </aside>
    )
  }

  isNotLanding() {
    return this.location !== '/' && this.location !== '/508/'
  }

  isNot508() {
    return this.location.indexOf('508') === -1 // TODO move this to redux state
  }

  isAboutPage() {
    return (
      this.location.startsWith('/about') ||
      this.location.startsWith('/508/about')
    )
  }

  isHelpPage() {
    return (
      this.location.startsWith('/help') || this.location.startsWith('/508/help')
    )
  }

  homeUrl() {
    const {host, pathname} = location
    return `//${host}${pathname ? pathname : '/'}#/${this.isNot508()
      ? ''
      : '508/'}`
  }

  render() {
    const {showLeft, leftOpen, showRight, onDetailPage} = this.props

    const header = (
      <div>
        <BannerContainer />
        <HeaderContainer
          showSearch={this.isNotLanding() && this.isNot508()}
          homeUrl={this.homeUrl()}
        />
        {this.state.browserWarning ? this.unsupportedBrowserWarning() : <div />}
      </div>
    )

    const layoutContext =
      this.isNotLanding() && !this.isAboutPage() && !this.isHelpPage()

    let left = null
    let leftWidth = '256px'

    if (layoutContext) {
      if (showLeft) {
        if (leftOpen) {
          left = <FiltersContainer />
        }
        else {
          leftWidth = '2em' // must match width + 2x padding of container in FilterHidden.jsx
          left = <FiltersHiddenContainer />
        }
      }
    }

    const loadingBarStyle = this.isNotLanding() ? {} : {display: 'none'}

    const middle = (
      <div>
        <LoadingBarContainer style={loadingBarStyle} />
        {/*TODO: replace this with ArcGIS map?*/}
        <MapContainer selection={true} features={false} />
        {this.props.children}
      </div>
    )

    // constrain middle gives the middle section a max-width
    const middleMaxWidth = onDetailPage ? '1200px' : 'none'
    const middleBorder = onDetailPage ? '1em solid #333357' : 'none'
    const middleBackgroundColor = onDetailPage ? 'white' : 'initial'

    return (
      <div style={styleBackgroundImage}>
        <div style={styleBackgroundGradient}>
          <Container
            header={header}
            left={left}
            leftWidth={leftWidth}
            leftVisible={leftOpen}
            middle={middle}
            middleMaxWidth={middleMaxWidth}
            middleBorder={middleBorder}
            middleBackgroundColor={middleBackgroundColor}
            right={null}
            rightWidth={256}
            rightVisible={showRight}
            footer={<FooterContainer />}
          />
        </div>
      </div>
    )
  }
}
