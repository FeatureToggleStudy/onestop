import React, { useState, useEffect, useRef, useCallback } from "react"
import Button from "../input/Button";
import gridIcon from 'fa/th.svg'
import listIcon from 'fa/th-list.svg'

const styleListView = {
  marginLeft: '1.618em',
}

const styleListControl = {
  display: 'flex',
  padding: '0.618em',
  backgroundColor: 'rgba(0,0,0, 0.2)',
  borderRadius: '0.309em',
  margin: '0 1.618em 1.618em 0',
}

const styleControlButtonIcon = {
  width: '1em',
  height: '1em',
  marginRight: '0.309em',
}

const styleGrid = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'flex-start',
  alignContent: 'flex-start',
}

const styleList = {
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
}

const styleFallbackItem = {
  display: 'block',
  margin: '0 1.618em 0 0',
}

const styleFocusDefault = {
  outline: 'none',
  border: '.1em dashed white', // ems so it can be calculated into the total size easily - border + padding + margin of this style must total the same as padding in styleOverallHeading, or it will resize the element when focus changes
  padding: '.259em',
  margin: '.259em',
}

function mapFromObject(obj) {
  function* entries(obj) {
    for (let key in obj)
      yield [key, obj[key]]
  }
  return new Map(entries(obj))
}

function useHookWithRefCallback(setFocusKey) {

  const ref = useRef(null)
  let focusKey = null

  const setRef = useCallback(node => {
    if (ref.current) {
      // Make sure to cleanup any events/references added to the last instance
    }

    if (node) {
      // console.log("node.props", node.props)
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
      if(node.props && node.props.itemId && node.props.itemId) {
        if(setFocusKey) {
          setFocusKey(node.props.itemId)
        }
      }
    }

    // Save a reference to the node
    ref.current = node
  }, []) // TODO: set `node` id/key in inputs here? -- to take advantage of useCallback memoization


  return [setRef]
}

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

function onPaging(prev, curr) {

  // in all likelihood, this JS object guarantees key insertion order, but as a safety and
  // as a mechanism to efficiently iterate through each key/item and handle internal component
  // state for more robust paging, we explicitly convert our items object into a Map
  // const itemsMap = mapFromObject(items)

  // there is no such thing as previous items initially, so in that case it's treated as an empty Map
  // const itemsMapPrevious = previous ? mapFromObject(previous.items) : new Map()

  // check if the keys are exactly the same

  // if previous keys contains a key not in current keys, this is an indication that the data provider
  // changed underneath us from then to now, and we can't reliably know where to focus if we were focused
  // on something that no longer exists in the current list


  // if current keys contains a key not in previous, this indicates the new items that belong in the next
  // "page" and gives us reference point for where to focus now

  // if the number of new unique items is zero,
}

function useBuckets(items) {

  const [itemsMap, setItemsMap] = useState(new Map())
  const previous = usePrevious({items})
  const [itemsMapPrevious, setItemsMapPrevious] = useState(new Map())

  function x(){
    // USE CASES:
    // 1) Nominal
    // prev req: { a: ..., [b]: ... }
    // curr req: { a: ..., b: ..., [[c]]: ..., d: ... }



    // 2) Missing Data From Previous Request
    // if focus was on [b], this case should focus on the first element (since the elements changed anyway
    // possibly: notify user that the request lost something?
    // prev req: { a: ..., [b]: ... }
    // curr req: { a: ..., [[c]]: ..., d: ... }

    // 2) Extra Data Not In Previous Request
    // Notes: how can we know that `x` isn't legitimately part of the new data?
    // We need to know the expected page size, but even that can deceive if we are on the
    // So...
    // (length - prev.length) > pageSize ===> more results than we expect to see on change
    // (length - prev.length) <= 0 ===> there are less results than we started with ???
    // (length - prev.length) == 0 ===>
    // prev req: { a: ..., b: ... }
    // curr req: { a: ..., b: ..., x: ... , c: ..., d: ...}

  }

  useEffect(() => {
    console.log("ListView updated it's items")
    setItemsMap(mapFromObject(items))
    setItemsMapPrevious(mapFromObject(previous ? previous.items : {}))
    // onPaging(mapFromObject(items), previous ? mapFromObject(previous.items) : new Map())
  }, [items])

  console.log("itemsMap", itemsMap)
  console.log("itemsMapPrevious", itemsMapPrevious)

  return { itemsMap, itemsMapPrevious }
}


