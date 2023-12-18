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
    public: { http: ["https://nitro.zkid.xyz/"] },
    default: { http: ["https://nitro.zkid.xyz/"] },
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "http://54.184.214.151:4000" },
  },
} as const satisfies Chain;

export const L3Dev = {
  id: 412346,
  name: "Azeroth test",
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
    default: { name: "SnowTrace", url: "https://54.184.214.151:4000" },
  },
} as const satisfies Chain;
