import React, {useEffect, useRef} from 'react'

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
    boxShadow: boxShadow,
  }
}

const Left = props => {
  const ref = useRef(null)
  useEffect(
    () => {
      if (!ref.current || !ref.current.getBoundingClientRect().width) return
      props.callback(ref.current.getBoundingClientRect().width)
    },
    [ ref.current ]
  )

  // render
  const {content, open, visible} = props
  const width = props.width ? props.width : defaultWidth

  if (!visible) {
    return null
  }

  return (
    <div ref={ref} style={open ? styleOpen(width) : styleClosed(width)}>
      {content}
    </div>
  )
}
export default Left
