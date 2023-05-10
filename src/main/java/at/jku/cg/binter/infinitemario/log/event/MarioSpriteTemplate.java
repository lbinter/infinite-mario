package at.jku.cg.binter.infinitemario.log.event;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MarioSpriteTemplate {
    @JsonProperty("Type")
    public int Type;
    @JsonProperty("Winged")
    public boolean Winged;
    @JsonProperty("LastVisibleTick")
    public int LastVisibleTick;
    @JsonProperty("IsDead")
    public boolean IsDead;
    @JsonProperty("Sprite")
    public Object Sprite;
}