module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    babel: {
      options: {
        presets: ['env'],
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'js/',
          src: ['*.js'],
          dest: 'dist/js',
          ext: '.min.js',
        }],
      },
    },
    uglify: {
      dev: {
        files: [{
          expand: true,
          cwd: 'dist/js/',
          src: ['**/*.js', '!libs/*.js'],
          dest: 'dist/js',
          ext: '.min.js',
        }],
      },
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'css/',
          src: ['*.css'],
          dest: 'dist/css',
          ext: '.min.css',
        }],
      },
    },
    watch: {
      babel: {
        files: ['js/*.js'],
        tasks: ['babel'],
        options: {
          spawn: false,
        },
      },
      scripts: {
        files: ['dist/js/*.js'],
        tasks: ['uglify'],
        options: {
          spawn: false,
        },
      },
      css: {
        files: 'css/*.css',
        tasks: ['cssmin'],
        options: {
          spawn: false,
        },
      },
    },
  });

  // Load the plugins.
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['babel', 'uglify', 'cssmin']);
};
