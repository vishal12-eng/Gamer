/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HILLTOPADS_ZONE_ID: string;
  readonly VITE_HILLTOPADS_NATIVE_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
