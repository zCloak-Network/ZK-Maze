import {
  executeZkProgram,
  initMidenWasm,
  generateProgramHash,
} from "@zcloak/miden";
import { initCrypto } from "@zcloak/crypto";
// todo: sdk can not work in web workder
export const onmessage = function (e: {
  data: [string, string, string];
  postMessage: (data: { data: string; programHash?: string }) => void;
}) {
  console.log("Worker: Message received from main script");
  const [program, publicInput, secretInput] = e.data;
  if (program && publicInput && secretInput) {
    try {
      void initCrypto().then(() => {
        void initMidenWasm().then(() => {
          try {
            const zkpResult = executeZkProgram(
              program,
              publicInput,
              secretInput
            );
            const programHash = generateProgramHash(program);
            e.postMessage({ data: zkpResult, programHash });
          } catch (err) {
            console.warn(
              err,
              "with params:",
              "publicInput=",
              publicInput,
              "secretInput=",
              secretInput
            );
            e.postMessage({ data: "" });
          }
        });
      });
    } catch (err) {
      console.warn(2, err);
      e.postMessage({ data: "" });
    }
  } else {
    e.postMessage({ data: "" });
  }
};
