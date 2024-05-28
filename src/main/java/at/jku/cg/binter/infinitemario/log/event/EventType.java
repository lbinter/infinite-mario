package at.jku.cg.binter.infinitemario.log.event;

import com.fasterxml.jackson.annotation.JsonValue;

public enum EventType {
    START("START"),
    FINISHED("WIN_WORLD"),
    GAME_OVER("GAME_OVER"),
    WIN("WIN"),
    DEATH("DEATH"),
    KEYUP("KEYUP"),
    KEYDOWN("KEYDOWN"),
    POWERUP("POWERUP"),
    POWERUP_SPAWNED("POWERUP_SPAWNED"),
    POWERUP_LOST("POWERUP_LOST"),
    COIN("COIN"),
    GAINED_LIVE("LIVE"),
    BLOCK_DESTROYED("BLOCK_DESTROYED"),
    ENEMY_DEATH("ENEMY_DEATH"),
    POSITION("POS"),
    LEVEL("LEVEL"),
    RUNNING_START("RUN_START"),
    RUNNING_STOP("RUN_STOP"),
    JUMP_START("JUMP_START"),
    JUMP_LAND("JUMP_LAND"),
    FIREBALL("FIREBALL"),
    SESSION_START("SESSION_START"),
    SESSION_CLOSE("SESSION_CLOSE"),
    SCORE("SCORE");

    @JsonValue
    public final String event;

    private EventType(String eventString) {
        this.event = eventString;
    }
}