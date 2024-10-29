package at.jku.cg.binter.infinitemario.log.session;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import at.jku.cg.binter.infinitemario.config.MarioConfiguration;
import at.jku.cg.binter.infinitemario.io.MarioLogWriter;
import at.jku.cg.binter.infinitemario.log.event.EventType;
import at.jku.cg.binter.infinitemario.log.event.MarioEvent;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class MarioSession {
    public final String sessionId;
    public final MarioConfiguration config;

    private final ObjectMapper mapper;
    private MarioLogWriter writer;

    private final List<MarioEvent> events = new ArrayList<>();

    private final List<MarioEvent> levelDataEvents = new ArrayList<>();
    private final List<MarioEvent> worldDataEvents = new ArrayList<>();

    public MarioSession(MarioConfiguration config, String sessionId, ObjectMapper mapper) {
        this.config = config;
        this.sessionId = sessionId;
        this.mapper = mapper;
    }

    public boolean addEvent(MarioEvent event) {
        return addEvent(event, true);
    }

    public boolean addEvent(MarioEvent event, boolean autoWrite) {
        if (event == null) {
            return false;
        }
        if (event.eventType == EventType.LEVEL) {
            if (!containsLevel(event)) {
                levelDataEvents.add(event);
            }
        } else if (event.eventType == EventType.WORLD) {
            if (!containsWorld(event)) {
                worldDataEvents.add(event);
            }
        } else if (event.eventType == EventType.SESSION_CLOSE) {
            events.add(event);
            if (autoWrite) {
                writeToFile();
            }
        } else {
            events.add(event);
        }
        return true;
    }

    private boolean containsLevel(MarioEvent newEvent) {
        for (MarioEvent event : levelDataEvents) {
            if (newEvent.levelId.equals(event.levelId)) {
                return true;
            }
        }
        return false;
    }

    private boolean containsWorld(MarioEvent newEvent) {
        for (MarioEvent event : worldDataEvents) {
            if (newEvent.worldData.LevelDifficulty == event.worldData.LevelDifficulty &&
                    newEvent.worldData.LevelType == event.worldData.LevelType &&
                    newEvent.worldData.WorldNumber == event.worldData.WorldNumber) {
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
        log.info("Writing player session to {}", writer.getLogFile().getAbsolutePath());

        try {
            writer.writeLine("\"" + sessionId + "\": {");
            writeWorldData();
            writeLevelData();
            writeEvents();
            writer.writeLine("}");
        } catch (JsonProcessingException e) {
            log.error("Could not process object to json string", e);
            e.printStackTrace();
        }

        closeSession();
    }

    private void createWriter() {
        try {
            writer = new MarioLogWriter(config.getLogFolder(), sessionId + ".log");
        } catch (IOException e) {
            log.error("Could not create file writer.", e);
            e.printStackTrace();
            return;
        }
    }

    public void writeEvents() throws JsonProcessingException {
        for (MarioEvent event : events) {
            writer.write(mapper.writeValueAsString(event));
            if (event.eventType != EventType.SESSION_CLOSE) {
                writer.write(",");
            }
            writer.newLine();
        }
    }

    public void writeWorldData() throws JsonProcessingException {
        for (MarioEvent event : worldDataEvents) {
            writer.write(mapper.writeValueAsString(event));
            writer.write(",");
            writer.newLine();
        }
    }

    public void writeLevelData() throws JsonProcessingException {
        for (MarioEvent event : levelDataEvents) {
            writer.write(mapper.writeValueAsString(event));
            writer.write(",");
            writer.newLine();
        }
    }

    public void closeSession() {
        writer.finish();
    }

    public void readFromFile(File logFile) {
        log.error("Called readFromFile");
        try {
            BufferedReader reader = new BufferedReader(new FileReader(logFile));
            String line = reader.readLine();
            while (line != null) {
                if (!line.startsWith("{")) {
                    line = reader.readLine();
                    continue; // skip lines not containing MarioEvents
                }
                try {
                    MarioEvent event = mapper.readValue(line, MarioEvent.class);
                    addEvent(event,false);
                } catch (Exception e) {
                    log.error("Could not deserialize line" + line, e);
                }
                line = reader.readLine();
            }
            reader.close();
        } catch (IOException e) {
            log.error("Could read log file.", e);
            e.printStackTrace();
        }
    }

    public String getSessionId() {
        return sessionId;
    }

    public List<MarioEvent> getEvents() {
        return events;
    }

    public List<MarioEvent> getLevelDataEvents() {
        return levelDataEvents;
    }

    public List<MarioEvent> getWorldDataEvents() {
        return worldDataEvents;
    }
}