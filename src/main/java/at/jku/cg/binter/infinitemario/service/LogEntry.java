package at.jku.cg.binter.infinitemario.service;

import java.io.File;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LogEntry {
    @JsonProperty("name")
    public String name;

    @JsonProperty("size")
    public long size;

    public LogEntry() {
    }

    public LogEntry(File file) {
        name = file.getName();
        size = file.length();
    }
}