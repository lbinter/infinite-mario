package at.jku.cg.binter.infinitemario.service;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import at.jku.cg.binter.infinitemario.config.MarioConfiguration;
import at.jku.cg.binter.infinitemario.log.session.MarioSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MarioLogService {
    @Autowired
    MarioConfiguration config;
    @Autowired
    private ObjectMapper objectMapper;

    public MarioLogService() {
    }

    public LogList getLogFileList() {
        LogList list = new LogList();

        log.info("Generating log file list...");

        File logFolder = new File(config.getLogFolder());
        if (!logFolder.exists()) {
            log.error("Could not find log folder:" + config.getLogFolder());
        } else {
            File[] files = logFolder.listFiles();
            for (File file : files) {
                list.add(new LogEntry(file));
            }
        }

        log.info("Found " + list.logs.size() + "log files");

        return list;
    }

    public File getLogFile(String name) {
        if (name == null || name.isEmpty()) {
            log.error("No log file name was given.");
            return null;
        }
        File logFolder = new File(config.getLogFolder());
        if (!logFolder.exists()) {
            log.error("Could not find log folder:" + config.getLogFolder());
            return null;
        } else {
            File logFile = new File(logFolder, name);
            if (!logFile.exists()) {
                log.error("Could not find log file:" + config.getLogFolder() + "/" + name);
                return null;
            }
            return logFile;
        }
    }

    public MarioSession getLogSession(String name) {
        log.error("Called getLogSession?name=" + name);
        File logFile = getLogFile(name);
        if (logFile == null) {
            return null;
        }
        MarioSession session = new MarioSession(config, name.replace(".log", ""), new ObjectMapper());
        session.readFromFile(logFile);
        return session;
    }

    public String getLogSessionAsJson(String name) throws JsonProcessingException {
        return objectMapper.writeValueAsString(getLogSession(name));
    }

    public void writeLogSessionToStream(OutputStream stream, String name) throws IOException {
        objectMapper.writeValue(stream, getLogSession(name));
    }

}