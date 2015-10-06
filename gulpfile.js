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
        rename = require('gulp-rename'),
        concat = require('gulp-concat'),
        notify = require('gulp-notify'),
        uglify = require('gulp-uglify'),
        del = require('del');

// "Tasks in Gulp run concurrently together and have no order in which they’ll
// finish, so we need to make sure the clean task is completed before running
// additional tasks. Note: It’s advised against using gulp.start in favour of
// executing tasks in the dependency arrary, but in this scenario to ensure
// clean fully completes, it seems the best option."
gulp.task('default', ['clean'], function () {
    // place code for your default task here
        gulp.start('build');

});

gulp.task('clean', function(cb) {
    del(['public_html/dist'], cb);
});

gulp.task('styles', function() {
  return gulp.src([
      'public_html/Leaflet.locateme/dist/*.png',
      'public_html/Leaflet.locateme/dist/*.css'])
    .pipe(gulp.dest('public_html/dist'));
});

gulp.task('images', function() {
  return gulp.src([
      'public_html/img/*'])
    .pipe(gulp.dest('public_html/dist/img'));
});

gulp.task('external', function() {
  return gulp.src([
      'node_modules/leaflet/dist/*',
      'node_modules/leaflet/dist/*/*',
      'node_modules/leaflet-sidebar/src/*',
      'node_modules/leaflet.defaultextent/dist/*'])
    .pipe(gulp.dest('public_html/dist'));
});

gulp.task('buildindex', function() {
    return gulp.src('public_html/index-dist.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest('public_html/dist/'));
});
gulp.task('build', ['buildindex', 'styles', 'images', 'external'], function() {
    return gulp.src([
        'public_html/Leaflet.locateme/dist/*.js',
        'public_html/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('public_html/dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public_html/dist/'));
});