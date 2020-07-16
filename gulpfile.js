'use-strict'

//Gulp functions 
const { series, src, dest, watch, parallel } = require('gulp');

//Plugins
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

//Compile scss files
function sassC(){
    return src('./src/css/*.scss')
            .pipe(sass().on('error',sass.logError))
            .pipe(dest("./src/css"))
};

//Auto compile scss files on save
function watchSass(){
    watch('./src/css/*.scss', sassC);
};

//Auto reload browser on save
function browsersync(){
    var files = [
        "./src/*.html",
        "./src/css/*.css",
        "./src/img/*.{png, jpg, gif}",
        "./src/js/*.js"
    ];

    browserSync.init(files, {
        server: {
            baseDir: "./src/"
        }
    });
};

//Deletes dist directory
function clean(){
    return del(['dist']);
};

//Copy fontawesome fonts
function copyFonts(){
    return src('node_modules/@fortawesome/fontawesome-free/webfonts/*.{ttf,woff,eof,svg}*')
   .pipe(dest('./dist/fonts'));
}

//Compress images. Output saved to dist directory
function imageMin(){
    return src('src/img/*.{png, jpg, gif}')
            .pipe(imagemin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: true
            }))
            .pipe(dest('dist/img'));
};

//Minify html, css, js and concatenate each. Output saved to dist directory with each version code.
function useMin(){
    return src('./src/*.html')
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


//Gulp commands
exports.sassCompile = sassC;                                //Compile scss
exports.build = series(clean, copyFonts, imageMin, useMin); //Recreate dist directory for deployment
exports.default = parallel(browsersync,watchSass);          //Auto reload and compile on save while development
  