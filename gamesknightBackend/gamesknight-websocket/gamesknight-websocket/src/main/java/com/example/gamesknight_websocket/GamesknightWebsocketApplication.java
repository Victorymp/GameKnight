package com.example.gamesknight_websocket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan({"com.example.gamesknight", "com.example.gamesknight_websocket"})
//@EntityScan(basePackages = "com.example.gamesknight.game")
public class GamesknightWebsocketApplication {

	public static void main(String[] args) {
		SpringApplication.run(GamesknightWebsocketApplication.class, args);
	}

}
