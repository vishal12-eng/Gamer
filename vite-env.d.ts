/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HILLTOPADS_ZONE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
