/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { useRef, useEffect, useState } from "react";
import {
  Application,
  Sprite,
  Assets,
  Container,
  TilingSprite,
  AnimatedSprite,
} from "pixi.js";
import * as keystrokes from "@rwh/keystrokes";
import { Keystrokes } from "@rwh/keystrokes";
import {
  CellSize,
  TypeTextureMap,
  TextureType,
  isOutOfBound,
  isCollideType,
  gameSpeed,
  Role,
} from "../_utils";
// import play from "../_scripts/play";
import { GameOver } from "./GameOver";
import { gameState, dispatch } from "../_utils";
import Header from "./Header";
import { Tip } from "./Tip";
import { Description } from "./Description";
import { getMap } from "@/api/zkp";
import { useDispatchStore } from "@/store";

export const Game = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const { bindKey } = keystrokes as unknown as Keystrokes;
  const [gameIsOver, setGameOver] = useState(false);
  const dispatchStore = useDispatchStore();

  useEffect(() => {
    void Promise.all([getMap(), Assets.load("/spritesheet.json")]).then(
      ([mapInfo, sheet]) => {
        setLoading(false);
        if (!mapInfo.data) {
          return console.error("get map fail");
        }
        dispatchStore &&
          dispatchStore({
            type: "map",
            param: mapInfo.data,
          });
        const { Map, StartPosition, ExitPosition, ShortestPathLength } =
          mapInfo.data;
        const StageHeightCells = Map.length;
        const StageWidthCells = Map[0].length;
        const StageHeight = StageHeightCells * CellSize;
        const StageWidth = StageWidthCells * CellSize;
        const app = new Application({ width: StageWidth, height: StageHeight });
        wrapRef.current?.appendChild(app.view as HTMLCanvasElement);

        const gameScene = new Container();
        app.stage.addChild(gameScene);

        // map
        const land = new TilingSprite(
          sheet.textures[TypeTextureMap[0]],
          StageWidth,
          StageHeight
        );
        gameScene.addChild(land);
        const container = new Container();
        gameScene.addChild(container);

        for (let i = 0; i < StageHeightCells; i++) {
          for (let j = 0; j < StageWidthCells; j++) {
            if (Map[i][j] > 0) {
              const TextureName =
                TypeTextureMap[(Map as TextureType[][])[i][j]];
              const Texture = sheet.textures[TextureName];
              const sprite = new Sprite(Texture);
              sprite.width = CellSize;
              sprite.height = CellSize;
              sprite.x = j * CellSize;
              sprite.y = i * CellSize;
              container.addChild(sprite);
            }
          }
        }
        // character
        const TextureRight = new AnimatedSprite([
          sheet.textures["tile_0026.png"],
          sheet.textures["tile_0053.png"],
          sheet.textures["tile_0080.png"],
        ]);
        const TextureDown = new AnimatedSprite([
          sheet.textures["tile_0024.png"],
          sheet.textures["tile_0051.png"],
          sheet.textures["tile_0078.png"],
        ]);
        const TextureLeft = new AnimatedSprite([
          sheet.textures["tile_0023.png"],
          sheet.textures["tile_0050.png"],
          sheet.textures["tile_0077.png"],
        ]);
        const TextureUp = new AnimatedSprite([
          sheet.textures["tile_0025.png"],
          sheet.textures["tile_0052.png"],
          sheet.textures["tile_0079.png"],
        ]);

        const { character, move } = Role(
          TextureUp,
          TextureDown,
          TextureLeft,
          TextureRight
        );

        character.x = StartPosition.x * CellSize;
        character.y = StartPosition.y * CellSize;

        gameScene.addChild(character);

        dispatch &&
          dispatch({
            type: "init",
            param: {
              character,
              path: [StartPosition],
              Map,
              StartPosition,
              ExitPosition,
              ShortestPathLength,
            },
          });

        const handleKeyUp = () => {
          if (gameState.gameOver || gameState.moving) return;
          dispatch && dispatch({ type: "move.up" });
          move("up");
        };

        const handleKeyDown = () => {
          if (gameState.gameOver || gameState.moving) return;
          dispatch && dispatch({ type: "move.down" });
          move("down");
        };

        const handleKeyLeft = () => {
          if (gameState.gameOver || gameState.moving) return;
          dispatch && dispatch({ type: "move.left" });
          move("left");
        };

        const handleKeyRight = () => {
          if (gameState.gameOver || gameState.moving) return;
          dispatch && dispatch({ type: "move.right" });
          move("right");
        };

        bindKey("ArrowUp", handleKeyUp);
        bindKey("ArrowRight", handleKeyRight);
        bindKey("ArrowDown", handleKeyDown);
        bindKey("ArrowLeft", handleKeyLeft);

        bindKey("w", handleKeyUp);
        bindKey("d", handleKeyRight);
        bindKey("s", handleKeyDown);
        bindKey("a", handleKeyLeft);

        //Start the game loop
        const gameLoop = (delta: number) => {
          const { moveTarget, moving, gameOver, character } = gameState;
          if (character && moveTarget && moving) {
            if (isOutOfBound(Map, moveTarget)) {
              dispatch && dispatch({ type: "move.cancel" });
              move("stop");
            } else {
              const result: TextureType = isCollideType(Map, moveTarget);
              const xDirection =
                moveTarget.x * CellSize - character.x >= 0 ? 1 : -1;
              const yDirection =
                moveTarget.y * CellSize - character.y >= 0 ? 1 : -1;
              const moveDone =
                character.x === moveTarget.x * CellSize &&
                character.y === moveTarget.y * CellSize;

              if (result === 0 || result === 3) {
                if (
                  (xDirection === 1 &&
                    character.x + delta > moveTarget.x * CellSize) ||
                  (xDirection === -1 &&
                    character.x - delta < moveTarget.x * CellSize)
                ) {
                  character.x = moveTarget.x * CellSize;
                } else {
                  character.x += delta * gameSpeed * xDirection;
                }

                if (
                  (yDirection === 1 &&
                    character.y + delta > moveTarget.y * CellSize) ||
                  (yDirection === -1 &&
                    character.y - delta < moveTarget.y * CellSize)
                ) {
                  character.y = moveTarget.y * CellSize;
                } else {
                  character.y += delta * gameSpeed * yDirection;
                }

                if (moveDone) {
                  dispatch &&
                    dispatch({
                      type: "move.stop",
                    });
                  move("stop");
                }
              } else {
                dispatch && dispatch({ type: "move.cancel" });
                move("stop");
              }
            }
          }

          gameOver && setGameOver(true);
        };

        app.ticker.add(gameLoop);
      }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reStartGame = () => {
    const { StartPosition } = gameState;
    if (gameState.character) {
      gameState.character.x = StartPosition.x * CellSize;
      gameState.character.y = StartPosition.y * CellSize;
    }

    setGameOver(false);

    dispatch &&
      dispatch({
        type: "reset",
      });
  };

  return (
    <div>
      <Header ref={headerRef} />

      <div className="my-8 wrap">
        <div
          ref={wrapRef}
          className="flex relative flex-col items-center justify-center w-[640px] h-[640px] m-auto rounded-2xl bg-neutral overflow-hidden"
        >
          {gameIsOver && (
            <GameOver
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
              onRefresh={() => headerRef && headerRef.current?.refetch()}
              onExit={reStartGame}
            />
          )}
          {loading && <div className="skeleton w-full h-full"></div>}
        </div>
      </div>

      <Tip />
      <Description />
    </div>
  );
};
