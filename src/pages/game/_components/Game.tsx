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
import { toast } from "react-toastify";

export const Game = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<{ refetch: () => void }>(null);
  const [loading, setLoading] = useState(true);
  const { bindKey } = keystrokes as unknown as Keystrokes;
  const [gameIsOver, setGameOver] = useState(false);

  const app = useRef<Application>();

  useEffect(() => {
    console.log("Game run");
    void Promise.all([getMap(), Assets.load("/spritesheet.json")])
      .then(([mapInfo, sheet]) => {
        setLoading(false);
        if (!mapInfo.data) {
          return console.error("get map fail");
        }

        const { Map, StartPosition, ExitPosition, ShortestPathLength } =
          mapInfo.data;
        const StageHeightCells = Map.length;
        const StageWidthCells = Map[0].length;
        const StageHeight = StageHeightCells * CellSize;
        const StageWidth = StageWidthCells * CellSize;
        app.current = new Application({
          width: StageWidth,
          height: StageHeight,
        });
        wrapRef.current?.appendChild(app.current.view as HTMLCanvasElement);

        const gameScene = new Container();
        app.current.stage.addChild(gameScene);

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
          sheet.textures["right-0.png"],
          sheet.textures["right-1.png"],
          sheet.textures["right-0.png"],
          sheet.textures["right-2.png"],
        ]);
        const TextureDown = new AnimatedSprite([
          sheet.textures["down-0.png"],
          sheet.textures["down-1.png"],
          sheet.textures["down-0.png"],
          sheet.textures["down-2.png"],
        ]);
        const TextureLeft = new AnimatedSprite([
          sheet.textures["left-0.png"],
          sheet.textures["left-1.png"],
          sheet.textures["left-0.png"],
          sheet.textures["left-2.png"],
        ]);
        const TextureUp = new AnimatedSprite([
          sheet.textures["up-0.png"],
          sheet.textures["up-1.png"],
          sheet.textures["up-0.png"],
          sheet.textures["up-2.png"],
        ]);

        const { character, move } = Role([
          TextureUp,
          TextureDown,
          TextureLeft,
          TextureRight,
        ]);

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
          if (!gameState.ready || gameState.gameOver || gameState.moving)
            return;
          dispatch && dispatch({ type: "move.up" });
          move("up");
        };

        const handleKeyDown = () => {
          if (!gameState.ready || gameState.gameOver || gameState.moving)
            return;
          dispatch && dispatch({ type: "move.down" });
          move("down");
        };

        const handleKeyLeft = () => {
          if (!gameState.ready || gameState.gameOver || gameState.moving)
            return;
          dispatch && dispatch({ type: "move.left" });
          move("left");
        };

        const handleKeyRight = () => {
          if (!gameState.ready || gameState.gameOver || gameState.moving)
            return;
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
          if (gameOver) {
            setGameOver(true);
          }
        };

        app.current.ticker.add(gameLoop);
      })
      .catch((err) => {
        toast.error(err.message);
      });

    return () => {
      // TODO
      console.log("game unload");
      app.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reStartGame = () => {
    // window.location.reload();
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
              onRefresh={() => headerRef && headerRef.current?.refetch?.()}
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
