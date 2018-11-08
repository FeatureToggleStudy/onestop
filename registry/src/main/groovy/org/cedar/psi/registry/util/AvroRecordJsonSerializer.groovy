package org.cedar.psi.registry.util


import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.ser.std.StdSerializer
import org.apache.avro.generic.IndexedRecord
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class AvroRecordJsonSerializer extends StdSerializer<IndexedRecord> {

  @Autowired
  AvroRecordJsonSerializer(ObjectMapper objectMapper) {
    super(IndexedRecord)

    def module = new SimpleModule()
    module.addSerializer(IndexedRecord, this)
    objectMapper.registerModule(module)
  }

  @Override
  void serialize(IndexedRecord value, JsonGenerator gen, SerializerProvider provider) throws IOException {
    gen.writeRawValue(value.toString())
  }
}
