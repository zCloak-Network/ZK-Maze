import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { WagmiProvider } from "wagmi";
import { arbitrumSepolia, type Chain } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "9b4a033ddb52a00e24afe26be68e50cb";

// 2. Create wagmiConfig
const metadata = {
  name: "ZK Maze",
  description: "Web3 game by zCloakNetwork",
  url: "https://zkmaze.zkid.xyz/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [arbitrumSepolia] as [Chain, ...Chain[]];
const config = defaultWagmiConfig({
  chains, // required
  projectId, // required
  metadata, // required
  enableWalletConnect: true, // Optional - true by default
  enableInjected: true, // Optional - true by default
  enableEIP6963: true, // Optional - true by default
  enableCoinbase: true, // Optional - true by default
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  themeMode: "light",
});

export function Web3Modal({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
