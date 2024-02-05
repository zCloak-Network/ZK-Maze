import React, { createContext, useReducer, useContext } from "react";
import { TextureType, Step } from "./pages/game/_utils";

type mapInfo = {
  Map: TextureType[][];
  StartPosition: Step;
  ExitPosition: Step;
  ShortestPathLength: number;
};

export type SupportNetwork = "arbitrum-sepolia" | "solana";

export type StoreType = {
  mapInfo: mapInfo;
  gameResult: number;
  network: SupportNetwork;
};

export type StoreDispatch = {
  type: string;
  param?: unknown;
};

const initialState: StoreType = {
  mapInfo: {} as mapInfo,
  gameResult: 0,
  network: "arbitrum-sepolia",
};

function reducer(state: StoreType, action: StoreDispatch) {
  const result: StoreType = { ...state };

  switch (action.type) {
    case "update":
      result.gameResult = action.param as number;
      break;
    case "map":
      result.mapInfo = action.param as mapInfo;
      break;
    case "network":
      result.network = action.param as SupportNetwork;
      break;

    default:
      throw new Error();
  }
  return result;
}

const StateContext = createContext(initialState);
const DispatchContext = createContext<React.Dispatch<StoreDispatch> | null>(
  null
);

function useStateStore() {
  return useContext(StateContext);
}

function useDispatchStore() {
  return useContext(DispatchContext);
}

function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { useStateStore, useDispatchStore, StoreProvider };
