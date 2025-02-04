import { defineConfig } from "tsup";

const env = process.env.NODE_ENV;

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/index.ts"],
  minify: env === "production",
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  treeshake: true,
});
