package com.chat.controller;

import com.chat.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class ChatController {

    private final Map<String, Set<String>> roomUsers = new ConcurrentHashMap<>();
    private final Map<String, ChatMessage> messageCache = new ConcurrentHashMap<>();
    private final SimpMessageSendingOperations messagingTemplate;

    public ChatController(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/send")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        if (chatMessage.getId() == null) {
            chatMessage.setId(UUID.randomUUID().toString());
        }
        if (chatMessage.getType() == null) {
            chatMessage.setType(ChatMessage.MessageType.CHAT);
        }
        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        }
        messageCache.put(chatMessage.getId(), chatMessage);
        
        String destination = "/topic/messages";
        if (chatMessage.getChannelId() != null && !chatMessage.getChannelId().isEmpty() && !chatMessage.getChannelId().equals("public")) {
            destination = "/topic/channels/" + chatMessage.getChannelId();
        }
        messagingTemplate.convertAndSend(destination, chatMessage);
    }

    @MessageMapping("/join")
    public void addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String sender = chatMessage.getSender();
        String channelId = chatMessage.getChannelId();
        
        if (channelId == null || channelId.isEmpty()) {
            channelId = "public";
        }
        
        Set<String> usersInRoom = roomUsers.computeIfAbsent(channelId, k -> Collections.synchronizedSet(new HashSet<>()));
        
        // Unique username check
        if (usersInRoom.contains(sender)) {
            Map<String, String> errorUpdate = new HashMap<>();
            errorUpdate.put("type", "ERROR");
            errorUpdate.put("username", sender);
            errorUpdate.put("message", "Username '" + sender + "' is already taken in this channel.");
            messagingTemplate.convertAndSend("/topic/errors", errorUpdate);
            return; 
        }

        usersInRoom.add(sender);
        
        if (headerAccessor != null) {
            java.util.Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
            if (sessionAttributes != null) {
                sessionAttributes.put("username", sender);
                sessionAttributes.put("channelId", channelId);
            }
        }
        
        chatMessage.setId(UUID.randomUUID().toString());
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        chatMessage.setContent(sender + " joined the " + (channelId.equals("public") ? "chat" : channelId + " channel"));
        chatMessage.setTimestamp(OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        
        String destination = "/topic/messages";
        if (!channelId.equals("public")) {
            destination = "/topic/channels/" + channelId;
        }
        
        messagingTemplate.convertAndSend(destination, chatMessage);
        broadcastPresence(channelId);
    }

    @MessageMapping("/ack")
    public void handleAck(@Payload Map<String, String> payload) {
        String messageId = payload.get("messageId");
        if (messageId != null) {
            ChatMessage msg = messageCache.get(messageId);
            if (msg != null) {
                msg.setDeliveredCount(msg.getDeliveredCount() + 1);
                broadcastStatus(msg);
            }
        }
    }

    @MessageMapping("/read")
    public void handleRead(@Payload Map<String, String> payload) {
        String messageId = payload.get("messageId");
        if (messageId != null) {
            ChatMessage msg = messageCache.get(messageId);
            if (msg != null) {
                msg.setReadCount(msg.getReadCount() + 1);
                broadcastStatus(msg);
            }
        }
    }

    private void broadcastStatus(ChatMessage msg) {
        String channelId = msg.getChannelId();
        if (channelId == null || channelId.isEmpty()) {
            channelId = "public";
        }
        
        Map<String, Object> statusUpdate = new HashMap<>();
        statusUpdate.put("messageId", msg.getId());
        statusUpdate.put("deliveredCount", msg.getDeliveredCount());
        statusUpdate.put("readCount", msg.getReadCount());
        
        Set<String> usersInRoom = roomUsers.getOrDefault(channelId, Collections.emptySet());
        statusUpdate.put("totalOnline", usersInRoom.size());
        
        String destination = "/topic/status";
        if (!channelId.equals("public")) {
            destination = "/topic/channels/" + channelId + "/status";
        }
        messagingTemplate.convertAndSend(destination, statusUpdate);
    }

    private void broadcastPresence(String channelId) {
        Set<String> users = roomUsers.getOrDefault(channelId, Collections.emptySet());
        String destination = "/topic/presence";
        if (!channelId.equals("public")) {
            destination = "/topic/channels/" + channelId + "/presence";
        }
        messagingTemplate.convertAndSend(destination, new PresenceUpdate(new HashSet<>(users)));
    }

    public void removeUser(String username, String channelId) {
        if (channelId != null) {
            Set<String> users = roomUsers.get(channelId);
            if (users != null) {
                users.remove(username);
                if (users.isEmpty()) {
                    roomUsers.remove(channelId);
                } else {
                    broadcastPresence(channelId);
                }
            }
        }
    }

    @MessageMapping("/typing")
    public void handleTyping(@Payload TypingUpdate typingUpdate) {
        String channelId = typingUpdate.getChannelId();
        if (channelId == null || channelId.isEmpty()) {
            channelId = "public";
        }
        
        String destination = "/topic/typing";
        if (!channelId.equals("public")) {
            destination = "/topic/channels/" + channelId + "/typing";
        }
        messagingTemplate.convertAndSend(destination, typingUpdate);
    }

    public static class PresenceUpdate {
        private Set<String> users;
        public PresenceUpdate() {}
        public PresenceUpdate(Set<String> users) { this.users = users; }
        public Set<String> getUsers() { return users; }
        public void setUsers(Set<String> users) { this.users = users; }
    }

    public static class TypingUpdate {
        private String sender;
        private boolean typing;
        private String channelId;
        public TypingUpdate() {}
        public String getSender() { return sender; }
        public void setSender(String sender) { this.sender = sender; }
        public boolean isTyping() { return typing; }
        public void setTyping(boolean typing) { this.typing = typing; }
        public String getChannelId() { return channelId; }
        public void setChannelId(String channelId) { this.channelId = channelId; }
    }
}
