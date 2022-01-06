const CyrillicToTranslit = require("cyrillic-to-translit-js");
const CleanCSS = require("clean-css");
const typesetPlugin = require("eleventy-plugin-typeset");
const embeds = require("eleventy-plugin-embed-everything");
const {
  EleventyRenderPlugin
} = require("@11ty/eleventy");
// const eleventyPluginFilesMinifier = require("@sherby/eleventy-plugin-files-minifier");

module.exports = (config) => {
  config.addPassthroughCopy("src/favicon.ico");
  config.addPassthroughCopy("src/android-chrome-192x192.png");
  config.addPassthroughCopy("src/android-chrome-512x512.png");
  config.addPassthroughCopy("src/apple-touch-icon-57x57-precomposed.png");
  config.addPassthroughCopy("src/apple-touch-icon-57x57.png");
  config.addPassthroughCopy("src/apple-touch-icon-60x60-precomposed.png");
  config.addPassthroughCopy("src/apple-touch-icon-60x60.png");
  config.addPassthroughCopy("src/apple-touch-icon-72x72-precomposed.png");
  config.addPassthroughCopy("src/apple-touch-icon-72x72.png");
  config.addPassthroughCopy("src/apple-touch-icon-76x76-precomposed.png");
  config.addPassthroughCopy("src/apple-touch-icon-76x76.png");
  config.addPassthroughCopy("src/apple-touch-icon-114x114-precomposed.png");
  config.addPassthroughCopy("src/apple-touch-icon-114x114.png");
  config.addPassthroughCopy("src/apple-touch-icon-120x120-precomposed.png");
  config.addPassthroughCopy("src/apple-touch-icon-120x120.png");
  config.addPassthroughCopy("src/apple-touch-icon-144x144-precomposed.png");
  config.addPassthroughCopy("src/apple-touch-icon-144x144.png");
  config.addPassthroughCopy("src/apple-touch-icon-152x152-precomposed.png");
  config.addPassthroughCopy("src/apple-touch-icon-152x152.png");
  config.addPassthroughCopy("src/apple-touch-icon-180x180-precomposed.png");
  config.addPassthroughCopy("src/apple-touch-icon-180x180.png");
  config.addPassthroughCopy("src/apple-touch-icon-precomposed.png");
  config.addPassthroughCopy("src/apple-touch-icon.png");
  config.addPassthroughCopy("src/browserconfig.xml");
  config.addPassthroughCopy("src/favicon-16x16.png");
  config.addPassthroughCopy("src/favicon-32x32.png");
  config.addPassthroughCopy("src/mstile-150x150.png");
  config.addPassthroughCopy("src/safari-pinned-tab.svg");
  config.addPassthroughCopy("src/site.webmanifest");
  config.addPassthroughCopy("src/robots.txt");

  config.addPassthroughCopy("src/fonts");
  config.addPassthroughCopy("src/images");
  config.addPassthroughCopy("src/scripts");
  config.addPassthroughCopy("src/media");
  config.addPassthroughCopy("src/admin");
  config.addPassthroughCopy("src/functions");
  config.addPassthroughCopy("src/privacy");
  config.addPassthroughCopy("src/products");
  config.addPassthroughCopy("src/model");

  config.setDataDeepMerge(true);
  config.addShortcode("year", () => `${new Date().getFullYear()}`);
  config.addShortcode("Cbox_element", (category, item) => {
    return `
    <li class="constructor__step__item">
          <label class="constructor__step__item__label">
            <input
              class="constructor__step__item__checkbox"
              type="checkbox"
              name="${category}"
              value="${item.data["id"]};${item.data["price"]};${item.data[
      "title"
    ].replace(/"/g, "'")}"
            />
            <img
              class="constructor__step__item__image"
              src="${item.data.artwork}"
              alt="${item.data.title.replace(/"/g, "'")}"
            />
            <p class="constructor__step__item__name">${item.data.title}</p>
            <p class="constructor__step__item__price">${parseInt(
              item.data.price
            )} руб.</p>
          </label>
        </li>
    `;
  });
  config.addShortcode("cart_element", (item, classEl = "") => {
    return `
    <div
        class="cart__item ${classEl}"
        data-id="${item.data.id}"
      >
        <div class="item__link-zone">
          <img
            width="500"
            height="500"
            class="item__image cart__image"
            src="${item.data.artwork}"
            alt="${item.data.title.replace(/"/g, "'")}"
          />
          <span class="item__category cart__type">${item.data.category}</span>
          <a class="link--block" href="${item.url}"></a>
          <span class="item__name cart__name">
            ${item.data.title}
          </span>
          <span class="item__price ${
            item.data.isSale ? `item__price--sale` : ``
          } cart__price">${item.data.price} руб.</span>
          <div class="item__status ${
            item.data.isSale ? "" : "item__status--hidden"
          }">${item.data.isSale ? "SALE" : ""}</div> 
          <button class="item__favorite icon__favorite favorite__add"></button>
        </div>
        ${
          item.data.isAddToCart
            ? '<button class="item__cart cart__add">Добавить в корзину</button>'
            : '<button class="item__cart item__buy">Купить</button>'
        }
      </div>
    `;
  });
  config.addFilter("translit", function(value) {
    const cyrillicToTranslit = new CyrillicToTranslit();
    return `${cyrillicToTranslit.transform(value + "")}`;
  });
  config.addFilter("sortByPriority", (values) => {
    const val = [...values];
    return val.sort((a, b) => {
      if (a.data.priority > b.data.priority) return 1;
      if (a.data.priority < b.data.priority) return -1;
      return 0;
    });
  });
  config.addFilter("inStock", (values) => {
    let val = [...values];
    val = val.filter((el) => el.data.isAddToCart == true);
    return val;
  });
  config.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });
  config.addPlugin(embeds, {
    youtube: {
      options: {
        lite: true,
        embedClass: "youtube",
      },
    },
  });
  config.addPlugin(EleventyRenderPlugin);
  config.addPlugin(
    typesetPlugin({
      only: ".text--optimization",
    })
  );
  // config.addPlugin(eleventyPluginFilesMinifier);
  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "includes",
      layouts: "layouts",
    },
    dataTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true,
    templateFormats: ["md", "njk"],
  };
};