package com.example.gamesknight.game;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;


import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class GameController {

    private static final Logger log = LoggerFactory.getLogger(GameController.class);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, Map<String, ObjectNode>> gamePlayers = new ConcurrentHashMap<>();

    @MessageMapping("/game")
    @SendTo("/topic/game")
    public String game(String message) throws Exception {
        log.info("Received raw message on /app/game: {}", message);

        JsonNode root;
        try {
            root = objectMapper.readTree(message);
        } catch (Exception e) {
            log.error("Failed to parse message as JSON: {}", message, e);
            return message;
        }

        String type = root.path("type").asText();
        JsonNode payload = root.path("payload");
        log.info("Parsed type='{}', payload={}", type, payload);

        if ("game:join".equals(type)) {
            String gameCode = payload.path("gameCode").asText(null);
            String playerId = payload.path("id").asText(null);
            String displayName = payload.path("displayName").asText(null);

            log.info("game:join -> gameCode='{}', playerId='{}', displayName='{}'",
                    gameCode, playerId, displayName);

            if (gameCode == null || playerId == null) {
                log.warn("Missing gameCode or playerId, falling back to echo. payload={}", payload);
                return message;
            }

            Map<String, ObjectNode> players =
                gamePlayers.computeIfAbsent(gameCode, k -> new LinkedHashMap<>());

            ObjectNode playerNode = objectMapper.createObjectNode();
            playerNode.put("id", playerId);
            playerNode.put("displayName", displayName);
            players.put(playerId, playerNode);

            log.info("Game '{}' now has {} player(s): {}", gameCode, players.size(), players.keySet());

            ObjectNode update = objectMapper.createObjectNode();
            update.put("type", "game:update");
            ObjectNode updatePayload = objectMapper.createObjectNode();
            updatePayload.put("gameCode", gameCode);
            updatePayload.putArray("players").addAll(players.values());
            update.set("payload", updatePayload);

            String outgoing = objectMapper.writeValueAsString(update);
            log.info("Broadcasting to /topic/game: {}", outgoing);
            return outgoing;
        }

        log.info("Unhandled type '{}', falling back to echo", type);
        return message;
    }
}