import { Sprite } from "pixi.js";
import { Step, TextureType } from ".";

export type StoreType = {
  ready: boolean;
  character: Sprite | undefined;
  moving: boolean;
  path: Step[];
  moveTarget: Step | undefined;
  gameOver: boolean;
  Map: TextureType[][];
  StartPosition: Step;
  ExitPosition: Step;
  ShortestPathLength: number;
};

export type StoreDispatch = {
  type: string;
  param?: Record<string, unknown>;
};

export const gameState: StoreType = {
  ready: false,
  character: undefined,
  moving: false,
  path: [],
  moveTarget: undefined,
  gameOver: false,
  Map: [],
  StartPosition: { x: 0, y: 0 },
  ExitPosition: { x: 0, y: 0 },
  ShortestPathLength: 0,
};

export function dispatch(action: StoreDispatch) {
  const result: StoreType = { ...gameState };

  switch (action.type) {
    case "ready":
      result.ready = !!action.param?.ready as boolean;
      break;
    case "init":
      if (action.param?.character && Array.isArray(action.param?.path)) {
        result.character = action.param.character as Sprite;
        result.path = action.param.path as Step[];
        result.Map = action.param.Map as TextureType[][];
        result.StartPosition = action.param.StartPosition as Step;
        result.ExitPosition = action.param.ExitPosition as Step;
        result.ShortestPathLength = action.param.ShortestPathLength as number;
      }

      break;
    case "move.left":
      result.moving = true;
      result.moveTarget = {
        x: gameState.path[gameState.path.length - 1].x - 1,
        y: gameState.path[gameState.path.length - 1].y,
      };
      break;
    case "move.right":
      result.moving = true;
      result.moveTarget = {
        x: gameState.path[gameState.path.length - 1].x + 1,
        y: gameState.path[gameState.path.length - 1].y,
      };
      break;
    case "move.up":
      result.moving = true;
      result.moveTarget = {
        x: gameState.path[gameState.path.length - 1].x,
        y: gameState.path[gameState.path.length - 1].y - 1,
      };
      break;
    case "move.down":
      result.moving = true;
      result.moveTarget = {
        x: gameState.path[gameState.path.length - 1].x,
        y: gameState.path[gameState.path.length - 1].y + 1,
      };
      break;

    case "move.stop":
      result.moving = false;
      if (result.moveTarget) {
        result.path = [...gameState.path, result.moveTarget];
        result.gameOver =
          result.moveTarget.x === result.ExitPosition.x &&
          result.moveTarget.y === result.ExitPosition.y;
      }

      result.moveTarget = undefined;
      break;
    case "move.cancel":
      result.moving = false;
      result.moveTarget = undefined;
      break;
    case "reset":
      result.path.length = 1;
      result.moveTarget = undefined;
      result.gameOver = false;
      break;

    default:
      throw new Error();
  }

  Object.assign(gameState, result);
}
