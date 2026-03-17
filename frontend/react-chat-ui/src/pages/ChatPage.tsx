import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Wifi, WifiOff } from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import TypingIndicator from "../components/TypingIndicator";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface ChatPageProps {
  username: string;
  channelId: string;
  onLogout: () => void;
}

const ChatPage = ({ username, channelId, onLogout }: ChatPageProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const socket = new SockJS(`${apiUrl}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        const isPublic = channelId === "public";
        const messageTopic = isPublic ? "/topic/messages" : `/topic/channels/${channelId}`;
        const statusTopic = isPublic ? "/topic/status" : `/topic/channels/${channelId}/status`;
        const presenceTopic = isPublic ? "/topic/presence" : `/topic/channels/${channelId}/presence`;
        const typingTopic = isPublic ? "/topic/typing" : `/topic/channels/${channelId}/typing`;

        client.subscribe(messageTopic, (message) => {
          const msg = JSON.parse(message.body);
          setMessages((prev) => [...prev, msg]);
          
          if (msg.sender !== username) {
            client.publish({
              destination: "/app/ack",
              body: JSON.stringify({ messageId: msg.id, channelId }),
            });
            // Auto-read for now
            client.publish({
              destination: "/app/read",
              body: JSON.stringify({ messageId: msg.id, channelId }),
            });
          }
        });

        client.subscribe(statusTopic, (message) => {
          const update = JSON.parse(message.body);
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === update.messageId 
                ? { ...msg, deliveredCount: update.deliveredCount, readCount: update.readCount, totalOnline: update.totalOnline } 
                : msg
            )
          );
        });

        client.subscribe(presenceTopic, (message) => {
          const presence = JSON.parse(message.body);
          setOnlineUsers(presence.users || []);
        });

        client.subscribe(typingTopic, (message) => {
          const update = JSON.parse(message.body);
          if (update.sender !== username) {
            setTypingUsers((prev) => {
              if (update.typing) {
                return prev.includes(update.sender) ? prev : [...prev, update.sender];
              } else {
                return prev.filter((u) => u !== update.sender);
              }
            });
          }
        });

        client.subscribe("/topic/errors", (message) => {
          const error = JSON.parse(message.body);
          if (error.username === username) {
            alert(error.message);
            onLogout();
          }
        });

        client.publish({
          destination: "/app/join",
          body: JSON.stringify({ sender: username, type: "JOIN", channelId }),
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [username, channelId]);

  const sendMessage = (content: string) => {
    if (stompClient.current?.connected) {
      const chatMessage = {
        sender: username,
        content: content,
        type: "CHAT",
        timestamp: new Date().toISOString(),
        channelId: channelId,
      };
      stompClient.current.publish({
        destination: "/app/send",
        body: JSON.stringify(chatMessage),
      });
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: "/app/typing",
        body: JSON.stringify({ sender: username, typing: isTyping, channelId: channelId }),
      });
    }
  };

  return (
    <div className="flex h-svh bg-background overflow-hidden font-sans">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 border-r border-border bg-sidebar transform transition-transform duration-300 ease-in-out md:transform-none ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <ChatSidebar
          username={username}
          connected={connected}
          onlineUsers={onlineUsers}
          currentChannel={channelId}
          onLogout={onLogout}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="font-bold text-foreground text-lg tracking-tight">
                {channelId === "public" ? "Public Chat" : `#${channelId}`}
              </h2>
              <div className="flex items-center gap-1.5 opacity-60">
                <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-success" : "bg-warning animate-pulse"}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {connected ? "Connected" : "Waking up server..."}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                <span className="text-[11px] font-bold text-muted-foreground">{onlineUsers.length} Online</span>
             </div>
             {connected ? <Wifi size={16} className="text-success opacity-50" /> : <WifiOff size={16} className="text-muted-foreground opacity-30" />}
          </div>
        </header>

        <MessageList messages={messages} currentUser={username} />

        <AnimatePresence>
           <TypingIndicator typingUsers={typingUsers} />
        </AnimatePresence>

        <MessageInput onSend={sendMessage} onTyping={handleTyping} />
      </main>
    </div>
  );
};

export default ChatPage;
