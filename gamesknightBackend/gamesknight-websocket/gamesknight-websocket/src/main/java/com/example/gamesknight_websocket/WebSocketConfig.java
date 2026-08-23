package com.example.gamesknight_websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import io.github.cdimascio.dotenv.Dotenv;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private static final Dotenv env = Dotenv.configure()
    	    .ignoreIfMissing()
    	    .load();
    private static final String API_URL = env.get("API_URL");
    
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(20 * 1024 * 1024);  // 20MB inbound
        registration.setSendBufferSizeLimit(20 * 1024 * 1024); // 20MB outbound buffer
        registration.setSendTimeLimit(20 * 1000);  // 20 sec to send before disconnect
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");   
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("https://wonderful-forest-004df4903.7.azurestaticapps.net/",API_URL)
                .withSockJS();
    }

}
