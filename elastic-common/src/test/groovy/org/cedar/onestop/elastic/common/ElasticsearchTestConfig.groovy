package org.cedar.onestop.elastic.common

import groovy.util.logging.Slf4j
import org.elasticsearch.client.RestClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.DependsOn
import org.springframework.context.annotation.Profile

//@Slf4j
//@Profile("integration")
//@TestConfiguration
class ElasticsearchTestConfig {

    static final String ELASTICSEARCH_DOCKER_IMAGE_NAME = "docker.elastic.co/elasticsearch/elasticsearch"

//    @Value('${elasticsearch.version}')
//    String elasticsearchVersion
//
//    @Bean(name = 'elasticsearchTestContainer', initMethod = 'start', destroyMethod = 'stop')
//    ElasticsearchTestContainer elasticsearchTestContainer() {
//        String dockerImageName = "${ELASTICSEARCH_DOCKER_IMAGE_NAME}:${elasticsearchVersion}"
//        return new ElasticsearchTestContainer(dockerImageName)
//    }

//    @Bean(name = 'restClient', destroyMethod = 'close')
//    @DependsOn('elasticsearchTestContainer')
//    RestClient elasticsearchRestClient() {
//        ElasticsearchTestContainer container = elasticsearchTestContainer()
//        RestClient restClient = container.restClient
//        return restClient
//    }
}
