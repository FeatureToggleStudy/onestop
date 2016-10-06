package ncei.onestop.api.service

import groovy.util.logging.Slf4j
import org.elasticsearch.action.get.MultiGetResponse
import org.elasticsearch.action.search.SearchResponse
import org.elasticsearch.client.Client
import org.elasticsearch.index.query.QueryBuilder
import org.elasticsearch.search.aggregations.Aggregations
import org.elasticsearch.search.aggregations.bucket.terms.Terms
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

import javax.annotation.PostConstruct

@Slf4j
@Service
class SearchIndexService {

  @Value('${elasticsearch.index.search.name}')
  private String SEARCH_INDEX

  @Value('${elasticsearch.index.search.collectionType}')
  private String COLLECTION_TYPE

  @Value('${elasticsearch.index.search.granuleType}')
  private String GRANULE_TYPE

  private Client client
  private SearchRequestParserService searchRequestParserService
  private IndexAdminService indexAdminService

  @Autowired
  public SearchIndexService(Client client,
                            SearchRequestParserService searchRequestParserService,
                            IndexAdminService indexAdminService) {
    this.client = client
    this.searchRequestParserService = searchRequestParserService
    this.indexAdminService = indexAdminService
  }

  public void refresh() {
    indexAdminService.refresh(SEARCH_INDEX)
  }

  public void drop() {
    indexAdminService.drop(SEARCH_INDEX)
  }

  @PostConstruct
  public void ensure() {
    def searchExists = client.admin().indices().prepareAliasesExist(SEARCH_INDEX).execute().actionGet().exists
    if (!searchExists) {
      def realName = indexAdminService.create(SEARCH_INDEX, [GRANULE_TYPE, COLLECTION_TYPE])
      client.admin().indices().prepareAliases().addAlias(realName, SEARCH_INDEX).execute().actionGet()
    }
  }

  public void recreate() {
    drop()
    ensure()
  }

  public Map search(Map searchParams) {
    def response = queryElasticSearch(searchParams)
    response
  }

  private Map queryElasticSearch(Map params) {
    def query = searchRequestParserService.parseSearchQuery(params)
    def getCollections = searchRequestParserService.shouldReturnCollections(params)
    def getFacets = params.facets as boolean

    if (getCollections) {
      // Returning collection results:
      if (getFacets) {
          def searchResponse = queryAgainstGranules(query, getFacets, getCollections)
          def result = getAllCollectionDocuments(searchResponse, params.page)
          result.meta.took = searchResponse.tookInMillis
          result.meta.facets = prepareAggregationsForUI(searchResponse.aggregations, getCollections)
          return result
      }
      else {
        def searchResponse = queryAgainstGranules(query, getFacets, getCollections)
        def result = getAllCollectionDocuments(searchResponse, params.page)
        result.meta.took = searchResponse.tookInMillis
        return result
      }
    }
    else {
      // Returning granule results:
      def searchResponse = queryAgainstGranules(query, params.page, getFacets, getCollections)
      def result = [
          data: searchResponse.hits.hits.collect({ [type: it.type, id: it.id, attributes: it.source] }),
          meta: [
              took : searchResponse.tookInMillis,
              total: searchResponse.hits.totalHits,
          ]
      ]

      if (searchResponse.aggregations) {
        result.meta.facets = prepareAggregationsForUI(searchResponse.aggregations, getCollections)
      }
      return result
    }

  }

  private SearchResponse queryAgainstGranules(QueryBuilder query,
                                              Map paginationParams = null,
                                              boolean getFacets,
                                              boolean getCollections) {

    def srb = client.prepareSearch(SEARCH_INDEX).setTypes(GRANULE_TYPE).setQuery(query)

    if(getFacets) {
      def aggregations = searchRequestParserService.createGCMDAggregations(getCollections)
      aggregations.each { a -> srb = srb.addAggregation(a) }
    }

    if(getCollections) {
      // Pagination needs to be handled on collections -- only getting aggregations here
      srb = srb.addAggregation(searchRequestParserService.createCollectionsAggregation())
      srb = srb.setSize(0)
    } else {
      if (paginationParams) {
        srb = srb.setFrom(paginationParams.offset).setSize(paginationParams.max)
      } else {
        srb = srb.setFrom(0).setSize(100)
      }
    }

    log.debug("ES query:${srb}")
    return srb.execute().actionGet()
  }

