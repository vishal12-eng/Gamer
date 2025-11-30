/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CUELINKS_SMARTLINK_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
