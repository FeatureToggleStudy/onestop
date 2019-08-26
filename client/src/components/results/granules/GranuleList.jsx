import React from 'react'
import PropTypes from 'prop-types'
import GranuleListLegend from './GranuleListLegend'
import Button from '../../common/input/Button'
import ListView from '../../common/ui/ListView'
import ListViewFxnal from '../../common/ui/ListViewFxnal'
import GranuleListResultContainer from './GranuleListResultContainer'
import {identifyProtocol} from '../../../utils/resultUtils'
import {boxShadow, SiteColors} from '../../../style/defaultStyles'
import Meta from '../../helmet/Meta'
import _ from 'lodash'
import cartIcon from '../../../../img/font-awesome/white/svg/shopping-cart.svg'

const styleCenterContent = {
  display: 'flex',
  justifyContent: 'center',
}

const styleGranuleListWrapper = {
  maxWidth: '80em',
  width: '80em',
  boxShadow: boxShadow,
  marginRight: '3px',
  marginLeft: '1px',
  backgroundColor: 'white',
  color: '#222',
}

const styleShowMore = {
  margin: '1em auto 1.618em auto',
}
const styleShowMoreFocus = {
  outline: '2px dashed #5C87AC',
  outlineOffset: '.118em',
}

const styleAddFilteredGranulesToCart = {
  display: 'flex',
  alignItems: 'center',
  margin: '1.618em',
}

const styleAddFilteredGranulesToCartButton = {
  flexShrink: 0,
  height: 'fit-content',
}

const styleAddFilteredGranulesToCartButtonIcon = {
  width: '1em',
  height: '1em',
}

const styleAddFilteredGranulesToCartButtonText = {
  paddingRight: '0.309em',
}

const styleAddFilteredGranulesToCartButtonFocus = {
  outline: '2px dashed #5C87AC',
  outlineOffset: '.118em',
}

const styleWarning = warning => {
  if (_.isEmpty(warning)) {
    return {
      display: 'none',
    }
  }
  else {
    return {
      color: SiteColors.WARNING,
      marginLeft: '1em',
      fontWeight: 'bold',
      fontSize: '1.15em',
    }
  }
}

export default class GranuleList extends React.Component {
  isGranuleSelected = itemId => {
    const {selectedGranules} = this.props
    const checkIt = Object.keys(selectedGranules).includes(itemId)
    return checkIt
  }

  handleCheckboxChange = (itemId, item) => {
    const {selectGranule, deselectGranule} = this.props
    return checkbox => {
      if (checkbox.checked) {
        selectGranule(item, itemId)
      }
      else {
        deselectGranule(itemId)
      }
    }
  }

  handleSelectAll = () => {
    const {results, selectVisibleGranules} = this.props
  }

  propsForGranule = (item, itemId, shouldFocus = false) => {

    if(shouldFocus) {
      console.log("propsForGranule received shouldFocus = true for item == ", item)
    }

    const {featuresEnabled} = this.props

    return {
      showLinks: true,
      showTimeAndSpace: true,
      handleCheckboxChange: this.handleCheckboxChange,
      checkGranule: this.isGranuleSelected(itemId),
      featuresEnabled: featuresEnabled,
      shouldFocus: shouldFocus
    }
  }

  render() {
    const {
      results,
      returnedHits,
      totalHits,
      fetchMoreResults,
      addFilteredGranulesToCart,
      addFilteredGranulesToCartWarning,
      collectionTitle,
      granuleFilter,
    } = this.props

    // keep track of used protocols in results to avoid unnecessary legend keys
    const usedProtocols = new Set()
    _.forEach(results, value => {
      //

      _.forEach(value.links, link => {
        // if(link.linkFunction.toLowerCase() === 'download' || link.linkFunction.toLowerCase() === 'fileaccess') {
        return usedProtocols.add(identifyProtocol(link))
        // }
      })
    })

    const showMoreButton =
      returnedHits < totalHits ? (
        <Button
          text="Show More Results"
          onClick={() => fetchMoreResults()}
          style={styleShowMore}
          styleFocus={styleShowMoreFocus}
        />
      ) : null

    // console.log("results", results)

    return (
      <div style={styleCenterContent}>
        <Meta
          title={`Files for Collection ${collectionTitle}`}
          formatTitle={true}
          robots="noindex"
        />

        <div style={styleGranuleListWrapper}>
          <div style={styleAddFilteredGranulesToCart}>
            <Button
              icon={cartIcon}
              iconAfter={true}
              styleIcon={styleAddFilteredGranulesToCartButtonIcon}
              text="Add Matching to Cart"
              onClick={() => addFilteredGranulesToCart(granuleFilter)}
              style={styleAddFilteredGranulesToCartButton}
              styleFocus={styleAddFilteredGranulesToCartButtonFocus}
              styleText={styleAddFilteredGranulesToCartButtonText}
            />
            <div
              key="GranuleList::Warning"
              style={styleWarning(addFilteredGranulesToCartWarning)}
              role="alert"
            >
              {addFilteredGranulesToCartWarning}
            </div>
          </div>

          <GranuleListLegend usedProtocols={usedProtocols} />
          <ListViewFxnal
            items={results}
            onItemSelect={(key) => {console.log("ListViewFxnal::onItemSelect::key", key)}}
            ListItemComponent={GranuleListResultContainer}
            GridItemComponent={null}
            propsForItem={this.propsForGranule}
          />
          {/*<ListView*/}
          {/*  items={results}*/}
          {/*  resultType="collection files"*/}
          {/*  shown={returnedHits}*/}
          {/*  total={totalHits}*/}
          {/*  onItemSelect={selectCollection}*/}
          {/*  ListItemComponent={GranuleListResultContainer}*/}
          {/*  GridItemComponent={null}*/}
          {/*  propsForItem={this.propsForGranule}*/}
          {/*/>*/}

          {showMoreButton}
        </div>
      </div>
    )
  }
}

GranuleList.propTypes = {
  results: PropTypes.object.isRequired,
  totalHits: PropTypes.number.isRequired,
  returnedHits: PropTypes.number.isRequired,
}
