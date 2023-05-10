package at.jku.cg.binter.infinitemario.log.event;

import com.fasterxml.jackson.annotation.JsonValue;

public enum DeathType {
    LOST_WINGS(-1),
    STOMP(0),
    SHELL(1),
    FIREBALL(2);

    @JsonValue
    public final Integer deathType;

    private DeathType(Integer deathType) {
        this.deathType = deathType;
    }
}