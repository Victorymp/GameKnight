package com.example.gamesknight.game;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class GameController {

    @MessageMapping("/game")
    @SendTo("/topic/game")
    public String game(String message) {
        return message;
    }
}
