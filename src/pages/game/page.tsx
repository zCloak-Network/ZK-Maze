import { Hero } from "./_components/Hero";
import { Game } from "./_components/Game";
import { useAccountEffect } from "wagmi";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDispatchStore, useStateStore } from "@/store";
import { Howl } from "howler";

export default function GamePage() {
  const [isConnected, setIsconnected] = useState(false);
  const dispatch = useDispatchStore();
  const { connected } = useWallet();
  const { network, bgm } = useStateStore();

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

  const [soundLoaded, setSoundLoaded] = useState(false);
  const sound = useRef(
    new Howl({
      src: ["/bgm.mp3"],
      volume: 0.7,
      loop: true,
      onload: () => {
        console.log("music onload");
        setSoundLoaded(true);
      },
    })
  );

  useEffect(() => {
    console.log("isConnected", isConnected, "bgm", bgm, "state", soundLoaded);
    if (soundLoaded) {
      if (isConnected && bgm) {
        sound.current.play();
      } else {
        sound.current.pause();
      }
    }
  }, [isConnected, bgm, soundLoaded]);

  return isConnected ? <Game /> : <Hero />;
}
