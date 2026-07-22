import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:3000/api/docs-json",
  output: {
    path: "src/api-client",
  },
  plugins: ["@hey-api/client-fetch"],
});
