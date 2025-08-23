// electron.vite.config.mjs
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import { cpSync } from "fs";
var copyFilesPlugin = (from, to) => ({
  name: `copy-${from}-files`,
  closeBundle() {
    try {
      cpSync(resolve(from), resolve(to), { recursive: true });
      console.log(`${from} copiados correctamente a ${to}`);
    } catch (err) {
      console.error(`Error copiando ${from}:`, err);
    }
  }
});
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      copyFilesPlugin("src/main/handlers", "out/main/handlers"),
      copyFilesPlugin("src/main/utils", "out/main/utils")
    ],
    build: {
      outDir: "out/main",
      rollupOptions: {
        input: {
          index: resolve("src/main/index.js")
        },
        output: {
          format: "cjs",
          preserveModules: true,
          exports: "auto"
        }
      }
    }
  },
  preload: {
    plugins: [
      externalizeDepsPlugin()
    ],
    build: {
      outDir: "out/preload",
      rollupOptions: {
        input: {
          index: resolve("src/preload/index.js")
        },
        output: {
          format: "cjs",
          preserveModules: true,
          exports: "auto"
        }
      }
    }
  },
  renderer: {
    root: resolve("src/renderer"),
    build: {
      outDir: "out/renderer"
    },
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          postcssImport(),
          tailwindcss(),
          autoprefixer()
        ]
      }
    }
  }
});
export {
  electron_vite_config_default as default
};
