import { Hero } from "./_components/Hero";
import { Game } from "./_components/Game";
import { useAccountEffect } from "wagmi";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDispatchStore, useStateStore } from "@/store";
import { Howl } from "howler";

export default function GamePage() {
  const [isConnected, setIsconnected] = useState(false);
  const dispatch = useDispatchStore();
  const { connected } = useWallet();
  const { network } = useStateStore();

  useAccountEffect({
    onConnect() {
      dispatch && dispatch({ type: "network", param: "evm" });
      setIsconnected(true);
    },
    onDisconnect() {
      window.location.reload();
    },
  });

  useEffect(() => {
    if (connected) {
      dispatch && dispatch({ type: "network", param: "solana" });
      setIsconnected(true);
    } else if (network === "solana") {
      window.location.reload();
    }
  }, [connected, dispatch, network]);

  const sound = new Howl({
    src: ["/bgm.mp3"],
    volume: 0.7,
    loop: true,
  });

  useEffect(() => {
    console.log("isConnected", isConnected);
    if (isConnected) {
      sound.play();
    } else {
      sound.stop();
    }
  }, [isConnected]);

  return isConnected ? <Game /> : <Hero />;
}
