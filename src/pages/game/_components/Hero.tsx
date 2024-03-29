// import { ButtonEnable } from "@/components";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export const Hero = () => {
  const { open } = useWeb3Modal();
  const { setVisible } = useWalletModal();

  const handleConnectWallet = () => {
    void open();
  };

  const handleConnectSolanaWallet = () => {
    void setVisible(true);
  };

  return (
    <div
      className="min-h-screen hero"
      style={{
        backgroundImage: "url(/nauris-amatnieks-forestbattlebackground.jpg)",
      }}
    >
      <div className="bg-opacity-60 hero-overlay"></div>
      <div className="text-center text-neutral-content hero-content">
        <div className="max-w-md">
          <h1 className="font-bold mb-5 text-5xl">ZK Maze</h1>
          <p className="mb-5">
            In this maze game, wit and strategy are your tools. Find the
            shortest path, skillfully avoid obstacles, and victory is within
            reach. Ready? Adventure is calling!
          </p>

          <div className="flex flex-col gap-2 w-[300px] m-auto">
            <button
              className="btn btn-primary"
              onClick={() => void handleConnectWallet()}
            >
              Connect EVM Wallet to Play
            </button>
            <div
              className="tooltip tooltip-bottom"
              data-tip="Please switch your wallet to Devnet by selecting:
              Settings -> Developer Settings -> Testnet Mode -> Solana Devnet"
            >
              <button
                className="btn btn-accent text-white border-0 bg-[#512da8] btn-block"
                onClick={() => void handleConnectSolanaWallet()}
              >
                Connect Solana Devnet to Play
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
