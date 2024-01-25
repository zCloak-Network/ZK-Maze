/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useImperativeHandle, forwardRef, useEffect, useState } from "react";
import {
  useSwitchNetwork,
  useContractRead,
  useAccount,
  useBalance,
} from "wagmi";
import { useWeb3ModalState } from "@web3modal/wagmi/react";
import { useDispatchStore } from "@/store";
import { ABI, RESULT_MAP, RESULT_COLOR_MAP } from "@/constants";
import { dispatch as dispatchGameState, Chain } from "../_utils";
import { getETH } from "@/api/zkp";
import { toast } from "react-toastify";

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
      console.log("game is ready", balanceData);
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

  const [sendETHLoading, setSendETHLoading] = useState(false);
  const sendETH = () => {
    if (address && !sendETHLoading) {
      setSendETHLoading(true);
      void getETH({
        ethAddress: address,
      })
        .then((res) => {
          if (res.data.txHash) {
            toast.success("Send ETH Success!");
            window.open(
              `${Chain.blockExplorers.default.url}/tx/${res.data.txHash}`
            );
          } else {
            toast.error("api error!");
          }
        })
        .catch((err) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          toast.error(err?.message || "fetch fail!");
        })
        .finally(() => {
          setSendETHLoading(false);
        });
    }
  };

  return (
    <>
      <header className="flex shadow mb-8 py-6 px-4 items-center relative">
        <img src="/Tiles/tile_0051.png" className="w-8" />
        <div className="font-semibold flex-1 text-primary text-2xl">
          ZK Maze
        </div>
        <div className="flex h-full w-full top-0 left-0 justify-center items-center absolute">
          <div
            className="tooltip tooltip-bottom tooltip-accent"
            data-tip="Haven't Played < Done < Efficiency First"
          >
            <div className="cursor-pointer stats">
              {isContractLoading ? (
                <span>loading</span>
              ) : (
                <div className="py-2 stat">
                  <div
                    className={
                      "stat-figure text-" + RESULT_COLOR_MAP[Number(data)] || ""
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
        Number(balanceData?.value || 0) < 2000000000000000n && (
          <div className="wrap">
            <div role="alert" className="mt-2 alert">
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
                Your balance({balanceData?.formatted || 0}
                {balanceData?.symbol}) is not enough!
              </span>
              <div>
                <button
                  className="btn btn-success btn-sm"
                  disabled={isBalanceLoading || sendETHLoading}
                  onClick={sendETH}
                >
                  {(isBalanceLoading || sendETHLoading) && (
                    <span className="loading loading-spinner"></span>
                  )}
                  request ETH
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
});

export default Header;
