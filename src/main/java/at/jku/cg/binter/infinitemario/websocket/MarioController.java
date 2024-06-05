package at.jku.cg.binter.infinitemario.websocket;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import at.jku.cg.binter.infinitemario.log.MarioLog;
import at.jku.cg.binter.infinitemario.log.event.MarioEvent;
import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
public class MarioController {
    @Autowired
    private MarioLog marioLog;

    @MessageMapping("/events")
    public void events(SimpMessageHeaderAccessor sha, @Payload MarioEvent event) {
        Principal player = sha.getUser();
        if (player == null) {
            return;
        }

        String id = player.getName();

        marioLog.addEvent(id, event);
    }
}