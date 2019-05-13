import Immutable from 'seamless-immutable'
import {CLEAR_ERRORS, SET_ERRORS} from '../actions/ErrorActions'

import {COLLECTION_SEARCH_ERROR} from '../actions/search/CollectionRequestActions'
import {GRANULE_SEARCH_ERROR} from '../actions/search/GranuleRequestActions'
import {COLLECTION_GET_DETAIL_ERROR} from '../actions/get/CollectionDetailRequestActions'

export const initialState = Immutable(new Set())

const errors = (state = initialState, action) => {
  switch (action.type) {
    case SET_ERRORS:
      return Immutable(action.errors)

    case COLLECTION_SEARCH_ERROR:
    case GRANULE_SEARCH_ERROR:
    case COLLECTION_GET_DETAIL_ERROR:
      console.log(
        'error reducer got granule error! (note, this does not push to the error display page)',
        action.errors
      )
      return Immutable(action.errors)

    case CLEAR_ERRORS:
      return initialState

    default:
      return state
  }
}

export default errors
