/*
 * Copyright (C) 2015 Richard Thomas
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Artistic License 2.0 as published by the
 * Open Source Initiative (http://opensource.org/licenses/Artistic-2.0)
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    csslint = require('gulp-csslint'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    replace = require('gulp-replace'),
    del = require('del');

var pkg = require('./package.json'),
    basename = pkg.name + '-' + pkg.version,
    banner = '/*! {{ pkg.name }} v{{ pkg.version }} */';

gulp.task('clean', function(cb) {
    del(['public_html/dist'], cb);
});

// Copy across unchanged files
gulp.task('images', ['images:favicon'], function() {
  return gulp.src([
      'public_html/img/*'])
    .pipe(gulp.dest('public_html/dist/img'));
});

gulp.task('images:favicon', function() {
    return gulp.src([
        'public_html/favicon.ico'])
    .pipe(gulp.dest('public_html/dist/'));
});

// Copy external libraries and plugins
gulp.task('external', ['external:images'], function() {
  return gulp.src([
      'public_html/bower_components/leaflet/dist/leaflet.js',
      'public_html/bower_components/leaflet/dist/leaflet.css',
      'public_html/bower_components/leaflet-sidebar/src/*',
      'public_html/bower_components/Leaflet.defaultextent/dist/*'])
    .pipe(gulp.dest('public_html/dist'));
});

gulp.task('external:images', function() {
  return gulp.src([
      'public_html/bower_components/leaflet/dist/images/*'])
    .pipe(gulp.dest('public_html/dist/images'));
});

// Lint JS + CSS
gulp.task('lint', ['lint:js']);
//gulp.task('lint', ['lint:js', 'lint:css']);

gulp.task('lint:js', function() {
  return gulp.src('public_html/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('lint:css', function() {
  return gulp.src('public_html/css/*.css')
    .pipe(csslint({
      'adjoining-classes': false,
      'box-sizing': false,
      'fallback-colors': false
    }))
    .pipe(csslint.reporter());
});

// Build HTML, JS + CSS
gulp.task('build:html', function() {
//    return gulp.src('public_html/index-dist.html')
//    .pipe(rename('index.html'))
    return gulp.src('public_html/index.html')
    .pipe(replace(/.*gulp-replace\(delete-line\).*/g, ''))
    .pipe(replace(/.*gulp-replace\(delete-block([0-9]+)-start\).*[^]*.*delete-block\1-end.*/g, ''))
    .pipe(gulp.dest('public_html/dist/'));
});

gulp.task('build:js', function() {
    return gulp.src('public_html/js/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('public_html/dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest('public_html/dist/'));
});

gulp.task('build:css', function() {
    return gulp.src('public_html/css/*.css')
    .pipe(concat('main.css'))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest('public_html/dist/'));
});

gulp.task('build',
    ['lint', 'build:html', 'build:js', 'build:css', 'images', 'external']);

gulp.task('default', function () {
    gulp.start('lint');
});
