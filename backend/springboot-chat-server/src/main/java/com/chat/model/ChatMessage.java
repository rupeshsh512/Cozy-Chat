package com.chat.model;

public class ChatMessage {
    public enum MessageType {
        CHAT, JOIN, LEAVE, TYPING
    }

    private String id;
    private String sender;
    private String content;
    private String timestamp;
    private MessageType type;
    private int deliveredCount;
    private int readCount;
    private String channelId;

    public ChatMessage() {}

    public ChatMessage(String id, String sender, String content, String timestamp, MessageType type) {
        this.id = id;
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    public int getDeliveredCount() { return deliveredCount; }
    public void setDeliveredCount(int deliveredCount) { this.deliveredCount = deliveredCount; }
    public int getReadCount() { return readCount; }
    public void setReadCount(int readCount) { this.readCount = readCount; }
    public String getChannelId() { return channelId; }
    public void setChannelId(String channelId) { this.channelId = channelId; }
}
