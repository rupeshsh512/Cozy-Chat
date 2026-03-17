import { useState, useRef, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
}

const COMMON_EMOJIS = [
  "😊", "😂", "🤣", "😍", "🥰", "😎", "🤔", "🧐", "🤫", "😅", "🤮", "🥺",
  "👋", "🙌", "👏", "🙏", "👍", "👎", "🤝", "💪", "❤️", "🔥", "✨", "🌟",
  "🎉", "🎈", "🚀", "💡", "💯", "✅", "❌", "🌈", "🍕", "☕", "🎮", "💻",
];

export default function MessageInput({ onSend, onTyping }: MessageInputProps) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "0";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  // Click outside to close picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleTyping = () => {
    onTyping?.(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping?.(false), 2000);
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
      onTyping?.(false);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      setShowEmojiPicker(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-background border-t border-border shrink-0 relative">
      <div className="w-full flex items-end gap-2 bg-secondary/50 rounded-2xl p-2 border border-border/50 focus-within:border-primary/30 transition-all relative">
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-xl transition-colors ${showEmojiPicker ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Smile size={20} />
          </button>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full left-0 mb-4 p-3 bg-popover border border-border rounded-2xl shadow-xl w-64 z-50 overflow-hidden"
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Quick Emojis</p>
                <div className="grid grid-cols-6 gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-secondary rounded-xl transition-all active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none py-2 max-h-[120px] scrollbar-none text-[15px]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-2.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-30 transition-all hover:opacity-90 active:scale-95 shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
