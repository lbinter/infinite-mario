package at.jku.cg.binter.infinitemario.log.event;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PowerUpType {
    MUSHROOM("mushroom"),
    FLOWER("flower");

    @JsonValue
    public final String pType;

    private PowerUpType(String eventString) {
        this.pType = eventString;
    }
}
