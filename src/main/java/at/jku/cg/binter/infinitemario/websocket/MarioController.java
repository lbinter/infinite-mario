package at.jku.cg.binter.infinitemario.websocket;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import at.jku.cg.binter.infinitemario.log.MarioLog;
import at.jku.cg.binter.infinitemario.log.event.MarioEvent;
import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
public class MarioController {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    @Autowired
    private MarioLog marioLog;

    @MessageMapping("/events")
    public void events(SimpMessageHeaderAccessor sha, @Payload MarioEvent event) {
        Principal player = sha.getUser();
        if (player == null) {
            return;
        }
        String id = player.getName() + sha.getSessionId();
        
        marioLog.addEvent(id, event);

        // simpMessagingTemplate.convertAndSendToUser(sha.getUser().getName(),
        // "/queue/messages",
        // "got event :: " + event.eventType);
    }
}