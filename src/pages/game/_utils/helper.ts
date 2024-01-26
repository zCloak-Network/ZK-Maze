import { CellSize, TextureType, Step, animationSpeed } from "./config";
import { Sprite, AnimatedSprite, Container } from "pixi.js";
import { arbitrumSepolia } from "wagmi/chains";
export const Chain = {
  ...arbitrumSepolia,
  blockExplorers: {
    default: {
      name: "arbiscan",
      url: "https://sepolia.arbiscan.io",
    },
  },
};
// import.meta.env.MODE === "production"
//   ? arbitrum
//   : {
//       ...arbitrumSepolia,
//       blockExplorers: {
//         default: {
//           name: "arbiscan",
//           url: "https://sepolia.arbiscan.io",
//         },
//       },
//     };

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
  params: [
    AnimatedSprite,
    AnimatedSprite,
    AnimatedSprite,
    AnimatedSprite
    // AnimatedSprite,
    // AnimatedSprite,
    // AnimatedSprite,
    // AnimatedSprite
  ]
) {
  const [upAnimate, downAnimate, leftAnimate, rightAnimate] = params;
  const container = new Container();
  container.width = CellSize;
  container.height = CellSize;

  let currentDirection: "up" | "down" | "left" | "right" = "right";

  const directionIndexMap = {
    up: [0],
    down: [1],
    left: [2],
    right: [3],
  };
  params.forEach((item, index) => {
    item.visible = directionIndexMap[currentDirection].includes(index);
    item.position.x = 0;
    item.position.y = 0;
    item.animationSpeed = animationSpeed;
    container.addChild(item);
  });

  return {
    character: container,
    move: (direction: "up" | "down" | "left" | "right" | "stop") => {
      if (direction !== "stop") {
        currentDirection = direction;
        params.forEach((item, index) => {
          if (directionIndexMap[currentDirection].includes(index)) {
            item.visible = true;
            item.gotoAndPlay(1);
          } else {
            item.visible = false;
          }
        });
      } else {
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
