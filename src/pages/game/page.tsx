import { Hero } from "./_components/Hero";
import { Game } from "./_components/Game";
import { useAccountEffect } from "wagmi";
import { useState } from "react";

export default function GamePage() {
  const [isConnected, setIsconnected] = useState(false);

  useAccountEffect({
    onConnect() {
      setIsconnected(true);
    },
    onDisconnect() {
      window.location.reload();
    },
  });

  return isConnected ? <Game /> : <Hero />;
}
