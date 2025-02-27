import React, {useState, useReducer, useContext, useRef, useEffect} from 'react'
import {useSpring, useChain, animated} from 'react-spring'
import {useMeasure, usePrevious} from '../../effects/CommonEffects'

const Drawer = ({
  content,
  springDownConfig,
  springOverConfig,
  height,
  heightUnit,
  noWrap,
  open,
  onOpen,
  onClose,
}) => {
  const defaultSpringConfig = {
    mass: 1,
    tension: 300,
    friction: 1,
    clamp: true,
    velocity: 10,
  }
  const downConfig = springDownConfig ? springDownConfig : defaultSpringConfig
  const overConfig = springOverConfig ? springOverConfig : defaultSpringConfig

  // until refactor
  const drawer = {
    open: open,
  }

  const [ down, setDown ] = useState(drawer.open)
  const [ bind, measure ] = useMeasure()
  const viewHeight = measure.height
  const previousOpen = usePrevious(drawer.open)

  const heightValue = parseFloat(height)
  const validHeightUnits = [
    'cm',
    'mm',
    'in',
    'px',
    'pt',
    'pc',
    'em',
    'ex',
    'ch',
    'rem',
    'vw',
    'vh',
    'vmin',
    'vmax',
    '%',
  ]
  const heightUnitValue = validHeightUnits.includes(heightUnit)
    ? heightUnit
    : 'px'

  const fromHeight = 0
  // if height provided, stop spring there, otherwise, use dynamic `viewHeight` from ResizeObserver
  const toHeight =
    drawer.open || down
      ? height && height !== 'auto' ? heightValue : viewHeight
      : 0
  const downRef = useRef()
  const {springHeight} = useSpring({
    from: {springHeight: fromHeight},
    to: {springHeight: toHeight},
    onRest: () => {
      setDown(drawer.open)
      if (!drawer.open && !down) {
        if (onClose) {
          onClose()
        }
      }
    },
    config: downConfig,
    ref: downRef,
  })

  const overRef = useRef()
  const {springFractionalUnit} = useSpring({
    from: {springFractionalUnit: 0},
    // don't trigger until all the way down
    to: {springFractionalUnit: down ? 1 : 0},
    onRest: () => {
      if (drawer.open && down) {
        if (onOpen) {
          const rect = bind.ref.current.getBoundingClientRect()
          onOpen(rect)
        }
      }
    },
    config: overConfig,
    ref: overRef,
  })

  // chain animations and reverse the chain when drawer is closing
  useChain(
    drawer.open
      ? [ {current: downRef.current}, {current: overRef.current} ]
      : [ {current: overRef.current}, {current: downRef.current} ]
  )

  const styleContent = {
    overflow: 'hidden',
    whiteSpace: noWrap ? 'nowrap' : 'initial',
  }

  // Target Height:
  // open:
  //   a) if fixed height provided, target that
  //   b) if no height specified, use 'auto' for dynamic target
  // closed:
  //    -  always relative to spring animation
  const heightTarget =
    drawer.open && previousOpen === drawer.open
      ? height ? `${heightValue}${heightUnitValue}` : 'auto'
      : springHeight.interpolate(h => `${h}${heightUnitValue}`)

  // Target Width (using grid column fractional unit `fr`)
  //   - always relative to spring animation (`0fr` -> 0% width, `1fr` -> 100% width)
  const widthTarget = springFractionalUnit.interpolate(fr => `${fr}fr`)
  return (
    <animated.div
      style={{
        overflow: 'hidden',
        height: heightTarget,
      }}
    >
      <div {...bind}>
        <animated.div
          style={{
            display: 'grid',
            width: '100%',
            gridTemplateColumns: widthTarget,
          }}
        >
          <div style={styleContent} children={content} />
        </animated.div>
      </div>
    </animated.div>
  )
}

export default Drawer // TODO move me to common!
