import Immutable from 'seamless-immutable'
import {isDetailPage, isGranuleListPage} from '../utils/urlUtils'

import {
  TOGGLE_LEFT_OPEN,
  TOGGLE_RIGHT_OPEN,
  TOGGLE_MAP,
  SET_HEADER_MENU_OPEN,
  SHOW_GRANULE_VIDEO,
  SET_LEFT_WIDTH,
  INTERACTIVE_MAP_HEIGHT,
  SET_DRAWER_OPEN,
} from '../actions/LayoutActions'

import {LOCATION_CHANGE} from 'connected-react-router'

export const initialState = Immutable({
  showLeft: true,
  leftOpen: true,
  leftWidth: 0,
  showRight: false,
  showMap: false,
  showAppliedFilterBubbles: false,
  onDetailPage: false,
  headerMenuOpen: false,
  granuleVideo: null,
  interactiveMapHeight: 0,
  drawerOpen: false,
})

export const layout = (state = initialState, action) => {
  switch (action.type) {
    case INTERACTIVE_MAP_HEIGHT:
      return Immutable.set(state, 'interactiveMapHeight', action.height)
    case SET_LEFT_WIDTH:
      return Immutable.set(state, 'leftWidth', action.width)
    case LOCATION_CHANGE:
      if (!action.payload) {
        return state
      }
      const path = action.payload.pathname
      const onDetailPage = isDetailPage(path)
      const onGranuleListPage = isGranuleListPage(path)
      const allowSearching = !(onDetailPage || onGranuleListPage)
      return Immutable.merge(state, {
        showLeft: allowSearching,
        showAppliedFilterBubbles: allowSearching,
        // onDetailPage: onDetailPage,
      })
    case TOGGLE_LEFT_OPEN:
      return Immutable.set(state, 'leftOpen', action.open)
    case TOGGLE_RIGHT_OPEN:
      return Immutable.set(state, 'rightOpen', action.open)
    case TOGGLE_MAP:
      const previousShowMap = state.showMap
      return Immutable.set(state, 'showMap', !previousShowMap)
    case SHOW_GRANULE_VIDEO:
      return Immutable.set(state, 'granuleVideo', action.granuleVideo)
    case SET_HEADER_MENU_OPEN:
      return Immutable.set(state, 'headerMenuOpen', action.value)
    case SET_DRAWER_OPEN:
      return Immutable.set(state, 'drawerOpen', action.open)
    default:
      return state
  }
}

export default layout
