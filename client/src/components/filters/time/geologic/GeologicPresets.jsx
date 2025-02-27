import React, {useState, useEffect} from 'react'
import Immutable from 'seamless-immutable' // TODO is immutable actually needed?

import _ from 'lodash'

import Select from 'react-select'

import {FilterColors} from '../../../../style/defaultStyles'

import FilterFieldset from '../../FilterFieldset'

import {convertYearToCE, textToNumber} from '../../../../utils/inputUtils'

import {styleForm} from '../../common/styleFilters'

const selectTheme = theme => {
  return {
    ...theme,
    borderRadius: '0.309em',
    colors: {
      ...theme.colors,
      primary: FilterColors.DARKEST,
      primary75: FilterColors.DARK,
      primary50: FilterColors.MEDIUM,
      primary25: FilterColors.LIGHT,
      danger: '#277CB2',
      dangerLight: '#277CB2',
    },
  }
}

const styleLayout = {
  ...styleForm, // TODO is this even needed?
  ...{
    margin: '2px',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: '0.25em',
  },
}
//
const styleLabel = {
  // TODO duplicate from DateFieldset
  marginBottom: '0.25em',
}
//
const styleField = {
  width: '15em',
}

const ERAS = [
  // years defined in BP!
  Immutable({
    value: 0,
    label: 'Holocene',
    start: 11700,
    end: null,
  }),
  Immutable({
    value: 1,
    label: 'Last Deglaciation',
    start: 19000,
    end: 11700,
  }),
  Immutable({
    value: 2,
    label: 'Last Glacial Period',
    start: 115000,
    end: 11700,
  }),
  Immutable({
    value: 3,
    label: 'Last Interglacial',
    start: 130000,
    end: 115000,
  }),
  Immutable({
    value: 4,
    label: 'Pliocene',
    start: 5300000,
    end: 2600000,
  }),
  Immutable({
    value: 5,
    label: 'Paleocene-Eocene Thermal Maximum (PETM)',
    start: 56000000,
    end: 55000000,
  }),
]

const GeologicPresets = ({startYear, endYear, applyFilter}) => {
  const legendText = 'Eras'
  const [ selectedPreset, setSelectedPreset ] = useState(null)

  useEffect(
    () => {
      // if startYear and endYear match a preset, show the name of the Era in the dropdown (ie: when reloading the page)
      let matchingPreset = _.find(ERAS, (preset, index) => {
        // TODO this use of textToNumber(convertYearToCE(...)) suggests I need a non-text version of convertYearToCE...
        return (
          textToNumber(convertYearToCE(`${preset.start}`, 'BP')) == startYear &&
          textToNumber(convertYearToCE(`${preset.end}`, 'BP')) == endYear
        )
      })
      if (matchingPreset) {
        setSelectedPreset(matchingPreset)
      }
      else {
        setSelectedPreset(null) // reset to "None" if nothing matches
      }
    },
    [ startYear, endYear ]
  )

  useEffect(
    () => {
      if (selectedPreset) {
        applyFilter(
          textToNumber(convertYearToCE(`${selectedPreset.start}`, 'BP')),
          textToNumber(convertYearToCE(`${selectedPreset.end}`, 'BP'))
        )
      }
    },
    [ selectedPreset ]
  )

  return (
    <FilterFieldset legendText={legendText} styleFieldset={{marginBottom: 0}}>
      <form key="GeologicDateFilter::InputColumn::Presets" style={styleLayout}>
        <Select
          id="presets"
          name="presets"
          aria-label="Era Preset Filter"
          placeholder="Select Era Filter"
          theme={selectTheme}
          value={selectedPreset}
          options={ERAS}
          menuPlacement="auto"
          styles={{control: styles => ({...styles, ...styleField})}}
          onChange={preset => {
            setSelectedPreset(preset)
          }}
        />
      </form>
    </FilterFieldset>
  )
}
export default GeologicPresets
