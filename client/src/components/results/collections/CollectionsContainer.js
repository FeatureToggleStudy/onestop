import {connect} from 'react-redux'
import {withRouter} from 'react-router'

import {submitCollectionSearchNextPage} from '../../../actions/routing/CollectionSearchRouteActions'
import {submitCollectionDetail} from '../../../actions/routing/CollectionDetailRouteActions'
import Collections from './Collections'

const mapStateToProps = state => {
  const {
    collections,
    totalCollectionCount,
    loadedCollectionCount,
    pageSize,
  } = state.search.collectionResult
  return {
    results: collections,
    totalHits: totalCollectionCount,
    returnedHits: loadedCollectionCount,
    collectionDetailFilter: state.search.collectionFilter, // just used to submit collection detail correctly
    pageSize,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    selectCollection: (id, filterState) => {
      dispatch(submitCollectionDetail(ownProps.history, id, filterState))
    },
    fetchMoreResults: () => {
      dispatch(submitCollectionSearchNextPage())
    },
  }
}

const CollectionsContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Collections)
)

export default CollectionsContainer
