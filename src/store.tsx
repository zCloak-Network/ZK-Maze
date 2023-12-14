import React, { createContext, useReducer, useContext } from "react";
import { Sprite } from "pixi.js";
import { Step } from "./pages/game/_utils";

export type StoreType = {
  character: Sprite | undefined;
  moving: boolean;
  path: Step[];
  moveTarget: Step | undefined;
};

export type StoreDispatch = {
  type: string;
  param?: Record<string, unknown>;
};

const initialState: StoreType = {
  character: undefined,
  moving: false,
  path: [],
  moveTarget: undefined,
};

function reducer(state: StoreType, action: StoreDispatch) {
  const result: StoreType = { ...state };

  switch (action.type) {
    case "init":
      if (action.param?.character && Array.isArray(action.param?.path)) {
        result.character = action.param.character as Sprite;
        result.path = action.param.path as Step[];
      }

      break;
    case "move.left":
      result.moving = true;
      result.moveTarget = {
        x: state.path[state.path.length - 1].x - 1,
        y: state.path[state.path.length - 1].y,
      };
      break;
    case "move.right":
      result.moving = true;
      result.moveTarget = {
        x: state.path[state.path.length - 1].x + 1,
        y: state.path[state.path.length - 1].y,
      };
      break;
    case "move.up":
      result.moving = true;
      result.moveTarget = {
        x: state.path[state.path.length - 1].x,
        y: state.path[state.path.length - 1].y - 1,
      };
      break;
    case "move.down":
      result.moving = true;
      result.moveTarget = {
        x: state.path[state.path.length - 1].x,
        y: state.path[state.path.length - 1].y + 1,
      };
      break;

    case "move.stop":
      result.moving = false;
      result.moveTarget = undefined;
      break;
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
