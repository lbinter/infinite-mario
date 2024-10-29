package at.jku.cg.binter.infinitemario.service;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LogList {
    @JsonProperty("logs")
    public List<LogEntry> logs = new ArrayList<>();

    public void add(LogEntry entry) {
        logs.add(entry);
    }
}
