package at.jku.cg.binter.infinitemario.log;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import at.jku.cg.binter.infinitemario.log.event.EventType;
import at.jku.cg.binter.infinitemario.log.event.MarioEvent;
import at.jku.cg.binter.infinitemario.log.session.MarioSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class MarioLog {
    private Map<String, MarioSession> sessionMap = new HashMap<>();
    private final MarioEvent closeSessionEvent;

    public MarioLog() {
        closeSessionEvent = new MarioEvent();
        closeSessionEvent.eventType = EventType.SESSION_CLOSE;
    }

    ObjectMapper mapper = new ObjectMapper();

    public MarioEvent addEvent(String sessionID, String json) {
        MarioEvent event = parseJson(json);
        addEvent(sessionID, event);
        return event;
    }

    public void addEvent(String sessionId, MarioEvent event) {
        MarioSession session = getSession(sessionId);
        session.addEvent(event);
    }

    public MarioSession getSession(String sessionId) {
        MarioSession session = sessionMap.get(sessionId);
        if (session == null) {
            session = new MarioSession(sessionId, mapper);
            sessionMap.put(sessionId, session);
        }
        return session;
    }

    public void closeSession(String sessionId) {
        MarioSession session = getSession(sessionId);
        session.addEvent(closeSessionEvent);
    }

    public MarioEvent parseJson(String json) {
        try {
            return mapper.readValue(json, MarioEvent.class);
        } catch (JsonMappingException e) {
            log.error("Could not map json string: " + json, e);
            e.printStackTrace();
        } catch (JsonProcessingException e) {
            log.error("Could not process json string: " + json, e);
            e.printStackTrace();
        }
        return null;
    }
}
