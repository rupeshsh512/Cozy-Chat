import { useState } from "react";
import JoinPage from "./JoinPage";
import ChatPage from "./ChatPage";

const Index = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string>("public");

  if (!username) {
    return (
      <JoinPage
        onJoin={(name, channel) => {
          setUsername(name);
          setChannelId(channel);
        }}
      />
    );
  }

  return (
    <ChatPage
      username={username}
      channelId={channelId}
      onLogout={() => {
        setUsername(null);
        setChannelId("public");
      }}
    />
  );
};

export default Index;
