import { useImperativeHandle, forwardRef, useEffect } from "react";
import {
  useSwitchNetwork,
  useContractRead,
  useAccount,
  useBalance,
} from "wagmi";
import { useWeb3ModalState } from "@web3modal/wagmi/react";
import { useDispatchStore } from "@/store";
import { ABI, RESULT_MAP, RESULT_COLOR_MAP, L3, L3Dev } from "@/constants";
import { dispatch as dispatchGameState } from "../_utils";

const Chain = import.meta.env.MODE === "development" ? L3Dev : L3;
const ContractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;

// eslint-disable-next-line react/display-name
const Header = forwardRef((_props, ref) => {
  const dispatch = useDispatchStore();

  const { selectedNetworkId } = useWeb3ModalState();
  const { error, isLoading, switchNetwork } = useSwitchNetwork();
  const { address, isConnected } = useAccount();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
  });

  useEffect(() => {
    if (
      String(selectedNetworkId) === String(Chain.id) &&
      !isBalanceLoading &&
      balanceData
    ) {
      console.log("game is ready");
      dispatchGameState &&
        dispatchGameState({
          type: "ready",
          param: {
            ready: true,
          },
        });
    } else {
      console.log("game is lock");
      dispatchGameState &&
        dispatchGameState({
          type: "ready",
          param: {
            ready: false,
          },
        });
    }
  }, [selectedNetworkId, isBalanceLoading, balanceData]);

  const {
    data,
    isLoading: isContractLoading,
    refetch,
  } = useContractRead({
    address: ContractAddress,
    abi: ABI,
    functionName: "checkUserAchievement",
    args: [address],
    onSuccess: (data) => {
      console.log("useContractRead", data);
      dispatch &&
        dispatch({
          type: "update",
          param: data,
        });
    },
  });

  useImperativeHandle(
    ref,
    () => {
      return {
        refetch,
      };
    },
    []
  );

  return (
    <>
      <header className="flex shadow px-4 py-6 items-center mb-12 relative">
        <img src="/Tiles/tile_0051.png" className="w-8" />
        <div className="font-semibold flex-1 text-primary text-2xl">
          ZK Maze
        </div>
        <div className="flex justify-center items-center absolute left-0 w-full h-full top-0">
          <div
            className="tooltip tooltip-bottom tooltip-accent"
            data-tip="Haven't Played < Done < Efficiency First"
          >
            <div className="stats cursor-pointer">
              {isContractLoading ? (
                <span>loading</span>
              ) : (
                <div className="stat py-2">
                  <div
                    className={
                      "stat-figure text-" + RESULT_COLOR_MAP[Number(data)] || ""
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block w-8 h-8 stroke-current"
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
                      "stat-value text-" + RESULT_COLOR_MAP[Number(data)] || ""
                    }
                  >
                    {RESULT_MAP[Number(data)] || "--"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <w3m-button />
      </header>

      {isConnected && String(selectedNetworkId) !== String(Chain.id) && (
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
                disabled={isLoading}
                onClick={() => switchNetwork?.(Chain.id)}
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
      {String(selectedNetworkId) === String(Chain.id) &&
        balanceData?.value &&
        Number(balanceData.value) <= 100 && (
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
              Your balance({balanceData.formatted}
              {balanceData?.symbol}) is not enough!
            </span>
            <div>
              <button className="btn btn-success btn-sm" disabled={isLoading}>
                {isLoading ? "requesting" : "request ETH"}
              </button>
            </div>
          </div>
        )}
    </>
  );
});

export default Header;
