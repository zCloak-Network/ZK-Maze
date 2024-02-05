import { Hero } from "./_components/Hero";
import { Game } from "./_components/Game";
import { useAccountEffect } from "wagmi";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDispatchStore, useStateStore } from "@/store";

export default function GamePage() {
  const [isConnected, setIsconnected] = useState(false);
  const dispatch = useDispatchStore();
  const { connected } = useWallet();
  const { network } = useStateStore();

  useAccountEffect({
    onConnect() {
      dispatch && dispatch({ type: "network", param: "arbitrum-sepolia" });
      setIsconnected(true);
    },
    onDisconnect() {
      window.location.reload();
    },
  });

  useEffect(() => {
    if (connected) {
      console.log("solana connected", connected);
      dispatch && dispatch({ type: "network", param: "solana" });
      setIsconnected(true);
    } else if (network === "solana") {
      window.location.reload();
    }
  }, [connected, dispatch, network]);

  return isConnected ? <Game /> : <Hero />;
}
