import { useWalletClient } from "wagmi";
import { L3 } from "@/hooks/ctx/chain";
import { useWeb3ModalState } from "@web3modal/wagmi/react";

export const Header = () => {
  const { selectedNetworkId } = useWeb3ModalState();
  const { data: walletClient } = useWalletClient();

  if (selectedNetworkId !== String(L3.id)) {
    walletClient?.addChain({ chain: L3 });
  }

  return (
    <header className="flex shadow p-4 items-center">
      <img src="/Tiles/tile_0051.png" className="w-8" />
      <div className="font-semibold flex-1 text-primary text-2xl">ZK Maze</div>
      <w3m-button />
    </header>
  );
};
