/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useImperativeHandle, forwardRef, useEffect, useState } from "react";
import {
  useSwitchChain,
  useReadContract,
  useAccount,
  useBalance,
  useBlockNumber,
} from "wagmi";
import { useWeb3ModalState } from "@web3modal/wagmi/react";
import { useDispatchStore } from "@/store";
import {
  ABI,
  RESULT_MAP,
  RESULT_COLOR_MAP,
  RESULT_DESCRIPTION,
} from "@/constants";
import { dispatch as dispatchGameState, Chain } from "../_utils";
import { getETH } from "@/api/zkp";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const ContractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;

// eslint-disable-next-line react/display-name
const Header = forwardRef((_props, ref) => {
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const dispatch = useDispatchStore();

  const { selectedNetworkId } = useWeb3ModalState();
  const { error, isPending, switchChain } = useSwitchChain();
  const { address } = useAccount();
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    queryKey,
  } = useBalance({
    address,
  });

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient, queryKey]);

  useEffect(() => {
    if (
      String(selectedNetworkId) === String(Chain.id) &&
      !isBalanceLoading &&
      !(Number(balanceData?.value || 0) < 2000000000000000n)
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
  }, [selectedNetworkId, isBalanceLoading, balanceData, switchChain]);

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
            // window.open(
            //   `${Chain.blockExplorers.default.url}/tx/${res.data.txHash}`
            // );
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
                Minimum 0.002 ETH required. Your balance:
                {balanceData?.formatted || 0}
                {balanceData?.symbol}.
              </span>
              <div className="flex gap-2">
                {/* <button
                  className="btn btn-success btn-sm"
                  disabled={isBalanceLoading || sendETHLoading}
                  onClick={sendETH}
                >
                  {(isBalanceLoading || sendETHLoading) && (
                    <span className="loading loading-spinner"></span>
                  )}
                  request ETH
                </button> */}
                <button
                  className="btn btn-sm btn-success btn-outline"
                  onClick={() => {
                    window.open("https://arbitrum-faucet.com/");
                  }}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M9.16488 17.6505C8.92513 17.8743 8.73958 18.0241 8.54996 18.1336C7.62175 18.6695 6.47816 18.6695 5.54996 18.1336C5.20791 17.9361 4.87912 17.6073 4.22153 16.9498C3.56394 16.2922 3.23514 15.9634 3.03767 15.6213C2.50177 14.6931 2.50177 13.5495 3.03767 12.6213C3.23514 12.2793 3.56394 11.9505 4.22153 11.2929L7.04996 8.46448C7.70755 7.80689 8.03634 7.47809 8.37838 7.28062C9.30659 6.74472 10.4502 6.74472 11.3784 7.28061C11.7204 7.47809 12.0492 7.80689 12.7068 8.46448C13.3644 9.12207 13.6932 9.45086 13.8907 9.7929C14.4266 10.7211 14.4266 11.8647 13.8907 12.7929C13.7812 12.9825 13.6314 13.1681 13.4075 13.4078M10.5919 10.5922C10.368 10.8319 10.2182 11.0175 10.1087 11.2071C9.57284 12.1353 9.57284 13.2789 10.1087 14.2071C10.3062 14.5492 10.635 14.878 11.2926 15.5355C11.9502 16.1931 12.279 16.5219 12.621 16.7194C13.5492 17.2553 14.6928 17.2553 15.621 16.7194C15.9631 16.5219 16.2919 16.1931 16.9495 15.5355L19.7779 12.7071C20.4355 12.0495 20.7643 11.7207 20.9617 11.3787C21.4976 10.4505 21.4976 9.30689 20.9617 8.37869C20.7643 8.03665 20.4355 7.70785 19.7779 7.05026C19.1203 6.39267 18.7915 6.06388 18.4495 5.8664C17.5212 5.3305 16.3777 5.3305 15.4495 5.8664C15.2598 5.97588 15.0743 6.12571 14.8345 6.34955"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  Faucet by Alchemy
                </button>
                {/* https://faucet.quicknode.com/arbitrum/sepolia/ */}
                <button
                  className="btn btn-sm btn-success btn-outline"
                  onClick={() => {
                    window.open(
                      "https://faucet.quicknode.com/arbitrum/sepolia/"
                    );
                  }}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M9.16488 17.6505C8.92513 17.8743 8.73958 18.0241 8.54996 18.1336C7.62175 18.6695 6.47816 18.6695 5.54996 18.1336C5.20791 17.9361 4.87912 17.6073 4.22153 16.9498C3.56394 16.2922 3.23514 15.9634 3.03767 15.6213C2.50177 14.6931 2.50177 13.5495 3.03767 12.6213C3.23514 12.2793 3.56394 11.9505 4.22153 11.2929L7.04996 8.46448C7.70755 7.80689 8.03634 7.47809 8.37838 7.28062C9.30659 6.74472 10.4502 6.74472 11.3784 7.28061C11.7204 7.47809 12.0492 7.80689 12.7068 8.46448C13.3644 9.12207 13.6932 9.45086 13.8907 9.7929C14.4266 10.7211 14.4266 11.8647 13.8907 12.7929C13.7812 12.9825 13.6314 13.1681 13.4075 13.4078M10.5919 10.5922C10.368 10.8319 10.2182 11.0175 10.1087 11.2071C9.57284 12.1353 9.57284 13.2789 10.1087 14.2071C10.3062 14.5492 10.635 14.878 11.2926 15.5355C11.9502 16.1931 12.279 16.5219 12.621 16.7194C13.5492 17.2553 14.6928 17.2553 15.621 16.7194C15.9631 16.5219 16.2919 16.1931 16.9495 15.5355L19.7779 12.7071C20.4355 12.0495 20.7643 11.7207 20.9617 11.3787C21.4976 10.4505 21.4976 9.30689 20.9617 8.37869C20.7643 8.03665 20.4355 7.70785 19.7779 7.05026C19.1203 6.39267 18.7915 6.06388 18.4495 5.8664C17.5212 5.3305 16.3777 5.3305 15.4495 5.8664C15.2598 5.97588 15.0743 6.12571 14.8345 6.34955"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  Faucet by QuickNode
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
});

export default Header;
