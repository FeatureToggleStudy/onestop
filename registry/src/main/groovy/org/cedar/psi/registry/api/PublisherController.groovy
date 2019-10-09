package org.cedar.psi.registry.api

import groovy.transform.CompileStatic
import groovy.util.logging.Slf4j
import org.cedar.psi.common.constants.Topics
import org.cedar.psi.registry.service.Publisher
import org.cedar.schemas.avro.psi.RecordType
import org.pac4j.springframework.annotation.AnnotationConfig
import org.pac4j.springframework.annotation.ws.RequireAnyRole
import org.pac4j.springframework.component.ComponentConfig
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

import static org.springframework.web.bind.annotation.RequestMethod.*

@Slf4j
@CompileStatic
@RestController
@RequestMapping(value = "/metadata")
@Import([ ComponentConfig.class, AnnotationConfig.class ])
class PublisherController {

  @Autowired
  Publisher publisher

  @RequireAnyRole("ROLE_ADMIN")
  @RequestMapping(value = "/{type}/{source}/{id}", method = [POST, PUT], consumes = ["application/xml", "application/json"], produces = 'application/json')
  Map receiveContent(HttpServletRequest request, HttpServletResponse response, @RequestBody String data, @PathVariable String type, @PathVariable String source, @PathVariable UUID id) throws Exception {
    RecordType recordType = type in RecordType.values()*.name() ? RecordType.valueOf(type) : null
    def result = publisher.publishMetadata(request, recordType, data, source, id as String)
    response.status = result.status as Integer
    return result.content as Map
  }

  @RequireAnyRole("ROLE_ADMIN")
  @RequestMapping(value = "/{type}", method = [POST, PUT], consumes = ["application/xml", "application/json"], produces = 'application/json')
  Map receiveContent(HttpServletRequest request, HttpServletResponse response, @RequestBody String data, @PathVariable String type) throws Exception {
    receiveContent(request, response, data, type, Topics.DEFAULT_SOURCE, null)
  }

  @RequireAnyRole("ROLE_ADMIN")
  @RequestMapping(value = "/{type}/{id}", method = [POST, PUT], consumes = ["application/xml", "application/json"], produces = 'application/json')
  Map receiveContent(HttpServletRequest request, HttpServletResponse response, @RequestBody String data, @PathVariable String type, @PathVariable UUID id) throws Exception {
    receiveContent(request, response, data, type, Topics.DEFAULT_SOURCE, id)
  }

  @RequireAnyRole("ROLE_ADMIN")
  @RequestMapping(value = "/{type}/{id}", method = PATCH, consumes = "application/json", produces = 'application/json')
  Map patchContent(HttpServletRequest request, HttpServletResponse response, @RequestBody String data, @PathVariable String type, @PathVariable UUID id) throws Exception {
    receiveContent(request, response, data, type, Topics.DEFAULT_SOURCE, id)
  }

  @RequireAnyRole("ROLE_ADMIN")
  @RequestMapping(value = "/{type}/{source}/{id}", method = PATCH, consumes = "application/json", produces = 'application/json')
  Map patchContent(HttpServletRequest request, HttpServletResponse response, @RequestBody String data, @PathVariable String type, @PathVariable String source, @PathVariable UUID id) throws Exception {
    receiveContent(request, response, data, type, source, id)
  }

  @RequireAnyRole("ROLE_ADMIN")
  @RequestMapping(value = "/{type}/{id}", method = [DELETE], consumes = ['*'],produces = 'application/json')
  Map removeContent(HttpServletRequest request, HttpServletResponse response, @PathVariable String type, @PathVariable UUID id) throws Exception {
    receiveContent(request, response, null, type, Topics.DEFAULT_SOURCE, id)
  }

  @RequireAnyRole("ROLE_ADMIN")
  @RequestMapping(value = "/{type}/{source}/{id}", method = [DELETE], consumes = ['*'],produces = 'application/json')
  Map removeContent(HttpServletRequest request, HttpServletResponse response, @PathVariable String type, @PathVariable String source, @PathVariable UUID id) throws Exception {
    receiveContent(request, response, null, type, source, id)
  }

  @RequireAnyRole("ROLE_ADMIN")
  @RequestMapping(value = "/{type}/{id}/resurrection", method = GET, produces = 'application/json')
  Map resurrectContent(@PathVariable String type, @PathVariable UUID id,
                       HttpServletRequest request, HttpServletResponse response) {
    receiveContent(request, response, null, type, Topics.DEFAULT_SOURCE, id)
  }

  @RequireAnyRole("ROLE_ADMIN")
  @RequestMapping(value = "/{type}/{source}/{id}/resurrection", method = GET, produces = 'application/json')
  Map resurrectContent(@PathVariable String type, @PathVariable String source, @PathVariable UUID id,
                       HttpServletRequest request, HttpServletResponse response) {
    receiveContent(request, response, null, type, source, id)
  }

}
