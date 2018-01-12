import React from 'react'
import ReactDOM from 'react-dom'
import watch from 'redux-watch'
import store from '../../store'
import L from 'leaflet'
import 'esri-leaflet'
import 'leaflet-draw'
import _ from 'lodash'

const styleMapContainer = (showMap, forceShow) => {
  return {
    boxSizing: 'border-box',
    backgroundColor: '#3D97D2',
    transition: (showMap || forceShow)
      ? 'height 0.2s 0.0s, padding 0.1s 0.2s, width 0.2s 0.3s'
      : 'width 0.2s 0.0s, padding 0.1s 0.2s, height 0.2s 0.3s',
    padding: (showMap && !forceShow) ? '1em' : '0em',
    height: (showMap || forceShow) ? '400px' : '0px',
    width: (showMap || forceShow) ? '100%' : '0%',
  }
}

const styleMap = (showMap, forceShow) => {
  return {
    zIndex: forceShow ? 2 : 1,
    padding: 0,
    margin: 0,
    display: (showMap || forceShow) ? 'flex' : 'none',
    position: 'relative',
    height: '100%',
    alignItems: 'flex-start',
  }
}

class Map extends React.Component {
  constructor(props) {
    super(props)
    this.removeGeometry = props.removeGeometry
    this.geoJsonSelection = props.geoJsonSelection
    this.geoJsonFeatures = props.geoJsonFeatures
    this.focusedFeatures = props.focusedFeatures
    this.style = props.style
    this.mapDefaults = this.mapDefaults.bind(this)
    this.state = {
      _initialized: false,
    }
  }

  handleTransitionEnd = event => {
    // this ensures the map tiles get loaded properly around the animation
    if (event.propertyName === 'height' || event.propertyName === 'width') {
      this.state.map.invalidateSize()
    }
  }

  componentDidMount() {
    this.mapContainerNode.addEventListener(
      'transitionend',
      this.handleTransitionEnd
    )

    // Build the map defaults. When finished, use them to set the state then set up the map
    Promise.resolve(this.mapDefaults()).then(state => {
      this.setState(state, () => {
        let { geoJsonSelection } = this.props
        if (geoJsonSelection) {
          let { editableLayers, style } = this.state
          let layer = L.geoJson(geoJsonSelection, { style: style })
          editableLayers.addLayer(layer)
        }
        if (this.props.features) {
          this.updateResultsLayers(this.props)
        }
      })
      this.mapSetup()
    })
  }

  mapDefaults() {
    let resultsLayers = new L.FeatureGroup()
    let editableLayers = new L.FeatureGroup()
    let mapSettings = {
      _initialized: true,
      style: {
        color: '#00ffc8',
        weight: 3,
        opacity: 0.65,
      },
      resultsLayers,
      editableLayers,
      // Define map with defaults
      map: L.map(ReactDOM.findDOMNode(this.mapNode), {
        minZoom: 2,
        maxZoom: 5,
        layers: [
          L.esri.basemapLayer('Imagery'),
          L.esri.basemapLayer('ImageryLabels'),
        ],
        attributionControl: false,
      }),
      previousLayer: {},
    }
    return mapSettings
  }

  drawDefaults(layerGroup) {
    const drawStyle = {
      color: '#FFA268',
      weight: 3,
      opacity: 0.65,
    }
    return new L.Control.Draw({
      edit: {
        featureGroup: layerGroup,
        edit: false
      },
      remove: false,
      position: 'topright',
      draw: {
        polyline: false,
        marker: false,
        polygon: false,
        circle: false,
        rectangle: {
          shapeOptions: drawStyle,
        },
      },
    })
  }

  mapSetup() {
    let { map, drawControl, editableLayers, resultsLayers } = this.state
    this.loadDrawEventHandlers()
    if (this.props.selection) {
      map.addControl(this.drawDefaults(editableLayers))
      map.addLayer(editableLayers)
    }
    if (this.props.features) {
      map.addLayer(resultsLayers)
    }
    this.fitMapToResults()
  }

  componentWillReceiveProps() {
    let { map } = this.state
    if (map) {
      map.invalidateSize()
    } // Necessary to redraw map which isn't initially visible
  }

  componentWillUpdate(nextProps) {
    // Add/remove layers on map to reflect store
    if (this.state._initialized) {
      if (this.props.selection) {
        this.updateSelectionLayer()
      }
      if (this.props.features) {
        this.updateResultsLayers(nextProps)
        this.fitMapToResults()
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.state.map.invalidateSize()
  }

  updateSelectionLayer() {
    let { editableLayers, style } = this.state
    let w = watch(store.getState, 'behavior.search.geoJSON')
    store.subscribe(
      w(newGeoJson => {
        editableLayers.clearLayers()
        if (!_.isEmpty(newGeoJson)) {
          let layer = L.geoJson(newGeoJson, { style: style })
          editableLayers.addLayer(layer)
        }
      })
    )
  }

  updateResultsLayers({ geoJsonFeatures, focusedFeatures }) {
    if (!geoJsonFeatures) {
      return
    }
    // Apply colors to focused feature
    let { resultsLayers } = this.state
    const selectedStyle = { color: '#FFA268' }
    const defaultStyle = {
      color: '#00ffc8',
      fillOpacity: 0.002,
      opacity: 0.5,
    }
    resultsLayers.clearLayers()
    geoJsonFeatures.forEach(feature => {
      resultsLayers.addLayer(
        L.geoJson(feature, {
          style: f =>
            focusedFeatures.indexOf(f.properties.id) >= 0
              ? selectedStyle
              : defaultStyle,
        })
      )
    })
    this.geoJsonFeatures = geoJsonFeatures
    this.focusedFeatures = focusedFeatures
  }

  fitMapToResults() {
    const { map, resultsLayers } = this.state
    const hasResults = resultsLayers && !_.isEmpty(resultsLayers.getLayers())
    if (!this.props.selection && this.props.features && hasResults) {
      map.fitBounds(resultsLayers.getBounds())
    } else {
      map.fitWorld()
    }
  }

  componentWillUnmount() {
    let { map } = this.state
    map.off('click', this.onMapClick)
    map = null
  }

  updateGeometryAndSubmit = (geoJSON) => {
    if(this.props.geoJSON || geoJSON) {
      if(geoJSON) {
        this.props.handleNewGeometry(geoJSON)
      }
      else {
        this.props.removeGeometry()
      }
      this.props.submit()
    }
  }

  loadDrawEventHandlers() {
    let { map } = this.state
    map.on('draw:drawstart', e => {
      this.updateGeometryAndSubmit()
    })
    map.on('draw:created', e => {
      let newLayer = e.layer.toGeoJSON()
      this.updateGeometryAndSubmit(newLayer)
    })
    map.on('draw:edited', e => {
      let layerModified = e.getLayers()[0].toGeoJSON()
      this.updateGeometryAndSubmit(layerModified)
    })
    map.on('draw:deleted', e => {
      this.updateGeometryAndSubmit()
    })
  }

  render() {
    const { showMap, forceShow } = this.props
    return (
      <div
        style={styleMapContainer(showMap, forceShow)}
        ref={mapContainerNode => {
          this.mapContainerNode = mapContainerNode
        }}
      >
        <div
          style={styleMap(showMap, forceShow)}
          ref={mapNode => {
            this.mapNode = mapNode
          }}
        />
      </div>
    )
  }
}

Map.defaultProps = {
  selection: false,
  features: true,
}

export default Map
