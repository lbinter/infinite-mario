package at.jku.cg.binter.infinitemario.log.event;

import com.fasterxml.jackson.annotation.JsonValue;

public enum EnemyType {
    RedKoopa(0),
    GreenKoopa(1),
    Goomba(2),
    Spiky(3),
    Flower(4);

    @JsonValue
    public final Integer enemyType;

    private EnemyType(Integer enemyType) {
        this.enemyType = enemyType;
    }
}