package com.chat.config;

import com.chat.controller.ChatController;
import com.chat.model.ChatMessage;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;


@Component
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatController chatController;

    public WebSocketEventListener(SimpMessageSendingOperations messagingTemplate, ChatController chatController) {
        this.messagingTemplate = messagingTemplate;
        this.chatController = chatController;
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        java.util.Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        String username = (sessionAttributes != null) ? (String) sessionAttributes.get("username") : null;
        String channelId = (sessionAttributes != null) ? (String) sessionAttributes.get("channelId") : "public";
        
        if (username != null) {
            chatController.removeUser(username, channelId);
            
            // Broadcast leave message
            ChatMessage leaveMessage = new ChatMessage();
            leaveMessage.setSender(username);
            leaveMessage.setType(ChatMessage.MessageType.LEAVE);
            leaveMessage.setContent(username + " left the chat");
            leaveMessage.setChannelId(channelId);

            String destination = "/topic/messages";
            if (channelId != null && !channelId.equals("public")) {
                destination = "/topic/channels/" + channelId;
            }

            messagingTemplate.convertAndSend(destination, leaveMessage);
        }
    }
}
