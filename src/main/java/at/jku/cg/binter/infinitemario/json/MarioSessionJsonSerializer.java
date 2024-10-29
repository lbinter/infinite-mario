package at.jku.cg.binter.infinitemario.json;

import java.io.IOException;
import java.util.List;

import org.springframework.boot.jackson.JsonComponent;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import at.jku.cg.binter.infinitemario.log.event.MarioEvent;
import at.jku.cg.binter.infinitemario.log.session.MarioSession;

@JsonComponent
public class MarioSessionJsonSerializer extends JsonSerializer<MarioSession> {

    @Override
    public void serialize(MarioSession session, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();

        gen.writeFieldName(session.getSessionId());
        gen.writeStartObject();
        serializeObjectList(session, gen, serializers, "worlds", session.getWorldDataEvents());
        serializeObjectList(session, gen, serializers, "levels", session.getLevelDataEvents());
        serializeObjectList(session, gen, serializers, "events", session.getEvents());
        gen.writeEndObject();
        
        gen.writeEndObject();
    }

    private void serializeObjectList(MarioSession session, JsonGenerator gen, SerializerProvider serializers,
            String listName, List<MarioEvent> list) throws IOException {
        gen.writeFieldName(listName);
        gen.writeStartArray();
        for (MarioEvent event : list) {
            gen.writeObject(event);
        }
        gen.writeEndArray();
    }

}