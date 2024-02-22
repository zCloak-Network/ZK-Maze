import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { WagmiProvider } from "wagmi";
import {
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
  type Chain,
} from "wagmi/chains";
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

// eslint-disable-next-line react-refresh/only-export-components
export const chains = [arbitrumSepolia, baseSepolia, optimismSepolia] as [
  Chain,
  ...Chain[]
];

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
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  themeMode: "light",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

export function Web3Modal({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
