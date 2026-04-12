import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: ["**/routeTree.gen.ts", "dist", ".tanstack", "node_modules", "pnpm-lock.yaml"],
  semi: true,
  tabWidth: 2,
  printWidth: 120,
  singleQuote: false,
  trailingComma: "es5",
  bracketSameLine: true,
  // experimentalTailwindcss: {
  //   stylesheet: "./src/css/global.css",
  //   functions: ["clsx", "cn", "cva", "tw"],
  // },
});