import {connect} from 'react-redux'
import SearchFields from './SearchFields'
import {
  triggerSearch,
  clearFacets,
  clearCollections,
} from '../actions/SearchRequestActions'
import {removeDateRange, removeGeometry, updateQuery, updateSearch} from '../actions/SearchParamActions'
import {showCollections} from '../actions/FlowActions'

const mapStateToProps = state => {
  return {
    queryString: state.behavior.search.queryText
  }
}

const mapDispatchToProps = dispatch => {
  return {
    submit: () => {
      dispatch(clearFacets())
      dispatch(removeGeometry())
      dispatch(removeDateRange())
      dispatch(clearCollections())
      dispatch(triggerSearch())
      dispatch(showCollections())
    },
    updateQuery: text => dispatch(updateQuery(text)),
    clearSearch: () => dispatch(updateSearch()),
  }
}

const SearchFieldsContainer = connect(mapStateToProps, mapDispatchToProps)(
  SearchFields
)

export default SearchFieldsContainer
