import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    external: [], // don't exclude web3
    clean: true,
    target: "es2020"
  });