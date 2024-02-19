import { useImperativeHandle, forwardRef, useEffect } from "react";
import { useReadContract, useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDispatchStore, useStateStore } from "@/store";
import {
  ABI,
  RESULT_MAP,
  RESULT_COLOR_MAP,
  RESULT_DESCRIPTION,
} from "@/constants";
import {
  dispatch as dispatchGameState,
  useCurrentChain,
  supportChain,
  useEVMContractAddress,
} from "../_utils";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useSolana from "../_utils/useSolana";

// eslint-disable-next-line react/display-name
const Header = forwardRef((_props, ref) => {
  const ContractAddress = useEVMContractAddress();

  const dispatch = useDispatchStore();
  const { network } = useStateStore();

  const { open } = useWeb3Modal();
  const { address } = useAccount();
  const Chain = useCurrentChain();

  useEffect(() => {
    if (network !== "solana") {
      if (supportChain.find((e) => e.id === Chain?.id)) {
        console.log("game is ready");
        dispatchGameState &&
          dispatchGameState({
            type: "ready",
            param: {
              ready: true,
            },
          });
      } else {
        console.log("game is lock", supportChain, Chain);
        dispatchGameState &&
          dispatchGameState({
            type: "ready",
            param: {
              ready: false,
            },
          });
      }
    } else {
      console.log("game is ready with solana");
      dispatchGameState &&
        dispatchGameState({
          type: "ready",
          param: {
            ready: true,
          },
        });
    }
  }, [network]);

  const {
    data: contractData,
    // isPending: isContractLoading,
    isSuccess: isContractSuccess,
    refetch: refetchContract,
  } = useReadContract({
    address: ContractAddress,
    abi: ABI,
    functionName: "checkUserAchievement",
    args: [address],
    query: {
      enabled: network !== "solana",
    },
  });

  useEffect(() => {
    console.log("evm useReadContract", contractData);
    if (isContractSuccess && contractData) {
      dispatch &&
        dispatch({
          type: "update",
          param: contractData,
        });
    }
  }, [contractData, isContractSuccess]);

  const {
    data: solanaData,
    // isPending: isSolanaLoading,
    isSuccess: isSolanaSuccess,
    refetch: fetchSolana,
  } = useSolana();

  useEffect(() => {
    console.log("solana read", isSolanaSuccess, solanaData);
    if (isSolanaSuccess) {
      dispatch &&
        dispatch({
          type: "update",
          param: solanaData,
        });
    }
  }, [isSolanaSuccess, solanaData]);

  useImperativeHandle(
    ref,
    () => {
      return {
        refetch: () => {
          if (network !== "solana") {
            void refetchContract?.();
          } else {
            fetchSolana?.();
          }
        },
      };
    },
    [network, refetchContract, fetchSolana]
  );

  const data = network !== "solana" ? contractData : solanaData;
  const isLoading = false; // network !== "solana" ? isContractLoading : isSolanaLoading;

  return (
    <>
      <header className="flex shadow mb-8 py-6 px-4 items-center relative">
        <img src="/Tiles/tile_0051.png" className="w-8" />
        <div className="font-semibold flex-1 text-primary text-2xl">
          ZK Maze
        </div>
        {Number(data) !== 0 ? (
          <div className="flex h-full w-full top-0 left-0 justify-center items-center absolute">
            <div
              className="tooltip tooltip-bottom tooltip-accent"
              data-tip={RESULT_DESCRIPTION[Number(data)]}
            >
              <div className="cursor-pointer stats">
                {isLoading ? (
                  <span>loading</span>
                ) : (
                  <div className="py-2 stat">
                    <div
                      className={
                        "stat-figure text-" + RESULT_COLOR_MAP[Number(data)] ||
                        ""
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="h-8 stroke-current w-8 inline-block"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                    </div>
                    <div className="stat-title">Your Achievement</div>
                    <div
                      className={
                        "stat-value text-" + RESULT_COLOR_MAP[Number(data)] ||
                        ""
                      }
                    >
                      {RESULT_MAP[Number(data)] || "--"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
        {network !== "solana" && <w3m-button balance={"hide"} />}
        {network === "solana" && (
          <WalletMultiButton
            style={{
              borderRadius: "10px",
            }}
          />
        )}
      </header>

      {network !== "solana" &&
        !supportChain.find((e) => e.id === Chain?.id) && (
          <div className="wrap">
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
                Your network({Chain?.id}) is not connected to ZK Maze, Please
                switch Network.
              </span>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => open({ view: "Networks" })}
                >
                  {"switch network"}
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
});

export default Header;
