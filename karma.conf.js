// Karma configuration
// Generated on Wed Nov 12 2014 11:32:12 GMT+0800 (中国标准时间)

module.exports = function(config) {
  config.set({

    // 所有文件都相对于此路径
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],


    // 配置要加载的文件
    files: [
        'test/test-main.js',
        {pattern: 'coco/libs/3rd-libs/**/*.js', included: false},
        {pattern: 'coco/libs/common/**/*.js', included: false},
        {pattern: 'coco/libs/mvc/**/*.js', included: false},
        {pattern: 'coco/libs/ui/**/*.js', included: false},
        {pattern: 'coco/libs/util/**/*.js', included: false},
        {pattern: 'coco/coco-app/**/*.js', included: false},
        {pattern: 'test/**/*.js', included: false}

    ],


    // 要排除的文件列表
    exclude: [
        '../coco/coco-app/js/main.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
