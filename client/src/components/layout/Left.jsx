import React from 'react'
import {boxShadow} from '../../style/defaultStyles'

import {FilterColors} from '../../style/defaultStyles'

const defaultWidth = '128px'
const defaultBackgroundColor = FilterColors.MEDIUM
const defaultColor = '#111'

const styleOpen = width => {
  return {
    color: defaultColor,
    backgroundColor: defaultBackgroundColor,
    transition: 'flex 0.2s linear',
    flex: '0 0 ' + width,
    width: width,
    minWidth: '3.236em',
    // position: 'relative',
    // overflow: 'hidden',
    boxShadow: boxShadow,
  }
}

const styleClosed = width => {
  return {
    backgroundColor: defaultBackgroundColor,
    transition: 'flex 0.2s linear',
    flex: '0 0 ' + width,
    width: width,
    position: 'relative',
    // overflow: 'initial',
    boxShadow: boxShadow,
  }
}

const Left = (props) => {
  // const [open, setOpen] = useState(props.open)

  // render
  const {content, open, visible} = props
  const width = props.width ? props.width : defaultWidth

  if (!visible) {
    return null
  }

  return (
    <div style={open ? styleOpen(width) : styleClosed(width)}>{content}</div>
  )
}
export default Left

// export default class Left extends React.Component {
//   componentWillMount() {
//     this.setState({
//       open: this.props.open,
//     })
//   }
//
//   componentWillReceiveProps(nextProps) {
//     if (nextProps.open !== this.state.open) {
//       this.setState(prevState => {
//         return {
//           ...prevState,
//           open: nextProps.open,
//         }
//       })
//     }
//   }
//
//   render() {
//     const {content, open, visible} = this.props
//     const width = this.props.width ? this.props.width : defaultWidth
//
//     if (!visible) {
//       return null
//     }
//
//     return (
//       <div style={open ? styleOpen(width) : styleClosed(width)}>{content}</div>
//     )
//   }
// }
