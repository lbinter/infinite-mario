package at.jku.cg.binter.infinitemario.log.event;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(Include.NON_NULL)
public class MarioEvent {
    @JsonProperty("event")
    public EventType eventType;

    @JsonProperty("time")
    public Float time;
    @JsonProperty("timeleft")
    public Float timeleft;

    @JsonProperty("pType")
    public PowerUpType pType;
    @JsonProperty("enemyType")
    public EnemyType enemyType;
    @JsonProperty("deathType")
    public DeathType deathType;

    @JsonProperty("posX")
    public Float posX;
    @JsonProperty("posY")
    public Float posY;

    @JsonProperty("key")
    public Integer key;
    @JsonProperty("facing")
    public Integer facing;

    @JsonProperty("level")
    public String level;
    @JsonProperty("lives")
    public Integer lives;
    @JsonProperty("coins")
    public Integer coins;
    @JsonProperty("points")
    public Integer points;

    @JsonProperty("stomp")
    public Boolean stomp;

    @JsonProperty("level_string")
    public String level_string;
    @JsonProperty("level_data")
    public MarioLevel level_data;
}