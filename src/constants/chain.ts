import { Chain } from "wagmi";

export const L3 = {
  id: 91751576100,
  name: "Azeroth",
  network: "Azeroth",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://nitro.zkid.app/"] },
    default: { http: ["https://nitro.zkid.app/"] },
  },
  blockExplorers: {
    default: {
      name: "AzerothExplorer",
      url: "https://nitro-explorer.zkid.app",
    },
  },
} as const satisfies Chain;

export const L3Dev = {
  id: 42815099000,
  name: "Azeroth Test",
  network: "Azeroth Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://nitro.zkid.xyz/"] },
    default: { http: ["https://nitro.zkid.xyz/"] },
  },
  blockExplorers: {
    default: {
      name: "AzerothExplorer",
      url: "https://nitro-explorer.zkid.xyz",
    },
  },
} as const satisfies Chain;

export const Azeroth = import.meta.env.MODE === "production" ? L3 : L3Dev;
