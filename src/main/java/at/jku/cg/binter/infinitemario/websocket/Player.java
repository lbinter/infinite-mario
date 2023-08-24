package at.jku.cg.binter.infinitemario.websocket;

import java.security.Principal;

public class Player implements Principal {

    private String name;

    public Player(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }

}