package com.example.gamesknight.session;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class GameScheduler {
    private final GameSessionService sessionService;

    public GameScheduler(GameSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Scheduled(fixedRate = 250)
    public void tick() {
        sessionService.tick();
    }
}