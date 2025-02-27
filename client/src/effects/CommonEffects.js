import React, {useState, useRef, useEffect} from 'react'
import ResizeObserver from 'resize-observer-polyfill'

export function usePrevious(value){
  const ref = useRef(null)
  useEffect(() => void (ref.current = value), [ value ])
  return ref.current
}

export function useMeasure(){
  const ref = useRef(null)
  const [ bounds, set ] = useState({left: 0, top: 0, width: 0, height: 0})
  const [ ro ] = useState(
    () =>
      new ResizeObserver(([ entry ]) => {
        set(entry.contentRect)
      })
  )
  useEffect(() => {
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ {ref}, bounds ]
}
