package at.jku.cg.binter.infinitemario.rest;

import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MarioRestController {

    @GetMapping("/player")
    public Player greeting() {
        return new Player(UUID.randomUUID().toString());
    }

}