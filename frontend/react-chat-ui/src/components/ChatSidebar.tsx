import { useState, useEffect } from "react";
import { Hash, LogOut, Moon, Sun, Circle } from "lucide-react";

interface ChatSidebarProps {
  username: string;
  connected: boolean;
  onlineUsers: string[];
  currentChannel: string;
  onLogout?: () => void;
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

export default function ChatSidebar({ 
  username, 
  connected, 
  onlineUsers, 
  currentChannel,
  onLogout 
}: ChatSidebarProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
             (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Hash size={18} className="text-primary-foreground" />
          </div>
          <h1 className="font-semibold text-sidebar-primary text-lg tracking-tight">Cozy Chat</h1>
        </div>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-none pt-6">
        {/* Current Space Info */}
        <div className="px-3 py-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
            Current Space
          </p>
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-primary dark:text-blue-400" />
            <span className="text-[14px] font-semibold text-sidebar-primary truncate">
              {currentChannel === "public" ? "General Chat" : currentChannel}
            </span>
          </div>
        </div>

        {/* Online Users */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-sidebar-foreground uppercase tracking-widest px-2 mb-2 opacity-50">
            Online — {onlineUsers.length}
          </p>
          <div className="space-y-0.5">
            {onlineUsers.length === 0 ? (
              <p className="text-[12px] text-muted-foreground px-2 italic">Nobody's around...</p>
            ) : (
              onlineUsers.map((user) => (
                <div key={user} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer group">
                  <div className="relative">
                    <div className={`w-7 h-7 rounded-2xl ${getAvatarColor(user)} text-white flex items-center justify-center text-[10px] font-bold shadow-sm`}>
                      {user[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-sidebar-background" />
                  </div>
                  <span className="text-[13px] text-sidebar-accent-foreground font-medium truncate">{user}</span>
                  {user === username && (
                    <span className="text-[10px] text-muted-foreground ml-auto bg-muted/30 px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl ${getAvatarColor(username)} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
            {username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-sidebar-primary truncate">{username}</p>
            <div className="flex items-center gap-1.5">
              <Circle size={8} className={connected ? "fill-success text-success" : "fill-muted-foreground text-muted-foreground"} />
              <span className="text-[11px] text-muted-foreground font-medium">
                {connected ? "Connected" : "Offline"}
              </span>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
              title="Disconnect"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
