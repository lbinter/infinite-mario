// package at.jku.cg.binter.infinitemario;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Component;
// import org.springframework.web.reactive.socket.WebSocketHandler;
// import org.springframework.web.reactive.socket.WebSocketSession;

// import at.jku.cg.binter.infinitemario.config.MarioConfiguration;
// import at.jku.cg.binter.infinitemario.log.MarioLog;
// import at.jku.cg.binter.infinitemario.log.event.MarioEvent;
// import jakarta.annotation.PostConstruct;
// import lombok.extern.slf4j.Slf4j;
// import reactor.core.publisher.Mono;

// @Slf4j
// public class MarioWebSocketHandler implements WebSocketHandler {
//     @Autowired
//     MarioConfiguration config;

//     private MarioLog marioLog;

//     @PostConstruct
//     private void init() {
//         marioLog = new MarioLog(config.getLogFolder());
//     }

//     @Override
//     public Mono<Void> handle(WebSocketSession session) {
//         log.debug("Starting Session - " + session.getId());
//         return session.receive()
//                 .doOnNext(message -> {
//                     onMessage(session.getId(), message.getPayloadAsText());
//                 })
//                 .doOnComplete(() -> complete(session.getId()))
//                 .then();
//     }

//     private MarioEvent onMessage(String sessionId, String message) {
//         if (log.isDebugEnabled()) {
//             log.debug("Received :: {}", message);
//         }
//         return marioLog.onMessage(sessionId, message);
//     }

//     private void complete(String sessionId) {
//         marioLog.closeSession(sessionId);
//         log.debug("Closing Session");
//     }
// }