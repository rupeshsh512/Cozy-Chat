import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: "CHAT" | "JOIN" | "LEAVE";
  deliveredCount?: number;
  readCount?: number;
  totalOnline?: number;
}

interface MessageListProps {
  messages: ChatMessage[];
  currentUser: string;
}

const AVATAR_COLORS = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
  "bg-avatar-6",
  "bg-avatar-7",
  "bg-avatar-8",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const MessageTicks = ({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) => {
  if (!isMe || msg.type !== "CHAT") return null;

  // Seen by all online members (excluding sender)
  const isSeenByAll = (msg.readCount || 0) >= (msg.totalOnline || 1) - 1 && (msg.totalOnline || 1) > 1;

  if (isSeenByAll) {
    return (
      <span className="flex items-center text-success font-bold" title="Seen by everyone">
        <span className="text-[10px] transform translate-x-1">✓</span>
        <span className="text-[10px]">✓</span>
      </span>
    );
  }

  return <span className="text-[10px] text-muted-foreground/50 dark:text-blue-400/60 font-bold" title="Sent">✓</span>;
};

export default function MessageList({ messages, currentUser }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
    }
  };

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    messages.forEach((msg) => {
      const d = new Date(msg.timestamp);
      const isValidDate = !isNaN(d.getTime());
      
      const date = isValidDate 
        ? d.toLocaleDateString([], {
            weekday: "long",
            month: "short",
            day: "numeric",
          })
        : "Unknown Date";

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === date) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 relative">
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 md:px-8 py-6 space-y-1 scrollbar-none"
      >
        <div className="w-full">
          {groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-4 my-8 opacity-40">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  {group.date}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-1">
                {group.messages.map((msg, idx) => {
                  const isMe = msg.sender === currentUser;
                  const prevMsg = group.messages[idx - 1];
                  const isConsecutive = prevMsg && prevMsg.sender === msg.sender && prevMsg.type === "CHAT";

                  if (msg.type !== "CHAT") {
                    return (
                      <div key={msg.id || idx} className="flex justify-center py-2">
                        <span className="px-3 py-1 rounded-full bg-secondary/30 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  const d = new Date(msg.timestamp);
                  const timeStr = !isNaN(d.getTime()) 
                    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "--:--";

                  return (
                    <motion.div
                      key={msg.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} ${isConsecutive ? "mt-0.5" : "mt-4"}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar */}
                        <div className="w-8 shrink-0 flex items-end pb-1">
                          {!isMe && !isConsecutive && (
                            <div className={`w-8 h-8 rounded-full ${getAvatarColor(msg.sender)} text-white flex items-center justify-center text-[11px] font-bold shadow-sm`}>
                              {msg.sender[0].toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} min-w-0`}>
                          {!isMe && !isConsecutive && (
                            <span className="text-[11px] font-bold text-muted-foreground ml-1 mb-1 shadow-sm uppercase tracking-wider opacity-80">
                              {msg.sender}
                            </span>
                          )}
                          <div
                            className={`group relative px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                              isMe
                                ? `bg-primary text-primary-foreground ${!isConsecutive ? "rounded-tr-md" : ""}`
                                : `bg-secondary text-secondary-foreground ${!isConsecutive ? "rounded-tl-md" : ""}`
                            } shadow-sm`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <div className={`text-[10px] mt-1 opacity-60 tabular-nums flex items-center gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                               <span>{timeStr}</span>
                               <MessageTicks msg={msg} isMe={isMe} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-6 right-6 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <span className="text-xl">↓</span>
            </motion.div>
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
