import Prerenderer from "@prerenderer/prerenderer";
import PuppeteerRenderer from "@prerenderer/renderer-puppeteer";
import path from "path";
import mkdirp from "mkdirp";
import fs from "fs";
import spin from "io-spin";

/*
 * @Author: shaolong
 * @Date: 2022-10-20 13:44:14
 * @LastEditors: shaolong
 * @LastEditTime: 2022-10-20 16:39:31
 * @Description:
 */

function vitePluginVuePrerenderer(...args) {
  return {
    name: "vite-plugin-vue-prerenderer",
    closeBundle() {
      const spinner = spin("rendering......");
      let _options = {};
      // 检验参数
      if (args.length >= 1) {
        _options = args[0] || {};
      } else {
        console.warn("[vite-plugin-vue-prerenderer] Parameter error: You have to offer an object as parameter");
        return;
      }

      const { routes, options } = _options;

      if (!_options.staticDir) {
        _options.staticDir = path.join(path.resolve(), "/dist");
      }

      if (!routes || routes.length == 0) {
        console.warn("[vite-plugin-vue-prerenderer] Parameter error: you have to offer a route parameter at least");
        return;
      }

      spinner.start();

      const prerenderer = new Prerenderer({
        // Required - The path to the app to prerender. Should have an index.html and any other needed assets.
        staticDir: _options.staticDir,
        // The plugin that actually renders the page.
        renderer: new PuppeteerRenderer({ renderAfterTime: 5000 }),
      });
      prerenderer
        .initialize()
        .then(() => {
          return prerenderer.renderRoutes(routes);
        })
        .then((renderedRoutes) => {
          // renderedRoutes is an array of objects in the format:
          // {
          //   route: String (The route rendered)
          //   html: String (The resulting HTML)
          // }
          renderedRoutes.forEach((renderedRoute) => {
            try {
              const html = prerendererTrim(renderedRoute, options);
              // A smarter implementation would be required, but this does okay for an example.
              // Don't copy this directly!!!
              if (html) {
                const _outputDir = _options.staticDir || path.join(path.resolve(), "/dist");
                const outputDir = path.join(_outputDir, renderedRoute.route);
                const outputFile = `${outputDir}/index.html`;
                mkdirp.sync(outputDir);
                fs.writeFileSync(outputFile, html);
              }
            } catch (e) {
              // Handle errors.
              console.warn("[vite-plugin-vue-prerenderer] " + e);
            }
          });
          spinner.stop();

          // Shut down the file server and renderer.
          prerenderer.destroy();
        })
        .catch((err) => {
          spinner.stop();
          // Shut down the server and renderer.
          prerenderer.destroy();
          // Handle errors.
          console.warn("[vite-plugin-vue-prerenderer] " + err);
        });
    },
  };
}

function prerendererTrim(renderedRoute, options) {
  try {
    let html = renderedRoute.html.trim();
    // no any configure
    if (!options) {
      return html;
    }
    const route = renderedRoute.route;
    if (options[route] && options[route].title) {
      let _title = options[route].title;
      if (typeof _title !== "string") {
        console.warn("[vite-plugin-vue-prerenderer] The title must be a string");
        return false;
      }
      html = html.replace(/<title>(.*?)<\/title>/, `<title>${_title}</title>`);
    }
    if (options[route] && options[route].keyWords) {
      let _keyWords = options[route].keyWords;
      if (!Array.isArray(_keyWords) && typeof _keyWords !== "string") {
        console.warn("[vite-plugin-vue-prerenderer] The keyword must be an array or string");
        return false;
      }
      if (Array.isArray(_keyWords)) {
        _keyWords = _keyWords.join(",");
      }
      const meta = `<meta name="keyWords" content="${_keyWords}">`;
      html = html.replace(/<title>/, meta + "<title>");
    }
    if (options[route] && options[route].description) {
      let _description = options[route].description;
      if (typeof _description !== "string") {
        console.warn("[vite-plugin-vue-prerenderer] The description must be a string");
        return false;
      }
      const meta = `<meta name="description" content="${_description}">`;
      html = html.replace(/<title>/, meta + "<title>");
    }

    return html;
  } catch (error) {
    console.warn("[vite-plugin-vue-prerenderer] " + err);
    return false;
  }
}

export { vitePluginVuePrerenderer as default };
