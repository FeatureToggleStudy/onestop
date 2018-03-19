import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Tabs from './Tabs'
import SummaryView from './SummaryView'
import DescriptionView from './DescriptionView'
import GranuleViewContainer from './GranuleTab/GranuleViewContainer'
import AccessView from './AccessView'
import VideoView from './VideoView'
import {boxShadow} from '../common/defaultStyles'

//-- Styles

const styleDetailWrapper = {
  color: 'black',
  maxWidth: '80em',
  width: '80em',
  boxShadow: boxShadow,
}

const styleTitle = {
  fontSize: '1.309em',
  margin: 0,
  padding: '1em',
  backgroundColor: '#034694',
  color: 'white',
}

const styleCenterContent = {
  display: 'flex',
  justifyContent: 'center',
}

//-- Component
class Detail extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {item, loading, totalGranuleCount} = this.props

    if (loading) {
      return (
        <div style={styleDetailWrapper}>
          <h1>Loading...</h1>
        </div>
      )
    }

    if (!item) {
      // TODO error style? actually report an error in the flow if the collection is not found when search returns?
      return (
        <div style={styleDetailWrapper}>
          <h1>There was a problem loading your collection.</h1>
        </div>
      )
    }

    let tabData = [
      {
        title: 'Summary',
        content: (
          <SummaryView item={item} totalGranuleCount={totalGranuleCount} />
        ),
      },
      {
        title: 'Description',
        content: <DescriptionView item={item} />,
      },
      {
        title: 'Access',
        content: <AccessView item={item} />,
      },
    ]

    if (totalGranuleCount > 0) {
      tabData.splice(2, 0, {
        title: 'Matching Files',
        content: <GranuleViewContainer item={item} />,
        action: this.showGranules,
      })
    }

    const videoLinks = item.links.filter(
      link => link.linkProtocol === 'video:youtube'
    )
    if (videoLinks.length > 0) {
      tabData.push({
        title: videoLinks.length === 1 ? 'Video' : 'Videos',
        content: <VideoView links={videoLinks} />,
      })
    }

    return (
      <div style={styleCenterContent}>
        <div style={styleDetailWrapper}>
          <h1 style={styleTitle}>{item.title}</h1>
          <Tabs style={{display: 'flex'}} data={tabData} activeIndex={0} />
        </div>
      </div>
    )
  }

  // None of this links stuff is being used in the new version of the collection view.
  // Preserving it for now because it may be needed for one of the tabs that we haven't added yet.

  // getLinks() {
  //   return (this.props && this.props.item && this.props.item.links) || [];
  // }

  // {/*{this.renderLinks('More Info', this.getLinksByType('information'), this.renderLink)}*/}
  // {/*{this.renderLinks('Data Access', this.getLinksByType('download'), this.renderLink)}*/}

  // getLinksByType(type) {
  //   return this.getLinks().filter(link => link.linkFunction === type);
  // }

  // renderLinks(label, links, linkRenderer) {
  //   if (!links || links.length === 0) {
  //     return <div />;
  //   }
  //
  //   return (
  //     <div className={'pure-g'}>
  //       <div className={`pure-u-1-6 ${styles.linkRow}`}>
  //         <span>{label}</span>
  //       </div>
  //       <div className={`pure-u-5-6 ${styles.linkRow}`}>
  //         <ul className={'pure-g'}>{links.map(linkRenderer)}</ul>
  //       </div>
  //     </div>
  //   );
  // }
  //
  // renderLink(link, index) {
  //   return (
  //     <li className={'pure-u'} key={index}>
  //       <A
  //         href={link.linkUrl}
  //         target="_blank"
  //         className={`pure-button pure-button-primary`}
  //       >
  //         {link.linkProtocol || 'Link'}
  //       </A>
  //     </li>
  //   );
  // }
}

Detail.propTypes = {
  item: PropTypes.object,
}

export default Detail
