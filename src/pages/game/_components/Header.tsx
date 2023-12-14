import { useSwitchNetwork } from "wagmi";
import { L3 } from "@/hooks/ctx/chain";
import { useWeb3ModalState } from "@web3modal/wagmi/react";

export const Header = () => {
  const { selectedNetworkId } = useWeb3ModalState();
  const { error, isLoading, switchNetwork } = useSwitchNetwork();

  return (
    <>
      <header className="flex shadow p-4 items-center">
        <img src="/Tiles/tile_0051.png" className="w-8" />
        <div className="font-semibold flex-1 text-primary text-2xl">
          ZK Maze
        </div>
        <w3m-button />
      </header>
      {selectedNetworkId !== String(L3.id) && (
        <div className="my-4 wrap">
          <div role="alert" className="alert ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 stroke-current w-6 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="text-sm">
              Your network is not connected to ZK Maze, Please switch to L3
              Network.
            </span>
            <div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => switchNetwork?.(L3.id)}
              >
                {isLoading ? "switching" : "switch network"}
              </button>
            </div>
          </div>
          {error && (
            <div role="alert" className="mt-2 alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 stroke-current w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{error.message}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};
