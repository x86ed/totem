/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  // Add other environment variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
