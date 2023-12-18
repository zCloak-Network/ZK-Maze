import { CellSize, TextureType, Step, animationSpeed } from "./config";
import { Sprite, AnimatedSprite, Container } from "pixi.js";
// 检测坐标系中的点是否越界
export function isOutOfBound(Map: TextureType[][], point: Step) {
  const { x, y } = point;
  const StageHeightCells = Map.length;
  const StageWidthCells = Map[0].length;
  return x < 0 || y < 0 || x > StageWidthCells - 1 || y > StageHeightCells - 1;
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
export function isCollideType(Map: TextureType[][], sprite1: Step) {
  const { x, y } = sprite1;
  let result: TextureType = 0;
  for (let i = 0; i < Map.length; i++) {
    for (let j = 0; j < Map[0].length; j++) {
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
  upAnimate.animationSpeed = animationSpeed;
  downAnimate.visible = false;
  downAnimate.x = 0;
  downAnimate.y = 0;
  downAnimate.animationSpeed = animationSpeed;
  leftAnimate.visible = false;
  leftAnimate.x = 0;
  leftAnimate.y = 0;
  leftAnimate.animationSpeed = animationSpeed;
  rightAnimate.visible = true;
  rightAnimate.x = 0;
  rightAnimate.y = 0;
  rightAnimate.animationSpeed = animationSpeed;

  let currentDirection: "up" | "down" | "left" | "right" = "right";

  return {
    character: container,
    move: (direction: "up" | "down" | "left" | "right" | "stop") => {
      if (direction !== "stop") {
        currentDirection = direction;
      }

      switch (direction) {
        case "up":
          upAnimate.visible = true;
          upAnimate.play();
          downAnimate.visible = false;
          leftAnimate.visible = false;
          rightAnimate.visible = false;

          break;
        case "down":
          currentDirection = direction;
          upAnimate.visible = false;
          downAnimate.visible = true;
          downAnimate.play();
          leftAnimate.visible = false;
          rightAnimate.visible = false;
          break;
        case "left":
          currentDirection = direction;
          upAnimate.visible = false;
          downAnimate.visible = false;
          leftAnimate.visible = true;
          leftAnimate.play();
          rightAnimate.visible = false;
          break;
        case "right":
          currentDirection = direction;
          upAnimate.visible = false;
          downAnimate.visible = false;
          leftAnimate.visible = false;
          rightAnimate.visible = true;
          rightAnimate.play();
          break;

        case "stop":
          console.log("stop", currentDirection);
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

export const generatePublicInput = (
  Map: TextureType[][],
  StartPosition: Step,
  EndPosition: Step,
  ShortestPathLength: number
) => {
  const rows = Map.length;
  const cols = Map[0].length;
  const result: number[] = [
    rows,
    cols,
    StartPosition.x,
    StartPosition.y,
    EndPosition.x,
    EndPosition.y,
    ShortestPathLength,
  ];
  const ObstacleArray: Step[] = filterMapPoint(
    Map,
    (item) => item !== 0 && item !== 3
  );
  result.push(ObstacleArray.length);
  ObstacleArray.forEach((point) => {
    result.push(point.x, point.y);
  });

  return result.reverse().join(",");
};
