import {
  executeZkProgram,
  initMidenWasm,
  generateProgramHash,
} from "@zcloak/miden";
import { initCrypto } from "@zcloak/crypto";
// todo: sdk can not work in web workder
export const onmessage = function (e: {
  data: [any, any, any];
  postMessage: any;
}) {
  console.log("Worker: Message received from main script");
  const [program, publicInput, secretInput] = e.data;
  if (program && publicInput && secretInput) {
    try {
      initCrypto().then(() => {
        initMidenWasm().then(() => {
          const zkpResult = executeZkProgram(program, publicInput, secretInput);
          const programHash = generateProgramHash(program);
          e.postMessage({ data: zkpResult, programHash });
        });
      });
    } catch (err) {
      e.postMessage(err);
    }
  } else {
    e.postMessage({ data: null });
  }
};
