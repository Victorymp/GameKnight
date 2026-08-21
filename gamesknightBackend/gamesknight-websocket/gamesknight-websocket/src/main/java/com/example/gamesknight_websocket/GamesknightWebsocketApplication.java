package com.example.gamesknight_websocket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan({"com.gamesknight", "com.gamesknight.gamesknight_websocket"})
@EntityScan(basePackages = {"com.gamesknight.game","com.gamesknight.question","com.gamesknight.answer"})
@EnableJpaRepositories(basePackages = {"com.gamesknight.game","com.gamesknight.question","com.gamesknight.answer"})
@EnableScheduling
public class GamesknightWebsocketApplication {

	public static void main(String[] args) {
		SpringApplication.run(GamesknightWebsocketApplication.class, args);
	}

}
