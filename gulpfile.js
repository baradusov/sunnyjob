const { src, dest, parallel, watch } = require("gulp");
const postcss = require("gulp-postcss");
const postcssImport = require("postcss-import");
const postcssPresetEnv = require("postcss-preset-env");
const postcssFlexBugs = require("postcss-flexbugs-fixes");
const postcssNormalize = require("postcss-normalize");
const cssnano = require("cssnano");
const browsersync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const htmlmin = require("gulp-htmlmin");

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./build/"
    },
    port: 3000
  });
  done();
}

function css() {
  const plugins = [
    postcssImport(),
    postcssNormalize(),
    postcssPresetEnv({ stage: 0 }),
    postcssFlexBugs(),
    // cssnano()
  ];

  return src("src/css/main.css", { sourcemaps: true })
    .pipe(postcss(plugins))
    .pipe(dest("build/css/", { sourcemaps: "." }))
    .pipe(browsersync.stream());
}

function html() {
  return src("src/**/*.html")
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true
      })
    )
    .pipe(dest("build/"))
    .pipe(browsersync.stream());
}

function img() {
  return src("src/images/**/*")
    .pipe(
      imagemin([
        mozjpeg({ quality: 90 }),
        imagemin.gifsicle({ interlaced: true }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        })
      ])
    )
    .pipe(dest("build/images/"))
    .pipe(browsersync.stream());
}

function watchFiles() {
  watch("src/css/**/*.css", css);
  watch("src/**/*.html", html);
  watch("src/images/**/*", img);
}

const serve = parallel(watchFiles, browserSync);

exports.serve = serve;
exports.css = css;
exports.default = parallel(css, html, img);
