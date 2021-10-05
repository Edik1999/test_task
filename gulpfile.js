'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const javascriptObfuscator = require('gulp-javascript-obfuscator');
const pug = require('gulp-pug');
const del = require('del');
const browserSync = require('browser-sync').create();
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const webp = require('gulp-webp');
 
var paths = {
  html:{
    src: 'src/*.pug',
    dest: 'app/'
  },
  images: {
    src: 'src/images/**/*.{jpg,jpeg,png}',
    dest: 'src/images/min/'
  },
  styles: {
    src: 'src/styles/**/*.sass',
    dest: 'app/assets/styles/'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'app/assets/scripts/'
  }
};

function browsersync() {
    browserSync.init({
            open: true,
            server: paths.html.dest
    });
}

function clean(){
    return del([paths.html.dest]);
}
 
function html() {
  return gulp.src(paths.html.src)
    .pipe(pug())
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.reload({stream: true}))
}
 
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.reload({stream: true}))
}
 
function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('main.min.js'))
    .pipe(javascriptObfuscator({
        compact: true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.reload({stream: true}))
}

function images(){
    return gulp.src(paths.images.src)
        .pipe(newer(paths.images.dest))
        .pipe(imagemin([

            imageminJpegRecompress({
                progressive: true,
                min: 70, max: 75
            }),

            pngquant({
                speed: 5,
                quality: [0.6, 0.8]
            }),

            imagemin.svgo({
                plugins: [
                        { removeViewBox: false },
                        { removeUnusedNS: false },
                        { removeUselessStrokeAndFill: false },
                        { cleanupIDs: false },
                        { removeComments: true },
                        { removeEmptyAttrs: true },
                        { removeEmptyText: true },
                        { collapseGroups: true }
                ]
            })

        ]))
        .pipe(gulp.dest(paths.images.dest))
}

function webConverter(){
    return gulp.src(paths.images.dest + '**/*.{png,jpg,jpeg}')
        .pipe(webp())
        .pipe(gulp.dest('app/assets/img/'))
}

const image = gulp.series(images, webConverter, (done) => {browserSync.reload(); done();});
 
function watch() {
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.images.src, image);
}
 
var build = gulp.series(
    gulp.parallel(clean),
    gulp.parallel(html, styles, scripts, image),
    gulp.parallel(browsersync, watch)
);

exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watch = watch;
exports.build = build;

exports.default = build;