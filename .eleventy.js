export default function (eleventyConfig) {
  // Pass-through copy: these live at project root, copied as-is into output
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  // Watch CSS/JS so dev server reloads on change
  eleventyConfig.addWatchTarget("css/");
  eleventyConfig.addWatchTarget("js/");

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
