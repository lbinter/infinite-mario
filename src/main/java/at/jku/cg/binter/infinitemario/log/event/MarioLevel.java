package at.jku.cg.binter.infinitemario.log.event;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MarioLevel {
    @JsonProperty("Width")
    public int Width;
    @JsonProperty("Height")
    public int Height;
    @JsonProperty("ExitX")
    public int ExitX;
    @JsonProperty("ExitY")
    public int ExitY;
    @JsonProperty("Map")
    public int[][] Map;
    @JsonProperty("Data")
    public int[][] Data;
    @JsonProperty("SpriteTemplates")
    public MarioSpriteTemplate[][] SpriteTemplates;
}