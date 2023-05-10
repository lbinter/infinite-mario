package at.jku.cg.binter.infinitemario;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;

import at.jku.cg.binter.infinitemario.log.MarioLog;
import at.jku.cg.binter.infinitemario.log.event.MarioEvent;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class MarioWebSocketHandler implements WebSocketHandler {
    private final MarioLog marioLog;

    public MarioWebSocketHandler() {
        marioLog = new MarioLog();
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        log.debug("Starting Session - " + session.getId());
        return session.receive()
                .doOnNext(message -> {
                    log(session.getId(), message.getPayloadAsText());
                }).doOnComplete(() -> complete(session.getId())).then();
    }

    private MarioEvent log(String sessionId, String message) {
        log.debug("Received :: {}", message);
        return marioLog.addEvent(sessionId, message);
    }

    private void complete(String sessionId) {
        marioLog.closeSession(sessionId);
        log.debug("Closing Session");
    }
}