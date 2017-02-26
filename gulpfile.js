/* gulpfile.js */

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    babel  = require('gulp-babel'),

    // order is important for gulp-concat
    // app.js *must* come last
    sourceJS = [
        'src/js/get-events.js',
        'src/js/greet.js',
        'src/js/local_storage.js',
        'src/js/render-table.js',
        'src/js/render-chart.js',
        'src/js/repo-select.js',
        'src/js/backgrounds.js',
        'src/js/app.js'
    ];


// convert sass to css
// 'gulp-sass' listens for error events, but you have to enable logging
gulp.task('styles', function () {
    gulp.src('src/css/**/*.scss')
        .pipe(concat('dev-dash.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']  // autoprefixer needs config object
        }))
        .pipe(gulp.dest('dist/css'));
});


// concatenate scripts
gulp.task('scripts', function () {
    gulp.src(sourceJS)
        .pipe(sourcemaps.init())
        .pipe(concat('dev-dash.js'))
        .pipe(babel({
            presets: ['es2015']  // babel needs a config object
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
});


// init watcher
gulp.task('default', ['styles'], function() {
    
    // watch source sass files and convert ono changes
    gulp.watch('src/css/**/*.scss', ['styles']);

});
