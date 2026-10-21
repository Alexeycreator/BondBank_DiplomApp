/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL_HTTP: string;
  readonly VITE_API_URL_HTTPS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css";
declare module "*.module.css";
declare module "@flaticon/flaticon-uicons/*";