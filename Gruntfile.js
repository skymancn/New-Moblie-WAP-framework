module.exports = function (grunt) {
    'use strict';
    // 统计grunt在处理每个任务时，所花的时间
    require('time-grunt')(grunt);

    // 自动扫描modules自动加载相关任务模块
    require('load-grunt-tasks')(grunt);

    // 相关公共配置
    var config = {
        tmp: 'coco/tmp',
        src: 'coco',
        dest: 'coco/dest'
    };

    // 配置所有任务
    grunt.initConfig({
            // 继承相关配置
            config: config,
            // 在运行任务之前，要消除文件及文件夹
            clean: {
                dist: {
                    files: [
                        {
                            dot: true,
                            src: [
                                '<%= config.tmp %>/{,*/}*',
                                '<%= config.dest %>/{,*/}*']
                        }
                    ]
                }
            },
            // 把需要压缩图片，styles, javascript and others 放在一个暂时文件里，
            // e.g. 比如我们用第三库时，里边会有其它用不到的文件
            copy: {
                dist: {
                    files: [
                        {
                            expand: true,
                            dot: true,
                            cwd: '<%= config.src %>',
                            dest: '<%= config.tmp %>',
                            src: [
                                '{,*/}*.{ico, png}',
                                '**/{,*/}*.js'
                            ]

                        }
                    ]
                }
            },
            // 代码质量检测，以确保代码风格一致，没有明显的错误
            jshint: {
                options: {
                    jshintrc: '.jshintrc',
                    reporter: require('jshint-stylish')
                },
                all: {
                    src: [
                        'Gruntfile.js',
                        '<%= config.src %>/js/**/{,*/}*.js'
                    ]
                }
            },
            // 监听文件变化，重新运行相应任务，自动刷新页面
            watch: {
                configFiles: {
                    files: ['Gruntfile.js'],
                    options: {
                        reload: true
                    }
                },
                js: {
                    files: ['<%=config.src %>/js/**/{,*/}*.js',
                        '<%=config.src %>/coco-app/js/**/{,*/}*.js'],
                    //tasks: ['newer:jshint:all'],
                    options: {
                        livereload: '<%= connect.options.livereload >'
                    }
                },
                livereload: {
                    files: ['<%=config.src %>/coco-app/**/{,*/}*.html',
                        '<%=config.src %>/coco-app/**/{,*/}*.css',
                        '<%=config.src %>/coco-app/**/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'],
                    options: {
                        livereload: true
                    }
                }
            },
            // grunt服务器设置
            connect: {
                options: {
                    port: 9000,
                    hostname: 'localhost',
                    livereload: true
                },
                livereload: {
                    options: {
                        open: true,
                        middleware: function (connect) {
                            return [
                                connect.static(config.src)
                            ];
                        }
                    }
                }
            },
            karma: {
                unit: {
                    configFile: 'karma.conf.js'
                }
            },
            webdriver: {
                options: {
                    desiredCapabilities: {
                        browserName: 'Chrome'
                    }
                },
                index: {
                    tests: ['test/webdriverio/page-index.js']
                },
                hotel: {
                    tests: ['test/webdriver/hotel/*.js'],
                    desiredCapabilities: {
                        browserName: 'Firefox'
                    }
                }
            },
            requirejs: {
                compile: {
                    options: {
                        baseUrl: 'coco',
                        mainConfigFile: 'config.js',
                        optimize: 'uglify2',
                        dir: 'dist',
                        //out: 'dist',
                        paths: {
                            //store: 'common/store'
                        },
                        uglify: {
                            toplevel: true,
                            ascii_only: true,
                            beautify: false,
                            max_line_length: 1000,
                            defines: {
                                DEBUG: ['name', 'false']
                            },
                            no_mangle: true
                        },
                        uglify2: {
                            output: {
                                beautify: false
                            },
                            compress: {
                                sequences: true,
                                global_defs: {
                                    DEBUG: false
                                }
                            },
                            warnings: true,
                            mangle: true
                        },
                        closure: {
                            CompilerOptions: {},
                            CompilationLevel: 'SIMPLE_OPTIMIZATIONS',
                            loggingLevel: 'WARNING'
                        },
                        skipDirOptimize: false,
                        normalizeDirDefines: 'skip',
                        generateSourceMaps: false,
                        modules: [
                            {
                                name: 'coco-app/js/views/home/home',
                                exclude: ['jquery', '_'],
                                override: {
                                    pragmas: {
                                        fooExclude: true
                                    }
                                }
                            }
                        ],
                        useStrict: false,
                        fileExclusionRegExp: /^\./
                    }
                }
            }

        }
    )
    ;

    grunt.registerTask('serve', ['connect:livereload', 'watch']);
    grunt.registerTask('copyfile', ['clean', 'copy']);
    grunt.registerTask('default', ['jshint']);

}
;