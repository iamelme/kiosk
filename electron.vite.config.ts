/// <reference types="vitest/config" />

import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    }
  },
  renderer: {
    resolve: {
    },
    esbuild: {
      pure: ['console.log'],
      drop: ["console", "debugger"],
    },
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
