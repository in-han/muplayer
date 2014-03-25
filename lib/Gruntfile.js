var commander = require('commander'),
    hostname = '0.0.0.0',
    port = 7777;

commander
    .option('-p, --port [type]', 'To specify a server port number(default: 7777)')
    .parse(process.argv);

port = commander.port || 7777;

module.exports = function(grunt) {
    grunt.initConfig({
        dirs: {
            root: '..',
            src: '../src',
            dist: '../dist',
            test: '../test',
            tmp: '../tmp',
            doc: '../doc',
            css: '../src/css',
            jade: '../src/jade',
            js: '../src/js'
        },

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                node: true,
                es3: true,
                strict: false,
                unused: true,
                quotmark: 'single',
                laxbreak: true,
                browser: true
            },
            files: [
                'Gruntfile.js'
            ]
        },

        connect: {
            server: {
                options: {
                    hostname: hostname,
                    port: port,
                    base: ['..', '<%= dirs.test %>'],
                    keepalive: true
                }
            }
        },

        coffee: {
            src: {
                expand: true,
                options: {
                    bare: true
                },
                cwd: '<%= dirs.js %>',
                src: '**/*.coffee',
                dest: '<%= dirs.tmp %>/js',
                ext: '.js'
            },
            test: {
                expand: true,
                cwd: '<%= dirs.test %>',
                src: '**/*.coffee',
                dest: '<%= dirs.test %>',
                ext: '.js'
            },
            doc: {
                options: {
                    bare: true
                },
                src: '<%= dirs.js %>/player.coffee',
                dest: '<%= dirs.tmp %>/js/player.js'
            }
        },

        compass: {
            tmp: {
                options: {
                    sassDir: '<%= dirs.css %>',
                    cssDir: '<%= dirs.dist %>/css',
                    noLineComments: true
                }
            }
        },

        watch: {
            js: {
                files: [
                    'Gruntfile.js'
                ],
                tasks: ['jshint']
            },
            coffee: {
                files: [
                    '<%= dirs.js %>/**/*.coffee',
                    '<%= dirs.test %>/**/*.coffee'
                ],
                tasks: ['coffee:src']
            }
        },

        copy: {
            tmpjs: {
                expand: true,
                cwd: '<%= dirs.js %>/',
                src: '**/*.js',
                dest: '<%= dirs.tmp %>/js'
            },
            img: {
                expand: true,
                cwd: '<%= dirs.src %>/img/',
                src: '**/*',
                dest: '<%= dirs.dist %>/img'
            },
            mp3: {
                expand: true,
                cwd: '<%= dirs.src %>/mp3/',
                src: '**/*',
                dest: '<%= dirs.dist %>/mp3'
            },
            swf: {
                expand: true,
                cwd: '<%= dirs.src %>/swf/',
                src: '**/*',
                dest: '<%= dirs.dist %>/swf'
            },
            js: {
                expand: true,
                cwd: '<%= dirs.tmp %>/build/js/',
                src: '**/*.js',
                dest: '<%= dirs.dist %>/js'
            }
        },

        clean: {
            tmp: {
                options: {
                    force: true
                },
                src: [
                    '<%= dirs.tmp %>'
                ]
            },
            dist: {
                options: {
                    force: true
                },
                src: [
                    '<%= dirs.dist %>'
                ]
            },
            doc: {
                options: {
                    force: true
                },
                src: [
                    '<%= dirs.doc %>'
                ]
            }
        },

        requirejs: {
            compile: {
                options: {
                    appDir: '<%= dirs.tmp %>',
                    baseUrl: 'js/',
                    dir: '<%= dirs.tmp %>/build/',
                    optimize: 'none',
                    optimizeCss: 'standard',
                    modules: [
                        {
                            name: 'muplayer/player'
                        }
                    ],
                    fileExclusionRegExp: /^\./,
                    removeCombined: true,
                    wrap: {
                        startFile: '<%= dirs.src %>/license.txt'
                    },
                    pragmas: {
                        FlashCoreExclude: false//true
                    },
                    // HACK: 为了映射muplayer这个namespace
                    paths: {
                        'muplayer': '../js'
                    }
                }
            }
        },

        mxmlc: {
            options: {
                // XXX: 不加这个编译会乱码, 怀疑是grunt-mxmlc本身的issue
                rawConfig: '+configname=air'
            },
            compile: {
                files: {
                    '<%= dirs.dist %>/swf/fmp.swf': '<%= dirs.src %>/as/FlashPlayer.as'
                }
            }
        },

        uglify: {
            options: {
                report: 'min',
                preserveComments: 'some'
            },
            compress: {
                files: {
                    '<%= dirs.dist %>/js/player.min.js': '<%= dirs.dist %>/js/player.js'
                }
            }
        },

        shell: {
            doxx: {
                options: {
                    stderr: true
                },
                command: [
                    'doxx -R <%- dirs.root %>/README.md -t "muplayer 『百度音频内核』" -s <%- dirs.tmp %>/js -T <%- dirs.doc %> --template <%- dirs.jade %>/doc.jade',
                    'mv <%- dirs.doc %>/player.js.html <%- dirs.doc %>/api.html',
                    'cp <%- dirs.src %>/demo.html <%- dirs.doc %>'
                ].join('&&')
            }
        },

        qunit: {
            all: {
                options: {
                    urls: [
                        'http://' + hostname + ':' + port + '/runner.html'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mxmlc');
    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    grunt.registerTask('default', ['jshint', 'build', 'doc']);
    grunt.registerTask('server', ['connect:server']);
    grunt.registerTask('copy-to-dist', ['copy:img', 'copy:mp3', 'copy:swf',
        'copy:js']);
    grunt.registerTask('build', ['copy:tmpjs', 'coffee', 'requirejs', 'clean:dist',
        'copy-to-dist', 'compass', 'mxmlc', 'uglify', 'clean:tmp']);
    grunt.registerTask('doc', ['clean:doc', 'compass', 'coffee:doc', 'shell:doxx',
        'clean:tmp']);
};