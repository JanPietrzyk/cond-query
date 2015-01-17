module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'), 


   jshint: {
      files: ['Gruntfile.js', 'src/*.js', 'test/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    qunit: {
       all: ['test/*.html']
    },
    watch: {
       files: ['test/*', 'src/*'],
       tasks: ['qunit', 'jshint']
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '<%= pkg.name %>.min.js': ['src/condquery.js']
        }
      }
    },    
  });
  // load up your plugins
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // register one or more task lists (you should ALWAYS have a "default" task list)
  grunt.registerTask('default', ['qunit', 'jshint', 'uglify']);

};
