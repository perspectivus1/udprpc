
module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default : {
        options: {
          target: "es6",
          rootDir: ".",
          module: "commonjs",
          additionalFlags: "--skipLibCheck"
        },
        src: ["./**/*.ts", "!./node_modules/**/*.ts"],
        outDir: "dist"
      }
    },
    clean: [
      "dist"
    ],
    tslint: {
      options: {},
      files: {
        src: [
          "code/**/*.ts"
        ]
      }
    },
    mochaTest: {
      unit_test: {
        options: {
          reporter: 'spec',
          captureFile: 'unit_results.txt', // Optionally capture the reporter output to a file 
          quiet: false, // Optionally suppress output to standard out (defaults to false) 
          clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false) 
          noFail: false // Optionally set to not fail on failed tests (will still fail on other errors) 
        },
        src: ['dist/tests/**/*.js']
      }
    },
    mocha_istanbul: {
      coverage: {
        src: ['dist/tests']
      },
      options: {
        mochaOptions: ["-t", "2000"]
      }
    },
    istanbul_check_coverage: {
      default: {
        options: {
          coverageFolder: 'coverage*',
          check: {
            lines: 89,
            statements: 89,
            functions: 95,
            branches: 60
          }
        }
      }
    }
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-tslint");
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.registerTask("default", ["tslint", "clean", "ts"]);
  grunt.registerTask("test", ["mochaTest:unit_test"]);
  grunt.registerTask("coverage", ["mocha_istanbul", "istanbul_check_coverage"]);
};
