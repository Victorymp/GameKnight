package com.example.gamesknight_websocket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan({"com.gamesknight", "com.example.gamesknight_websocket"})
@EntityScan(basePackages = {"com.gamesknight.game","com.gamesknight.question","com.gamesknight.answer","com.gamesknight.image","com.gamesknight.album"})
@EnableJpaRepositories(basePackages = {"com.gamesknight.game","com.gamesknight.question","com.gamesknight.answer","com.gamesknight.image","com.gamesknight.album"})
@EnableScheduling
public class GamesknightWebsocketApplication {

	public static void main(String[] args) {
		SpringApplication.run(GamesknightWebsocketApplication.class, args);
	}

}
