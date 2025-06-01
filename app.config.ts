import { defineConfig } from "@tanstack/react-start/config";
import { cloudflare } from "unenv";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    prerender: {
      routes: ["/"],
      crawlLinks: true,
    },
    preset: "cloudflare-pages",
    unenv: cloudflare,
  },
  tsr: {
    appDirectory: "./src",
  },
  react: {
    babel: {
      plugins: [["babel-plugin-react-compiler", { target: "19" }]],
    },
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
});
