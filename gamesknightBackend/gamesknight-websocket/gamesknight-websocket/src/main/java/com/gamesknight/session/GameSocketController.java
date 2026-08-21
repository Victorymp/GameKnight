package com.gamesknight.session;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;

@Controller
public class GameSocketController {
    private final GameSessionService sessionService;
    private final SimpMessagingTemplate broker;
    private static final Logger log = LoggerFactory.getLogger(GameSocketController.class);

    public GameSocketController(GameSessionService sessionService, SimpMessagingTemplate broker) {
        this.sessionService = sessionService;
        this.broker = broker;
    }

    @MessageMapping("/game/{gameCode}/join")
    public void join(
            @DestinationVariable String gameCode,
            @Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headers
    ) {
        String name = (String) payload.getOrDefault("name", "Player");
        String sessionId = headers.getSessionId();
        String playerId = UUID.randomUUID().toString();

        log.info("JOIN received: gameCode={} name={} sessionId={}", gameCode, name, sessionId);

        try {
            sessionService.playerJoin(gameCode, playerId, name);
            log.info("JOIN playerJoin completed for {}", playerId);
        } catch (Exception e) {
            log.error("JOIN playerJoin threw", e);
            return;
        }

        try {
            broker.convertAndSendToUser(
                    sessionId, "/queue/join",
                    Map.of("type", "join:ack", "payload", Map.of(
                            "playerId", playerId, "gameCode", gameCode, "name", name
                    )),
                    createHeaders(sessionId)
            );
            log.info("JOIN ack sent to sessionId={}", sessionId);
        } catch (Exception e) {
            log.error("JOIN ack send threw", e);
        }
    }

    @MessageMapping("/game/{gameCode}/start")
    public void start(@DestinationVariable String gameCode) {
        sessionService.startGame(gameCode);
    }

    @MessageMapping("/game/{gameCode}/vote")
    public void vote(@DestinationVariable String gameCode, @Payload Map<String, Object> payload) {
        String playerId = (String) payload.get("playerId");
        long questionId = ((Number) payload.get("questionId")).longValue();
        long answerId = ((Number) payload.get("answerId")).longValue();
        sessionService.submitVote(gameCode, playerId, questionId, answerId);
    }

    private org.springframework.messaging.MessageHeaders createHeaders(String sessionId) {
        SimpMessageHeaderAccessor headerAccessor =
                SimpMessageHeaderAccessor.create(org.springframework.messaging.simp.SimpMessageType.MESSAGE);
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setLeaveMutable(true);
        return headerAccessor.getMessageHeaders();
    }
}