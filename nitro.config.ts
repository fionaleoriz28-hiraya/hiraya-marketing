import { defineConfig } from "nitro";

export default defineConfig({
  prerender: {
    routes: ["/", "/inquiry"],
    failOnError: true,
  },
});
