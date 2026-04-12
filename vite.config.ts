import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(), 
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
