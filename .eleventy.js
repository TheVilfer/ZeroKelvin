module.exports = (config) => {
    config.addPassthroughCopy('src/favicon.ico');
    config.addPassthroughCopy('src/android-chrome-192x192.png');
    config.addPassthroughCopy('src/android-chrome-512x512.png');
    config.addPassthroughCopy('src/apple-touch-icon-57x57-precomposed.png');
    config.addPassthroughCopy('src/apple-touch-icon-57x57.png');
    config.addPassthroughCopy('src/apple-touch-icon-60x60-precomposed.png');
    config.addPassthroughCopy('src/apple-touch-icon-60x60.png');
    config.addPassthroughCopy('src/apple-touch-icon-72x72-precomposed.png');
    config.addPassthroughCopy('src/apple-touch-icon-72x72.png');
    config.addPassthroughCopy('src/apple-touch-icon-76x76-precomposed.png');
    config.addPassthroughCopy('src/apple-touch-icon-76x76.png');
    config.addPassthroughCopy('src/apple-touch-icon-114x114-precomposed.png');
    config.addPassthroughCopy('src/apple-touch-icon-114x114.png');
    config.addPassthroughCopy('src/apple-touch-icon-120x120-precomposed.png');
    config.addPassthroughCopy('src/apple-touch-icon-120x120.png');
    config.addPassthroughCopy('src/apple-touch-icon-144x144-precomposed.png');
    config.addPassthroughCopy('src/apple-touch-icon-144x144.png');
    config.addPassthroughCopy('src/apple-touch-icon-152x152-precomposed.png');
    config.addPassthroughCopy('src/apple-touch-icon-152x152.png');
    config.addPassthroughCopy('src/apple-touch-icon-180x180-precomposed.png');
    config.addPassthroughCopy('src/apple-touch-icon-180x180.png');
    config.addPassthroughCopy('src/apple-touch-icon-precomposed.png');
    config.addPassthroughCopy('src/apple-touch-icon.png');
    config.addPassthroughCopy('src/browserconfig.xml');
    config.addPassthroughCopy('src/favicon-16x16.png');
    config.addPassthroughCopy('src/favicon-32x32.png');
    config.addPassthroughCopy('src/mstile-150x150.png');
    config.addPassthroughCopy('src/safari-pinned-tab.svg');
    config.addPassthroughCopy('src/site.webmanifest');



    config.addPassthroughCopy('src/fonts');
    config.addPassthroughCopy('src/images');
    config.addPassthroughCopy('src/scripts');
    config.addPassthroughCopy('src/styles');
    config.addPassthroughCopy('src/media');
    config.addPassthroughCopy('src/admin');
    config.addPassthroughCopy("src/functions");
    config.addPassthroughCopy("src/privacy");
    config.setDataDeepMerge(true);
    return {
        dir: {
            input: 'src',
            output: 'dist',
            includes: 'includes',
            layouts: 'layouts'
        },
        dataTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        passthroughFileCopy: true,
        templateFormats: [
            'md', 'njk'
        ],
    };
};