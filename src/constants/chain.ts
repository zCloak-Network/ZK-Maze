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
  421614: "0xce68617D6575EDe95aF1eAaC7489b06F3b107D9f", //arbitrumSepolia
  11155420: "0x0483e88cd38cccb71c9c1020faf830d905542d09", //optimismSepolia
  84532: "0x0483e88cd38cccb71c9c1020faf830d905542d09", //baseSepolia
};

export const SBTAddressMap: Record<number, `0x${string}`> = {
  421614: "0x6889695c0A6272410Af24766bbf3980F2466a1dc", //arbitrumSepolia
  11155420: "0x2e842f6e3fbf093981938f4e24892185bbdad727", //optimismSepolia
  84532: "0x078f00401536a55E973d4a2Cf26a9B1f98544d52", //baseSepolia
};

export const SBTBrowserMap: Record<
  number,
  (id?: number, hash?: string) => string
> = {
  421614: function (id?: number) {
    return `https://testnets.opensea.io/zh-CN/assets/arbitrum-sepolia/0x6889695c0a6272410af24766bbf3980f2466a1dc/${id}`;
  },
  11155420: function (id?: number, hash?: string) {
    return `https://optimism-sepolia.blockscout.com/token/${hash}`;
  },
  84532: function (id?: number) {
    return `https://testnets.opensea.io/zh-CN/assets/base-sepolia/0x078f00401536a55e973d4a2cf26a9b1f98544d52/${id}`;
  },
};

export const FaucetMap: Record<number, Record<string, string>[]> = {
  421614: [
    { "Faucet by Alchemy": "https://www.alchemy.com/faucets/arbitrum-sepolia" },
    { "Faucet by QuickNode": "https://faucet.quicknode.com/arbitrum/sepolia/" },
  ],
  11155420: [
    { "Faucet by Alchemy": "https://www.alchemy.com/faucets/optimism-sepolia" },
    { "Faucet by QuickNode": "https://faucet.quicknode.com/optimism/sepolia" },
  ],
  84532: [
    { "Faucet by Alchemy": "https://www.alchemy.com/faucets/base-sepolia" },
    { "Faucet by QuickNode": "https://faucet.quicknode.com/base/sepolia" },
  ],
};
