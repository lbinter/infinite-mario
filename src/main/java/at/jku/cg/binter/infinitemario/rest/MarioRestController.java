package at.jku.cg.binter.infinitemario.rest;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonEncoding;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;

import at.jku.cg.binter.infinitemario.json.MarioSessionJsonSerializer;
import at.jku.cg.binter.infinitemario.service.LogList;
import at.jku.cg.binter.infinitemario.service.MarioLogService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class MarioRestController {
    @Autowired
    MarioLogService logService;

    @GetMapping("/player")
    public Player greeting() {
        return new Player(UUID.randomUUID().toString());
    }

    @GetMapping("/logs")
    public LogList logs() {
        return logService.getLogFileList();
    }

    @GetMapping("/log")
    public String log(String name) throws IOException {
        log.info("Called log with name: " + name);
        File logFile = logService.getLogFile(name);
        if (logFile == null) {
            return null;
        }
        return Files.readString(Paths.get(logFile.getAbsolutePath()));
    }

    @GetMapping("/logAsJson")
    public String logAsJson(String name) throws JsonProcessingException {
        log.info("Called logAsJSON with name: " + name);
        return logService.getLogSessionAsJson(name);
    }

    @GetMapping("/logAsStream")
    public ResponseEntity<ByteArrayResource> logAsStream(String name) throws IOException {
        log.info("Called logAsStream with name: " + name);
        File logFile = logService.getLogFile(name);
        if (logFile == null) {
            return null;
        }
        // TODO create output stream
        logService.writeLogSessionToStream(null, name);
        String json = logService.getLogSessionAsJson(name);
        return ResponseEntity.ok()
                .contentLength(logFile.length())
                .contentType(MediaType.APPLICATION_JSON)
                .header("Content-Disposition", "attachment; filename=" + logFile.getName())
                .body(new ByteArrayResource(Files.readAllBytes(null)));
    }

    @GetMapping("/logFile")
    public ResponseEntity<ByteArrayResource> logFile(String name) throws IOException {
        log.info("Called logFile with name: " + name);
        File logFile = logService.getLogFile(name);
        if (logFile == null) {
            return null;
        }
        Path path = Paths.get(logFile.getAbsolutePath());

        return ResponseEntity.ok()
                .contentLength(logFile.length())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header("Content-Disposition", "attachment; filename=" + logFile.getName())
                .body(new ByteArrayResource(Files.readAllBytes(path)));
    }
}