/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AADS_AD_UNIT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
