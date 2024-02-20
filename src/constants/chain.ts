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

export const ContractAddressMap: Record<number, `0x${string}`> = {
  421614: "0xce68617D6575EDe95aF1eAaC7489b06F3b107D9f",
  11155420: "0x8000000000000000000000000000000000000001",
  84532: "0x8000000000000000000000000000000000000002",
};
