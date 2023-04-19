package at.jku.cg.binter.infinitemario;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class MarioWebSocketHandler implements WebSocketHandler {

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        log.debug("Starting Session");
        return session.receive()
                .doOnNext(message -> {
                    log(message.getPayloadAsText());
                }).doOnComplete(this::complete).then();
    }

    private void log(String message) {
        log.debug("Received :: {}", message);
    }

    private void complete() {
        log.debug("Closing Session");
    }
}

// return session
// .send( session.receive()
// .map(msg -> "RECEIVED ON SERVER :: " + msg.getPayloadAsText()).log()
// .map(session::textMessage).log()
// );
// return session.receive()
// .doOnNext(message -> {

// log.debug("handle function called {}", message);
// // ...
// })
// // .concatMap(message -> {
// // ...
// // })
// .then();

// Flux<WebSocketMessage> stringFlux = session.receive()
// .map(WebSocketMessage::getPayloadAsText).log()
// .map(String::toUpperCase).log()
// .map(session::textMessage).log();
// return session.send(stringFlux);