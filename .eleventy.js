import { minify as minifyHtml } from "html-minifier-terser";
import CleanCSS from "clean-css";
import { minify as minifyJs } from "terser";
import * as esbuild from "esbuild";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, extname } from "node:path";

async function listFiles(dir, ext) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isFile() && extname(entry.name) === ext) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

export default function (eleventyConfig) {
  // Pass-through copy: these live at project root, copied as-is into output
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  // sitemap.xml is now generated from src/sitemap.njk

  // ISO date filter for sitemap (yyyy-MM-dd)
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  // Watch CSS/JS so dev server reloads on change
  eleventyConfig.addWatchTarget("css/");
  eleventyConfig.addWatchTarget("js/");

  // Bundle motion.js (uses bare import "motion") into a self-contained file.
  // Runs after the passthrough copy, replacing the unbundled source in _site.
  const isProd = process.env.ELEVENTY_RUN_MODE === "build";
  eleventyConfig.on("eleventy.after", async ({ dir }) => {
    await esbuild.build({
      entryPoints: ["js/motion.js"],
      outfile: join(dir.output, "js/motion.js"),
      bundle: true,
      format: "esm",
      target: "es2020",
      minify: isProd,
      sourcemap: !isProd ? "inline" : false,
      logLevel: "warning",
    });
  });

  // Minify HTML output (production only — keep dev output readable)
  if (process.env.ELEVENTY_RUN_MODE === "build") {
    eleventyConfig.addTransform("html-minify", async (content, outputPath) => {
      if (!outputPath || !outputPath.endsWith(".html")) return content;
      return minifyHtml(content, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        removeRedundantAttributes: true,
        minifyCSS: true,
        minifyJS: true,
      });
    });

    // After build: minify CSS and JS in the output directory
    eleventyConfig.on("eleventy.after", async ({ dir }) => {
      const outDir = dir.output;

      // CSS
      const cssFiles = await listFiles(join(outDir, "css"), ".css");
      await Promise.all(
        cssFiles.map(async (f) => {
          const src = await readFile(f, "utf8");
          const { styles } = new CleanCSS({ level: 2 }).minify(src);
          await writeFile(f, styles, "utf8");
        })
      );

      // JS — skip motion.js (esbuild handles it)
      const jsFiles = (await listFiles(join(outDir, "js"), ".js"))
        .filter((f) => !f.endsWith("motion.js"));
      await Promise.all(
        jsFiles.map(async (f) => {
          const src = await readFile(f, "utf8");
          const { code } = await minifyJs(src, { compress: true, mangle: true });
          if (code) await writeFile(f, code, "utf8");
        })
      );
    });
  }

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
