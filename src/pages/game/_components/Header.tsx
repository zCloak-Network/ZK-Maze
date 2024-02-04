import { useImperativeHandle, forwardRef, useEffect } from "react";
import { useSwitchChain, useReadContract, useAccount } from "wagmi";
import { useWeb3ModalState } from "@web3modal/wagmi/react";
import { useDispatchStore } from "@/store";
import {
  ABI,
  RESULT_MAP,
  RESULT_COLOR_MAP,
  RESULT_DESCRIPTION,
} from "@/constants";
import { dispatch as dispatchGameState, Chain } from "../_utils";

const ContractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;

// eslint-disable-next-line react/display-name
const Header = forwardRef((_props, ref) => {
  const dispatch = useDispatchStore();

  const { selectedNetworkId } = useWeb3ModalState();
  const { error, isPending, switchChain } = useSwitchChain();
  const { address } = useAccount();

  useEffect(() => {
    if (String(selectedNetworkId) === String(Chain.id)) {
      console.log("game is ready");
      dispatchGameState &&
        dispatchGameState({
          type: "ready",
          param: {
            ready: true,
          },
        });
    } else {
      if (String(selectedNetworkId) !== String(Chain.id)) {
        switchChain?.({ chainId: Chain.id });
      }
      console.log("game is lock");
      dispatchGameState &&
        dispatchGameState({
          type: "ready",
          param: {
            ready: false,
          },
        });
    }
  }, [selectedNetworkId, switchChain]);

  const {
    data,
    isPending: isContractLoading,
    isSuccess: isContractSuccess,
    refetch,
  } = useReadContract({
    address: ContractAddress,
    abi: ABI,
    functionName: "checkUserAchievement",
    args: [address],
  });

  useEffect(() => {
    if (isContractSuccess) {
      console.log("useReadContract", data);
      dispatch &&
        dispatch({
          type: "update",
          param: data,
        });
    }
  }, [isContractSuccess, data, dispatch]);

  useImperativeHandle(
    ref,
    () => {
      return {
        refetch,
      };
    },
    [refetch]
  );

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
                {isContractLoading ? (
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
        <w3m-button balance={"hide"} />
      </header>

      {String(selectedNetworkId) !== String(Chain.id) && (
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
              Your network({selectedNetworkId}) is not connected to ZK Maze,
              Please switch Network.
            </span>
            <div>
              <button
                className="btn btn-primary btn-sm"
                disabled={isPending}
                onClick={() => switchChain?.({ chainId: Chain.id })}
              >
                {isPending ? "switching" : "switch network"}
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
});

export default Header;
