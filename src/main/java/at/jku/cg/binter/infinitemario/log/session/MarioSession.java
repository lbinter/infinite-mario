package at.jku.cg.binter.infinitemario.log.session;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import at.jku.cg.binter.infinitemario.io.MarioLogWriter;
import at.jku.cg.binter.infinitemario.log.event.EventType;
import at.jku.cg.binter.infinitemario.log.event.MarioEvent;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class MarioSession {
    public final String sessionID;

    private final ObjectMapper mapper;
    private MarioLogWriter writer;

    private final List<MarioEvent> events = new ArrayList<>();

    private final List<MarioEvent> levelDataEvents = new ArrayList<>();

    public MarioSession(String sessionID, ObjectMapper mapper) {
        this.sessionID = sessionID;
        this.mapper = mapper;
    }

    public boolean addEvent(MarioEvent event) {
        if (event == null) {
            return false;
        }
        if (event.eventType == EventType.LEVEL) {
            if (!containsLevel(event)) {
                levelDataEvents.add(event);
            }
        } else if (event.eventType == EventType.SESSION_CLOSE) {
            writeToFile();
        } else {
            events.add(event);
        }
        return true;
    }

    private boolean containsLevel(MarioEvent newEvent) {
        for (MarioEvent event : levelDataEvents) {
            if (newEvent.level_string.equals(event.level_string)) {
                return true;
            }
        }
        return false;
    }

    public void writeToFile() {
        if (writer == null) {
            createWriter();
            if (writer == null)
                return;
        }

        try {
            writeLevelData();
            writeEvents();
        } catch (JsonProcessingException e) {
            log.error("Could not process object to json string", e);
            e.printStackTrace();
        }

        closeSession();
    }

    private void createWriter() {
        try {
            writer = new MarioLogWriter("C:\\Users\\lucas\\Documents\\Universität\\SS2023\\CG\\project\\logs",
                    sessionID + ".log");
        } catch (IOException e) {
            log.error("Could not create file writer.", e);
            e.printStackTrace();
            return;
        }
    }

    public void writeEvents() throws JsonProcessingException {
        writer.writeLine("// Player Data:");
        for (MarioEvent event : events) {
            writer.writeLine(mapper.writeValueAsString(event));
        }
    }

    public void writeLevelData() throws JsonProcessingException {
        writer.writeLine("// Level Data:");
        for (MarioEvent event : levelDataEvents) {
            writer.writeLine(mapper.writeValueAsString(event));
        }
    }

    public void closeSession() {
        writer.finish();
    }
}
