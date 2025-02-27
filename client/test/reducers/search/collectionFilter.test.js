import Immutable from 'seamless-immutable'
import {
  collectionFilter,
  initialState,
} from '../../../src/reducers/search/collectionFilter'
import {
  collectionUpdateDateRange,
  collectionRemoveDateRange,
  collectionUpdateYearRange,
  collectionRemoveYearRange,
  collectionUpdateGeometry,
  collectionRemoveGeometry,
  collectionToggleExcludeGlobal,
  collectionToggleFacet,
  collectionNewSearchRequested,
  collectionNewSearchResetFiltersRequested,
  collectionMoreResultsRequested,
} from '../../../src/actions/routing/CollectionSearchStateActions'

const assertParam = (param, result, expected, fallback) => {
  expect(result[param]).toEqual(
    // if provided, assert that it matches `expected`, otherwise it should match `fallback`
    expected[param] === undefined ? fallback[param] : expected[param]
  )
}

const assertAllFilterParams = (results, values, defaults) => {
  assertParam('pageOffset', results, values, defaults)
  assertParam('queryText', results, values, defaults)
  assertParam('geoJSON', results, values, defaults)
  assertParam('startDateTime', results, values, defaults)
  assertParam('endDateTime', results, values, defaults)
  assertParam('startYear', results, values, defaults)
  assertParam('endYear', results, values, defaults)
  assertParam('selectedFacets', results, values, defaults)
  assertParam('excludeGlobal', results, values, defaults)
}

