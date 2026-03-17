import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Users, Zap } from "lucide-react";

interface JoinPageProps {
  onJoin: (username: string, channelId: string) => void;
}

const features = [
  { icon: MessageCircle, label: "Real-time messaging" },
  { icon: Users, label: "See who's online" },
  { icon: Zap, label: "Typing indicators" },
];

export default function JoinPage({ onJoin }: JoinPageProps) {
  const [username, setUsername] = useState("");
  const [channelId, setChannelId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim(), channelId.trim() || "public");
    }
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-surface p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-[420px] space-y-10"
      >
        {/* Logo / Brand */}
        <div className="space-y-3 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-14 h-14 mx-auto rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <MessageCircle className="text-primary-foreground" size={28} />
          </motion.div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Join Cozy Chat
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Enter a username to start chatting in real-time.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              autoFocus
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              maxLength={20}
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-foreground transition-all duration-150 text-[15px]"
            />
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="Channel (optional, default: public)"
              maxLength={20}
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-foreground transition-all duration-150 text-[15px]"
            />
            {username.trim() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 px-1"
              >
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  {username.trim()[0].toUpperCase()}
                </div>
                <span className="text-sm text-muted-foreground">
                  You'll appear as <strong className="text-foreground">{username.trim()}</strong>
                </span>
              </motion.div>
            )}
          </div>
          <button
            disabled={!username.trim()}
            className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] shadow-md shadow-primary/10"
          >
            Enter Chat
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6"
        >
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-muted-foreground">
              <Icon size={14} />
              <span className="text-[11px] font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
