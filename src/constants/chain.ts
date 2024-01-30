import { Chain } from "wagmi/chains";

export const L3 = {
  id: 76297047005,
  name: "Azeroth",
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

export const L3Dev = {
  id: 76297047005,
  name: "Azeroth",
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
