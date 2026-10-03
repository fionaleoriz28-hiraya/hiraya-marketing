import { defineConfig } from "nitro";

export default defineConfig({
  prerender: {
    routes: ["/"],
    crawlLinks: false,
    failOnError: false,
  },
});
