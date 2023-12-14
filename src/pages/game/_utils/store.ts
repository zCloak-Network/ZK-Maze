import { Sprite } from "pixi.js";
import { Step, ExitPosition } from "./";

export type StoreType = {
  character: Sprite | undefined;
  moving: boolean;
  path: Step[];
  moveTarget: Step | undefined;
  gameOver: boolean;
};

export type StoreDispatch = {
  type: string;
  param?: Record<string, unknown>;
};

export const gameState: StoreType = {
  character: undefined,
  moving: false,
  path: [],
  moveTarget: undefined,
  gameOver: false,
};

export function dispatch(action: StoreDispatch) {
  const result: StoreType = { ...gameState };

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
        result.path = [...gameState.path, result.moveTarget as Step];
        result.gameOver =
          result.moveTarget.x === ExitPosition.x &&
          result.moveTarget.y === ExitPosition.y;
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
