import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { WagmiConfig } from "wagmi";
import { Azeroth } from "./chain";

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "9b4a033ddb52a00e24afe26be68e50cb";

// 2. Create wagmiConfig
const metadata = {
  name: "ZK Maze",
  description: "Web3 game by zCloakNetwork",
  url: "https://zkmaze.zkid.xyz/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [Azeroth];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: "light",
});

export function WagmiRoot({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}
