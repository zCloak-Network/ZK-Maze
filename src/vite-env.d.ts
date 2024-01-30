/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_APP_CONTRACT_ADDRESS: `0x${string}`;
  readonly VITE_APP_CANISTERID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
