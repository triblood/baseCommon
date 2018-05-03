var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

// Development Tasks 
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'assets/src'
    }
  })
})

gulp.task('sass', function() {
  return gulp.src('assets/src/scss/**/*.scss') // Gets all files ending with .scss in assets/src/scss and children dirs
    .pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
    .pipe(gulp.dest('assets/src/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})

gulp.task('jsMinify', function(){
    return gulp.src('assets/src/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .on('error', function(err) {
      console.error('Error in compress task', err.toString());
    });
})

gulp.task('cssMinify', function(){
  return gulp.src('assets/src/css/**/*.css')
  .pipe(cssnano())
  .pipe(gulp.dest('build/css'))
})


// Watchers
gulp.task('watch', function() {
  gulp.watch('assets/src/scss/**/*.scss', ['sass']);
  gulp.watch('assets/src/*.html', browserSync.reload);
  gulp.watch('assets/src/js/**/*.js', browserSync.reload);
})

// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', function() {

  return gulp.src('assets/src/*.html')
    .pipe(useref())
    .pipe(gulpIf('assets/src/*.js', uglify()))
    .pipe(gulpIf('assets/src/*.css', cssnano()))
    .pipe(gulp.dest('build'));
});

// Optimizing Images 
gulp.task('images', function() {
  return gulp.src('assets/src/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('build/images'))
});

// Copying fonts 
gulp.task('fonts', function() {
  return gulp.src('assets/src/fonts/**/*')
    .pipe(gulp.dest('build/fonts'))
})

// Cleaning 
gulp.task('clean', function() {
  return del.sync('build').then(function(cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:build', function() {
  return del.sync(['build/**/*', '!build/images', '!build/images/**/*']);
});

// Build Sequences
// ---------------

gulp.task('default', function(callback) {
  runSequence(['sass', 'browserSync'], 'watch',
    callback
  )
})

gulp.task('build', function(callback) {
  runSequence('clean:build',['useref','jsMinify','cssMinify','images'],
    callback
  )
})