describe('The collection filter reducer', function(){
  const nonInitialState = {
    // not a single default value
    pageOffset: 40,
    queryText: 'demo',
    geoJSON: {
      type: 'Point',
      geometry: {type: 'Point', coordinates: [ 0, 0 ]},
    },
    startDateTime: '2000-01-01T00:00:00Z',
    endDateTime: '3000-01-01T00:00:00Z',
    startYear: -30000,
    endYear: -3000,
    selectedFacets: {science: [ 'Oceans', 'Oceans > Ocean Temperature' ]},
    excludeGlobal: true,
  }

  it('has a default state', function(){
    const result = collectionFilter(initialState, {})

    expect(result).toEqual({
      pageOffset: 0,
      queryText: '',
      geoJSON: null,
      startDateTime: null,
      endDateTime: null,
      startYear: null,
      endYear: null,
      selectedFacets: {},
      excludeGlobal: null,
    })
  })

  const searchActionTestCases = [
    {
      desc: 'simple new search request action',
      its: [
        {
          name: 'makes no changes to initial state',
          initialState: initialState,
          function: collectionNewSearchRequested,
          expectedChanges: {pageOffset: 0},
        },
        {
          name: 'resets only pageOffset',
          initialState: nonInitialState,
          function: collectionNewSearchRequested,
          expectedChanges: {pageOffset: 0},
        },
      ],
    },
    {
      desc: 'next page search request action',
      its: [
        {
          name:
            'makes no changes to initial state except pagination (increments by 20)',
          initialState: initialState,
          function: collectionMoreResultsRequested,
          expectedChanges: {pageOffset: 20},
        },
        {
          name: 'changes only pageOffset (increments by 20)',
          initialState: nonInitialState,
          function: collectionMoreResultsRequested,
          expectedChanges: {pageOffset: 60},
        },
      ],
    },
    {
      desc: 'filter resetting new search',
      its: [
        {
          name: 'resets to initial values with null param',
          initialState: nonInitialState,
          function: collectionNewSearchResetFiltersRequested,
          params: [ null ],
          expectedChanges: initialState,
        },
        {
          name: 'resets to initial values with undefined param',
          initialState: nonInitialState,
          function: collectionNewSearchResetFiltersRequested,
          params: [ undefined ],
          expectedChanges: initialState,
        },
        {
          name: 'resets to initial values with empty map',
          initialState: nonInitialState,
          function: collectionNewSearchResetFiltersRequested,
          params: [ {} ],
          expectedChanges: initialState,
        },
        {
          name:
            'resets to initial values on except where explicitly set (queryText)',
          initialState: nonInitialState,
          function: collectionNewSearchResetFiltersRequested,
          params: [ {queryText: 'new'} ],
          expectedChanges: {
            pageOffset: 0,
            queryText: 'new',
            geoJSON: null,
            startDateTime: null,
            endDateTime: null,
            startYear: null,
            endYear: null,
            selectedFacets: {},
            excludeGlobal: null,
          },
        },
        {
          name:
            'resets to initial values on except where explicitly set (selectedFacets)',
          initialState: nonInitialState,
          function: collectionNewSearchResetFiltersRequested,
          params: [
            {
              selectedFacets: {
                science: [ 'Atmosphere', 'Atmosphere > Aerosols' ],
              },
            },
          ],
          expectedChanges: {
            pageOffset: 0,
            queryText: '',
            geoJSON: null,
            startDateTime: null,
            endDateTime: null,
            startYear: null,
            endYear: null,
            selectedFacets: {
              science: [ 'Atmosphere', 'Atmosphere > Aerosols' ],
            },
            excludeGlobal: null,
          },
        },
        {
          name: 'sets multiple values',
          initialState: initialState,
          function: collectionNewSearchResetFiltersRequested,
          params: [
            {
              queryText: 'new',
              selectedFacets: {
                science: [ 'Atmosphere', 'Atmosphere > Aerosols' ],
              },
            },
          ],
          expectedChanges: {
            queryText: 'new',
            selectedFacets: {
              science: [ 'Atmosphere', 'Atmosphere > Aerosols' ],
            },
          },
        },
        {
          name: 'overwrites all values',
          initialState: nonInitialState,
          function: collectionNewSearchResetFiltersRequested,
          params: [
            {
              queryText: 'new',
              geoJSON: {
                type: 'Polygon',
                coordinates: [
                  [
                    [ 100.0, 0.0 ],
                    [ 101.0, 0.0 ],
                    [ 101.0, 1.0 ],
                    [ 100.0, 1.0 ],
                    [ 100.0, 0.0 ],
                  ],
                ],
              },
              startDateTime: '1998-01-01T00:00:00Z',
              endDateTime: '2020-01-01T00:00:00Z',
              startYear: -100000000,
              endYear: -90000000,
              selectedFacets: {
                science: [ 'Atmosphere', 'Atmosphere > Aerosols' ],
              },
              excludeGlobal: false,
            },
          ],
          expectedChanges: {
            pageOffset: 0,
            queryText: 'new',
            geoJSON: {
              type: 'Polygon',
              coordinates: [
                [
                  [ 100.0, 0.0 ],
                  [ 101.0, 0.0 ],
                  [ 101.0, 1.0 ],
                  [ 100.0, 1.0 ],
                  [ 100.0, 0.0 ],
                ],
              ],
            },
            startDateTime: '1998-01-01T00:00:00Z',
            endDateTime: '2020-01-01T00:00:00Z',
            startYear: -100000000,
            endYear: -90000000,
            selectedFacets: {
              science: [ 'Atmosphere', 'Atmosphere > Aerosols' ],
            },
            excludeGlobal: false,
          },
        },
      ],
    },
  ]

  searchActionTestCases.forEach(function(testBlock){
    describe(`${testBlock.desc}`, function(){
      testBlock.its.forEach(function(testCase){
        it(`${testCase.name}`, function(){
          const args = testCase.params || []
          const result = collectionFilter(
            testCase.initialState,
            testCase.function(...args)
          )
          assertAllFilterParams(
            result,
            testCase.expectedChanges,
            testCase.initialState
          )
        })
      })
    })
  })

  describe('individual filter value action', function(){
    const validGeoJSON = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [ 100.0, 0.0 ],
            [ 101.0, 0.0 ],
            [ 101.0, 1.0 ],
            [ 100.0, 1.0 ],
            [ 100.0, 0.0 ],
          ],
        ],
      },
      properties: {
        description: 'Valid test GeoJSON',
      },
    }
    const paramActionTestCases = [
      {
        name: 'sets start date',
        initialState: initialState,
        function: collectionUpdateDateRange,
        params: [ '2017-01-01T00:00:00Z', null ],
        expectedChanges: {startDateTime: '2017-01-01T00:00:00Z'},
      },
      {
        name: 'sets end date',
        initialState: initialState,
        function: collectionUpdateDateRange,
        params: [ null, '2017-01-01T00:00:00Z' ],
        expectedChanges: {endDateTime: '2017-01-01T00:00:00Z'},
      },
      {
        name: 'sets start year',
        initialState: initialState,
        function: collectionUpdateYearRange,
        params: [ -1000000, null ],
        expectedChanges: {startYear: -1000000},
      },
      {
        name: 'sets end year',
        initialState: initialState,
        function: collectionUpdateYearRange,
        params: [ null, -1000000 ],
        expectedChanges: {endYear: -1000000},
      },
      {
        name: 'sets date range',
        initialState: nonInitialState,
        function: collectionUpdateDateRange,
        params: [ '1990-01-01T00:00:00Z', '2017-01-01T00:00:00Z' ],
        expectedChanges: {
          startDateTime: '1990-01-01T00:00:00Z',
          endDateTime: '2017-01-01T00:00:00Z',
        },
      },
      {
        name: 'sets year range',
        initialState: nonInitialState,
        function: collectionUpdateYearRange,
        params: [ -1000000, -900000 ],
        expectedChanges: {
          startYear: -1000000,
          endYear: -900000,
        },
      },
      {
        name: 'unsets date range',
        initialState: nonInitialState,
        function: collectionRemoveDateRange,
        expectedChanges: {startDateTime: null, endDateTime: null},
      },
      {
        name: 'unsets year range',
        initialState: nonInitialState,
        function: collectionRemoveYearRange,
        expectedChanges: {startYear: null, endYear: null},
      },
      {
        name: 'sets geometry',
        initialState: initialState,
        function: collectionUpdateGeometry,
        params: [ validGeoJSON ],
        expectedChanges: {geoJSON: validGeoJSON},
      },
      {
        name: 'unsets geometry',
        initialState: nonInitialState,
        function: collectionRemoveGeometry,
        expectedChanges: {geoJSON: null},
      },
      {
        name: 'sets facet',
        initialState: initialState,
        function: collectionToggleFacet,
        params: [ 'science', 'Oceans > Ocean Temperature', true ],
        expectedChanges: {
          selectedFacets: {science: [ 'Oceans > Ocean Temperature' ]},
        },
      },
      {
        name: 'sets facet when some exist already',
        initialState: nonInitialState,
        function: collectionToggleFacet,
        params: [ 'science', 'Atmosphere', true ],
        expectedChanges: {
          selectedFacets: {
            science: [ 'Oceans', 'Oceans > Ocean Temperature', 'Atmosphere' ],
          },
        },
      },
      {
        name: 'unsets facet',
        initialState: nonInitialState,
        function: collectionToggleFacet,
        params: [ 'science', 'Oceans > Ocean Temperature', false ],
        expectedChanges: {
          selectedFacets: {science: [ 'Oceans' ]},
        },
      },
      {
        name: 'enable exclude global from default',
        initialState: initialState,
        function: collectionToggleExcludeGlobal,
        expectedChanges: {
          excludeGlobal: true,
        },
      },
      {
        name: 'disable exclude global',
        initialState: nonInitialState,
        function: collectionToggleExcludeGlobal,
        expectedChanges: {
          excludeGlobal: false,
        },
      },
      {
        name: 'enable exclude global from false',
        initialState: {
          pageOffset: 0,
          queryText: '',
          geoJSON: null,
          startDateTime: null,
          endDateTime: null,
          startYear: null,
          endYear: null,
          selectedFacets: {},
          excludeGlobal: false,
        },
        function: collectionToggleExcludeGlobal,
        expectedChanges: {
          excludeGlobal: true,
        },
      },
    ]
    paramActionTestCases.forEach(function(testCase){
      it(`${testCase.name}`, function(){
        const args = testCase.params || []
        const result = collectionFilter(
          testCase.initialState,
          testCase.function(...args)
        )
        assertAllFilterParams(
          result,
          testCase.expectedChanges,
          testCase.initialState
        )
      })
    })
  })
})
