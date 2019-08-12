import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import Root from './Root'
import {setLeftWidth} from '../../actions/LayoutActions'

const mapStateToProps = state => {
  return {
    leftOpen: state.layout.leftOpen,
    rightOpen: state.layout.rightOpen,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    leftCallback: width => {
      dispatch(setLeftWidth(width))
    },
  }
}

const RootContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Root)
)

export default RootContainer
