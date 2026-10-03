import { defineConfig } from "nitro";

export default defineConfig({
  prerender: {
    routes: ["/", "/inquiry"],
    ignore: ["/404.html"],
    failOnError: true,
  },
});
