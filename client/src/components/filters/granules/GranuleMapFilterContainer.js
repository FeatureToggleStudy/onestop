import {connect} from 'react-redux'
import MapFilter from '../spatial/MapFilter'
import {
  granuleToggleExcludeGlobal,
  granuleUpdateGeometry,
  granuleRemoveGeometry,
} from '../../../actions/routing/GranuleSearchStateActions'
import {toggleMap} from '../../../actions/LayoutActions'
import {submitGranuleSearch} from '../../../actions/routing/GranuleSearchRouteActions'

import {withRouter} from 'react-router'

const mapStateToProps = state => {
  return {
    showMap: state.layout.showMap,
    geoJSON: state.search.granuleFilter.geoJSON,
    excludeGlobal: state.search.granuleFilter.excludeGlobal,
    leftOffset: state.layout.leftWidth,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleExcludeGlobal: () => {
      dispatch(granuleToggleExcludeGlobal())
    },
    submit: () => {
      dispatch(submitGranuleSearch(ownProps.history, ownProps.match.params.id))
    },
    toggleMap: () => {
      dispatch(toggleMap())
    },
    removeGeometry: () => dispatch(granuleRemoveGeometry()),
    handleNewGeometry: geoJSON => dispatch(granuleUpdateGeometry(geoJSON)),
  }
}

const GranuleMapFilterContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MapFilter)
)

export default GranuleMapFilterContainer
