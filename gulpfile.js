'use-strict'

const del = require('del'),
    imagemin = require('gulp-imagemin'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    cleanCss = require('gulp-clean-css'),
    flatmap = require('gulp-flatmap'),
    htmlmin = require('gulp-htmlmin');

const { series, src, dest } = require('gulp');

function sassC(){
    return src('./css/*.scss')
            .pipe(sass().on('error',sass.logError))
            .pipe(dest("./css"))
};

function watchSass(){
    watch(['./css/*.scss'], sassCompile);
};

function browsersync(){
    var files = [
        "./*.html",
        "./css/*.css",
        "./img/*.{png, jpg, gif}",
        "./js/*.js"
    ];

    browserSync.init(files, {
        server: {
            baseDir: "./"
        }
    });
};

function clean(){
    return del(['dist']);
};

function copyFonts(){
    return src('node_modules/@fortawesome/fontawesome-free/webfonts/*.{ttf,woff,eof,svg}*')
   .pipe(dest('./dist/fonts'));
}

function imageMin(){
    return src('img/*.{png, jpg, gif}')
            .pipe(imagemin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: true
            }))
            .pipe(dest('dist/img'));
};

function useMin(){
    return src('./*.html')
            .pipe(flatmap(function(stream, file){
                return stream
                        .pipe(usemin({
                            css: [ rev()],
                            html: [function()
                            {
                                return htmlmin({
                                    collapseWhitespace: true
                                })
                            }],
                            js: [
                                uglify(),
                                rev()
                            ],
                            inlinejs: [
                                uglify()
                            ],
                            inlinecss: [
                                cleanCss(),
                                'concat'
                            ]
                        }))
            }))
            .pipe(dest('dist/'));
};

exports.sassCompile = sassC;
exports.build = series(copyFonts, imageMin, useMin);
exports.default = series(browsersync,watchSass);
  