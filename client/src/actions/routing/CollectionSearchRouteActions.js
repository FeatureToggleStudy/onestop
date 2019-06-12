import _ from 'lodash'
import {fetchCollectionSearch} from './AsyncHelpers'

import {
  assembleSearchRequest,
  encodeLocationDescriptor,
} from '../../utils/queryUtils'
import {ROUTE, isPathNew} from '../../utils/urlUtils'
import {
  collectionNewSearchRequested,
  collectionNewSearchResetFiltersRequested,
  collectionMoreResultsRequested,
  collectionNewSearchResultsReceived,
  collectionMoreResultsReceived,
  collectionSearchError,
  collectionUpdateQueryText,
} from './CollectionSearchStateActions'

const getFilterFromState = state => {
  return (state && state.search && state.search.collectionFilter) || {}
}

const isRequestInvalid = state => {
  const inFlight = state.search.collectionRequest.inFlight
  return inFlight
}

const collectionBodyBuilder = (filterState, requestFacets) => {
  const body = assembleSearchRequest(filterState, requestFacets)
  const hasQueries = body && body.queries && body.queries.length > 0
  const hasFilters = body && body.filters && body.filters.length > 0
  if (!(hasQueries || hasFilters)) {
    return undefined
  }
  return body
}

const newSearchSuccessHandler = dispatch => {
  return payload => {
    dispatch(
      collectionNewSearchResultsReceived(
        payload.meta.total,
        payload.data,
        payload.meta.facets
      )
    )
  }
}

const pageSuccessHandler = dispatch => {
  return payload => {
    dispatch(collectionMoreResultsReceived(payload.data))
  }
}

const collectionPromise = (
  dispatch,
  filterState,
  requestFacets,
  successHandler
) => {
  const body = collectionBodyBuilder(filterState, requestFacets)
  if (!body) {
    dispatch(collectionSearchError('Invalid Request'))
    return
  }
  return fetchCollectionSearch(body, successHandler(dispatch), e => {
    dispatch(collectionSearchError(e.errors || e))
  })
}

export const submitCollectionSearchWithQueryText = (history, queryText) => {
  return submitCollectionSearchWithFilter(history, {queryText: queryText})
}

export const submitCollectionSearchWithFilter = (history, filterState) => {
  // note: this updates the URL as well, it is not intended to be just a background search - make a new action if we need that case handled

  return async (dispatch, getState) => {
    if (isRequestInvalid(getState())) {
      return
    }
    dispatch(collectionNewSearchResetFiltersRequested(filterState))
    const updatedFilterState = getFilterFromState(getState())
    navigateToCollectionUrl(history, updatedFilterState)

    return collectionPromise(
      dispatch,
      updatedFilterState,
      true,
      newSearchSuccessHandler
    )
  }
}

export const submitCollectionSearch = history => {
  // note: this updates the URL as well, it is not intended to be just a background search - make a new action if we need that case handled

  return async (dispatch, getState) => {
    if (isRequestInvalid(getState())) {
      return
    }
    dispatch(collectionNewSearchRequested())
    const updatedFilterState = getFilterFromState(getState())
    navigateToCollectionUrl(history, updatedFilterState)

    return collectionPromise(
      dispatch,
      updatedFilterState,
      true,
      newSearchSuccessHandler
    )
  }
}

export const submitCollectionSearchNextPage = () => {
  // note that this function does *not* make any changes to the URL - including push the user to the collection view. it assumes that they are already there, and furthermore, that no changes to any filters that would update the URL have been made, since that implies a new search anyway

  return async (dispatch, getState) => {
    if (isRequestInvalid(getState())) {
      return
    }
    dispatch(collectionMoreResultsRequested())
    const updatedFilterState = getFilterFromState(getState())

    return collectionPromise(
      dispatch,
      updatedFilterState,
      false,
      pageSuccessHandler
    )
  }
}

const navigateToCollectionUrl = (history, filterState) => {
  const locationDescriptor = encodeLocationDescriptor(
    ROUTE.collections,
    filterState
  )
  if (
    !_.isEmpty(locationDescriptor.search) &&
    isPathNew(history.location, locationDescriptor)
  ) {
    history.push(locationDescriptor)
  }
}