const ListViewFxnal = (props) => {

  const { items, onItemSelect, ListItemComponent, GridItemComponent, propsForItem  } = props

  const {itemsMap, itemsMapPrevious} = useBuckets(items)





  const [showAsGrid, setShowAsGrid] = useState(!!GridItemComponent)
  const [focusing, setFocusing] = useState(false)
  const [focusKey, setFocusKey] = useState(null)

  const [focusItemRef] = useHookWithRefCallback(setFocusKey)
  // console.log('focusKey:', focusKey)
  // console.log('previous:', previous)






  // RENDER
  const toggleGridAvailable = ListItemComponent && GridItemComponent

  let controlElement = null
  if (toggleGridAvailable) {
    controlElement = (
      <div style={styleListControl}>
        <Button
          text={showAsGrid ? 'Show List' : 'Show Grid'}
          icon={showAsGrid ? listIcon : gridIcon}
          styleIcon={styleControlButtonIcon}
          onClick={() => setShowAsGrid(!showAsGrid)}
        />
      </div>
    )
  }

  let itemElements = []

  // // in all likelihood, this JS object guarantees key insertion order, but as a safety and
  // // as a mechanism to efficiently iterate through each key/item and handle internal component
  // // state for more robust paging, we explicitly convert our items object into a Map
  // const itemsMap = mapFromObject(items)
  //
  // // there is no such thing as previous items initially, so in that case it's treated as an empty Map
  // const itemsMapPrevious = previous ? mapFromObject(previous.items) : new Map()
  //
  // // handle the infinite "show more" (not yet a scroll effect) consistently
  // // cases where underlying data changes between requests can cause some erratic behavior
  // // this step allows more reliable focusing on the new data by simulating an internal state of
  // // buckets when comparing the previous state's keys to the new state's keys
  // // this behavior relies on the fact that "items" passed into this `ListView` are uniquely
  // // keyed, regardless of if the data underneath that key has changed


  const previousLength = itemsMapPrevious ? itemsMapPrevious.size : 0

  itemsMap.forEach((item, key) => {

    if(key === focusKey) {
      // console.log("key === focusKey = ", key)
    }

    Object.keys(items).length

    const isNextFocus =
      previousLength > 0 &&
      previousLength === itemElements.length

    if(isNextFocus) {
      // console.log(`isNextFocus:${isNextFocus}, focusKey:${focusKey}`)
    }

    const styleFocused = {
      ...(focusing ? styleFocusDefault : {}),
    }

    const styleOverallItemApplied = {
      ...styleFallbackItem,
      ...styleFocused,
    }
    let itemElement = null

    const itemProps = propsForItem ? propsForItem(item, key, key === focusKey) : null

    // list item element
    if (!showAsGrid && ListItemComponent) {
      itemElement = (
        <ListItemComponent
          itemId={key}
          item={item}
          key={key}
          ref={isNextFocus ? focusItemRef : null}
          onClick={() => {
            console.log("onClick")
            onItemSelect(key)}
          }
          // make this a callback to allow the user control over the prop name so that it's not dictated by ListView
          // e.g. - listItemShouldFocus = key => {  }
          shouldFocus={isNextFocus}
          {...itemProps}
        />
      )
    }
    // grid item element
    else if (showAsGrid && GridItemComponent) {
      itemElement = (
        <GridItemComponent
          item={item}
          key={key}
          ref={isNextFocus ? focusItemRef : null}
          onClick={() => {
            onItemSelect(key)}
          }          // make this a callback to allow the user control over the prop name so that it's not dictated by ListView
          shouldFocus={isNextFocus}
          {...itemProps}
        />
      )
    }
    // default item element
    else {
      itemElement = (
        <div
          key={key}
          tabIndex={-1}
          ref={isNextFocus ? focusItemRef : null}
          style={styleOverallItemApplied}
          onFocus={() => setFocusing(true)}
          onBlur={() => setFocusing(false)}
        >
          {key}
        </div>
      )
    }
    itemElements.push(itemElement)
  })

  return (
    <div style={styleListView}>
      {controlElement}
      <div style={showAsGrid ? styleGrid : styleList}>
        {itemElements}
      </div>
    </div>
  )
}

export default ListViewFxnal