  private Map getAllCollectionDocuments(SearchResponse response, Map paginationParams) {

    def totalCount = response.aggregations.get('collections').getBuckets().size()
    if(!totalCount) {
      return [
          data: [],
          meta: [
              total: 0
          ]
      ]
    }

    def offset
    def max
    if(paginationParams) {
      offset = paginationParams.offset
      max = paginationParams.max
    }
    else {
      // Default first 100 results returned
      offset = 0
      max = 100
    }

    def collectionsToRetrieve = response.aggregations.get('collections').getBuckets()
        .stream()
        .skip(offset)
        .limit(max)
        .map( {i -> i.keyAsString} )
        .collect()

    MultiGetResponse multiGetItemResponses = client.prepareMultiGet().add(SEARCH_INDEX, COLLECTION_TYPE, collectionsToRetrieve).get()
    def result = [
        data: multiGetItemResponses.responses.collect {
          [type: it.type, id: it.id, attributes: it.response.getSourceAsMap()]
        },
        meta: [
            total: totalCount
        ]
    ]
    return result
  }

  private Map prepareAggregationsForUI(Aggregations aggs, boolean collections) {

    def topLevelLocations = ['Continent', 'Geographic Region', 'Ocean', 'Solid Earth', 'Space', 'Vertical Location']
    def topLevelScience =
        ['Agriculture', 'Atmosphere', 'Biological Classification', 'Biosphere', 'Climate Indicators',
         'Cryosphere', 'Human Dimensions', 'Land Surface', 'Oceans', 'Paleoclimate', 'Solid Earth',
         'Spectral/Engineering', 'Sun-Earth Interactions', 'Terrestrial Hydrosphere']

    def scienceAgg = cleanAggregation(topLevelScience, aggs.get('science').getBuckets(), collections)
    def locationsAgg = cleanAggregation(topLevelLocations, aggs.get('locations').getBuckets(), collections)

    def instrumentsAgg = cleanAggregation(null, aggs.get('instruments').getBuckets(), collections)
    def platformsAgg = cleanAggregation(null, aggs.get('platforms').getBuckets(), collections)
    def projectsAgg = cleanAggregation(null, aggs.get('projects').getBuckets(), collections)
    def dataCentersAgg = cleanAggregation(null, aggs.get('dataCenters').getBuckets(), collections)
    def dataResolutionAgg = cleanAggregation(null, aggs.get('dataResolution').getBuckets(), collections)

    return [
        science: scienceAgg,
        locations: locationsAgg,
        instruments: instrumentsAgg,
        platforms: platformsAgg,
        projects: projectsAgg,
        dataCenters: dataCentersAgg,
        dataResolution: dataResolutionAgg
    ]
  }

  private Map cleanAggregation(List<String> topLevelKeywords, List<Terms.Bucket> originalAgg, boolean collections) {

    def cleanAgg = [:]
    originalAgg.each { e ->
      def term = e.key as String
      def count
      if(collections) {
        count = e.getAggregations().get('byCollection').getBuckets().size()
      } else {
        count = e.docCount
      }

      if(!topLevelKeywords) {
        cleanAgg.put(term, [count: count])

      } else {
        if(term.contains('>')) {
          def splitTerms = term.split('>', 2)
          if(topLevelKeywords.contains(splitTerms[0].trim())) {
            cleanAgg.put(term, [count: count])
          }

        } else {
          if(topLevelKeywords.contains(term)) {
            cleanAgg.put(term, [count: count])
          }
        }
      }
    }
    return cleanAgg
  }
}
