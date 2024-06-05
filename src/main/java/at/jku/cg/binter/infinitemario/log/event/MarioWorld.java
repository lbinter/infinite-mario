package at.jku.cg.binter.infinitemario.log.event;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MarioWorld {
    @JsonProperty("LevelDifficulty")
    public int LevelDifficulty;
    @JsonProperty("LevelType")
    public int LevelType;
    @JsonProperty("WorldNumber")
    public int WorldNumber;
    @JsonProperty("Level")
    public int[][] Level;
    @JsonProperty("Data")
    public int[][] Data;
    @JsonProperty("CastleData")
    public int[][] CastleData;
}