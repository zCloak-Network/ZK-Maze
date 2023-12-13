import {
  StageWidth,
  StageHeight,
  CellSize,
  StageHeightCells,
  StageWidthCells,
  Map,
  TextureType,
  Step,
} from "./config";
import { Sprite } from "pixi.js";
// 检测坐标系中的点是否越界
export function isOutOfBound(point: Step) {
  const { x, y } = point;
  return (
    x < 0 || y < 0 || x > StageWidth - CellSize || y > StageHeight - CellSize
  );
}

// 两点碰撞检测
export function isCollide(sprite1: Sprite, sprite2: Sprite) {
  const { x, y } = sprite1;
  const { x: x2, y: y2 } = sprite2;

  if (x === x2 && y === y2) {
    return true;
  } else {
    return false;
  }
}

// 特定类型碰撞检测
export function isCollideType(sprite1: Step) {
  const { x, y } = sprite1;
  let result: TextureType = 0;
  for (let i = 0; i < StageHeightCells; i++) {
    for (let j = 0; j < StageWidthCells; j++) {
      if (Map[i][j] > 0) {
        if (x / CellSize === j && y / CellSize === i) {
          result = Map[i][j];
          break;
        }
      }
    }
  }
  return result;
}

export const safeMove = (
  point: Sprite,
  direction: "left" | "right" | "up" | "down",
  callback?: (result: TextureType, position: Step) => void
) => {
  const step = 1;
  const { x, y } = point;
  let newPosition = { x, y };
  switch (direction) {
    case "left":
      newPosition = {
        x: x - step * CellSize,
        y,
      };
      break;
    case "right":
      newPosition = {
        x: x + step * CellSize,
        y,
      };
      break;
    case "up":
      newPosition = {
        x,
        y: y - step * CellSize,
      };
      break;
    case "down":
      newPosition = {
        x,
        y: y + step * CellSize,
      };
      break;
    default:
      break;
  }

  const result: TextureType = isCollideType(newPosition);

  if (isOutOfBound(newPosition)) {
    return null;
  }

  if (callback?.(result, newPosition)) {
    point.x = newPosition.x;
    point.y = newPosition.y;
  }
};

// 遍历二维数组
export const filterMapPoint = (
  map: TextureType[][],
  filter: (item: TextureType) => boolean
) => {
  const result: Step[] = [];
  if (map.length > 0 && typeof filter === "function") {
    for (let rows = 0; rows < map.length; rows++) {
      for (let cols = 0; cols < map[0].length; cols++) {
        if (filter(map[rows][cols])) {
          result.push({
            x: cols,
            y: rows,
          });
        }
      }
    }
  }
  return result;
};
