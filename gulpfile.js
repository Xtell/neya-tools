const gulp = require('gulp');
const babel = require('gulp-babel');
const postcss = require('gulp-postcss');
const csso = require('gulp-csso');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const sync = require('browser-sync');
const del = require('del');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');

const libsJs = ['node_modules/@splidejs/splide/dist/js/splide.min.js'];

const JPEG_QUALITY = 90;
const WEBP_QUALITY = 90;

/* HTML */

const html = () => {
    return gulp
        .src('./src/index.html')
        .pipe(gulp.dest('dist'))
        .pipe(sync.stream())
};
exports.html = html;

/* Browser-sync */

const server = () => {
    sync.init({
        ui: false,
        notify: false,
        server: {
            baseDir: 'dist'
        }
    });
};
exports.server = server;

/* Styles */

const styles = () => {
    return gulp
        .src('./src/styles/index.css')
        .pipe(
            postcss([
                require('postcss-import'),
                require('postcss-nested'),
                require('postcss-color-mod-function'),
                require('postcss-media-minmax'),
                require('autoprefixer'),
            ]),
        )
        .pipe(csso())
        .pipe(rename('index.min.css'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(sync.stream())
};
exports.styles = styles;

/* Scripts */

const jsLibs = () => {
    return gulp.src(libsJs).pipe(concat('libs.js')).pipe(gulp.dest('./tmp'));
};
const jsBabel = () => {
    return gulp
        .src('./src/scripts/index.js')
        .pipe(
            babel({
                presets: ['@babel/preset-env'],
            }),
        )
        .pipe(gulp.dest('./tmp'));
};
const jsConcat = () => {
    return gulp
        .src(['./tmp/libs.js', './tmp/index.js'])
        .pipe(concat('index.js'))
        .pipe(terser())
        .pipe(rename('index.min.js'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(sync.stream())
};
exports.jsConcat = jsConcat;

const scripts = gulp.series(gulp.parallel(jsLibs, jsBabel), jsConcat);
exports.scripts = scripts;

/* Images */

const images = () => {
    return gulp.src('./src/images/*.*')
        .pipe(newer('dist/images'))
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'))
}
exports.images = images;

/* Sprite */
const sprite = () => {
    return gulp.src('src/icons/*.*')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../sprite.svg"
                }
            },
        }))
        .pipe(gulp.dest('dist'))
}
exports.sprite = sprite;

/* Watch */

const watch = () => {
    gulp.watch('src/*.html', gulp.series(html));
    gulp.watch('src/styles/**/*.css', gulp.series(styles));
    gulp.watch('src/scripts/**/*.js', gulp.series(scripts));
    gulp.watch('src/fonts/**/*.woff2', gulp.series(copy));
    gulp.watch('src/images/**/*', gulp.series(images));
    gulp.watch('src/icons/**/*', gulp.series(sprite));
}

const clear = () => {
    return del('dist');
}
exports.clear = clear;

const copy = () => {
    return gulp.src('./src/fonts/**/*.woff2')
        .pipe(newer('dist/fonts'))
        .pipe(gulp.dest('dist/fonts'))
}
exports.copy = copy;

exports.default = gulp.series(clear, gulp.parallel(styles, scripts, html, copy, images, sprite), gulp.parallel(watch, server));

