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
import { Sprite, AnimatedSprite, Container } from "pixi.js";
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
        if (x === j && y === i) {
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

export const gameSpeed = 2;
export function Role(
  upAnimate: AnimatedSprite,
  downAnimate: AnimatedSprite,
  leftAnimate: AnimatedSprite,
  rightAnimate: AnimatedSprite
) {
  const container = new Container();
  container.width = CellSize;
  container.height = CellSize;

  container.addChild(upAnimate);
  container.addChild(downAnimate);
  container.addChild(leftAnimate);
  container.addChild(rightAnimate);
  upAnimate.visible = false;
  upAnimate.x = 0;
  upAnimate.y = 0;
  upAnimate.animationSpeed = gameSpeed / 10;
  downAnimate.visible = false;
  downAnimate.x = 0;
  downAnimate.y = 0;
  downAnimate.animationSpeed = gameSpeed / 10;
  leftAnimate.visible = false;
  leftAnimate.x = 0;
  leftAnimate.y = 0;
  leftAnimate.animationSpeed = gameSpeed / 10;
  rightAnimate.visible = true;
  rightAnimate.x = 0;
  rightAnimate.y = 0;
  rightAnimate.animationSpeed = gameSpeed / 10;

  let currentDirection: "up" | "down" | "left" | "right" = "right";

  return {
    character: container,
    move: (direction: "up" | "down" | "left" | "right" | "stop") => {
      switch (direction) {
        case "up":
          upAnimate.visible = true;
          upAnimate.play();
          downAnimate.visible = false;
          downAnimate.stop();
          leftAnimate.visible = false;
          leftAnimate.stop();
          rightAnimate.visible = false;
          rightAnimate.stop();
          currentDirection = direction;
          break;
        case "down":
          upAnimate.visible = false;
          upAnimate.stop();
          downAnimate.visible = true;
          downAnimate.play();
          leftAnimate.visible = false;
          leftAnimate.stop();
          rightAnimate.visible = false;
          rightAnimate.stop();
          currentDirection = direction;
          break;
        case "left":
          upAnimate.visible = false;
          upAnimate.stop();
          downAnimate.visible = false;
          downAnimate.stop();
          leftAnimate.visible = true;
          leftAnimate.play();
          rightAnimate.visible = false;
          rightAnimate.stop();
          currentDirection = direction;
          break;
        case "right":
          upAnimate.visible = false;
          upAnimate.stop();
          downAnimate.visible = false;
          downAnimate.stop();
          leftAnimate.visible = false;
          leftAnimate.stop();
          rightAnimate.visible = true;
          rightAnimate.play();
          currentDirection = direction;
          break;

        case "stop":
          switch (currentDirection) {
            case "up":
              upAnimate.gotoAndStop(0);
              break;
            case "down":
              downAnimate.gotoAndStop(0);
              break;
            case "left":
              leftAnimate.gotoAndStop(0);
              break;
            case "right":
              rightAnimate.gotoAndStop(0);
              break;
          }
          break;
      }
    },
  };
}
