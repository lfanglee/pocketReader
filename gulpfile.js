const gulp = require('gulp');
const path = require('path');
const plugins = require('gulp-load-plugins')();
const del = require('del');

const through = require('through2');
const colors = require('ansi-colors');
const log = require('fancy-log');
const argv = require('minimist')(process.argv.slice(2));
const runSequence = require('run-sequence');

const pxtorpx = require('postcss-px2rpx');
const base64 = require('postcss-font-base64');
const combiner = require('stream-combiner2');

const isProd = argv.type === 'prod';

const exclude = {
    dir: 'components',
    type: ['wxss', 'json', 'scss']
};

const paths = {
    src: {
        baseDir: 'client',
        imgSrc: 'client/images',
        imgFiles: 'client/images/**',
        excludeDir: `client/${exclude.dir}`
    },
    cloud: {
        baseDir: 'server/cloud-functions',
        destDir: 'dist/cloud-functions'
    },
    dist: {
        baseDir: 'dist',
        imgDest: 'dist/images',
        excludeDir: `dist/${exclude.dir}`
    }
};

const handleError = (err) => {
    console.log('\n');
    log(colors.red('Error: ' + err.name));
    log('fileName: ' + colors.red(err.fileName));
    log('lineNumber: ' + colors.red(err.lineNumber || JSON.stringify(err.loc)));
    log('message: ' + err.message);
    log('plugin: ' + colors.yellow(err.plugin));
};

gulp.task('wxml', () => {
    return gulp
        .src([`${paths.src.baseDir}/**/*.wxml`, `!${paths.src.excludeDir}/**/*.{${exclude.type.join(',')}}`])
        // .pipe(isProd ? plugins.htmlmin({
        //     collapseWhitespace: true,
        //     removeComments: true,
        //     keepClosingSlash: true
        // }) : through.obj())
        .pipe(gulp.dest(paths.dist.baseDir));
});

// 关闭自动补全，启用微信小程序开发者工具自带补全功能
gulp.task('wxss', () => {
    const combined = combiner.obj([
        gulp.src([`${paths.src.baseDir}/**/*.{wxss,scss}`, `!${paths.src.excludeDir}/**/*.{${exclude.type.join(',')}}`]),
        plugins.sass().on('error', plugins.sass.logError),
        plugins.postcss([pxtorpx(), base64()]),
        isProd ? plugins.cssnano({
            autoprefixer: false,
            discardComments: { removeAll: true }
        }) : through.obj(),
        plugins.rename((path) => (path.extname = '.wxss')),
        gulp.dest(paths.dist.baseDir)
    ]);

    combined.on('error', handleError);

    return combined;
});

gulp.task('js', () => {
    const combined = combiner.obj([
        gulp.src([`${paths.src.baseDir}/**/*.js`, `!${paths.src.excludeDir}/**/*.{${exclude.type.join(',')}}`]),
        isProd ? plugins.jdists({
            trigger: 'prod'
        }) : plugins.jdists({
            trigger: 'dev'
        }),
        isProd ? through.obj() : plugins.sourcemaps.init(),
        plugins.babel({
            presets: ['@babel/env']
        }),
        isProd ? plugins.uglify({
            compress: true
        }) : through.obj(),
        isProd ? through.obj() : plugins.sourcemaps.write('./'),
        gulp.dest(paths.dist.baseDir)
    ]);

    combined.on('error', handleError);

    return combined;
});

gulp.task('json', () => {
    return gulp.src([`${paths.src.baseDir}/**/*.json`, `!${paths.src.excludeDir}/**/*.{${exclude.type.join(',')}}`, `!${paths.src.baseDir}/project.config.json`])
        .pipe(isProd ? plugins.jsonminify() : through.obj())
        .pipe(gulp.dest(paths.dist.baseDir));
});
gulp.task('generateProjectConfigJson', () => {
    return gulp.src('${paths.src.baseDir}/project.config.json')
        .pipe(isProd ? plugins.jsonminify() : through.obj())
        .pipe(gulp.dest(paths.dist.baseDir));
})

gulp.task('images', () => {
    return gulp.src([`${paths.src.baseDir}/**/*.{jpg,jpeg,png,gif,svg}`, `!${paths.src.excludeDir}/**/*.{${exclude.type.join(',')}}`])
        .pipe(plugins.newer(paths.dist.imgDest))
        .pipe(plugins.imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }]
        }))
        .pipe(gulp.dest(paths.dist.baseDir));
});

gulp.task('wxs', () => {
    return gulp.src([`${paths.src.baseDir}/**/*.wxs`, `!${paths.src.excludeDir}/**/*.{${exclude.type.join(',')}}`]).pipe(gulp.dest(paths.dist.baseDir));
});

gulp.task('extras', () => {
    return gulp.src([
        `${paths.src.baseDir}/**/*.*`,
        `!${paths.src.baseDir}/**/*.{js,wxml,wxss,scss,wxs,json,jpg,jpeg,png,gif,svg}`,
        `!${paths.src.excludeDir}/**/*.{${exclude.type.join(',')}}`
    ]).pipe(gulp.dest(paths.dist.baseDir));
});

gulp.task('excludes', () => {
    return gulp.src(`${paths.src.excludeDir}/**/*.{${exclude.type.join(',')}}`).pipe(gulp.dest(paths.dist.excludeDir));
});

gulp.task('watch', () => {
    const handleWatch = (filePath) => {
        const extname = path.extname(filePath).slice(1);
        if (['wxml', 'wxss', 'js', 'json', 'wxs'].includes(extname)) {
            if (filePath.includes('project.config.json')) {
                runSequence('generateProjectConfigJson');
            } else {
                runSequence(extname);
            }
        } else if (extname === 'scss') {
            runSequence('wxss');
        } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extname)) {
            runSequence('images');
        } else {
            runSequence('extras');
        }
    };

    plugins.watch(`${paths.src.baseDir}/**`)
        .on('add', (file) => {
            log(colors.green(file) + ' is added');
            handleWatch(file);
        }).on('change', (file) => {
            log(colors.yellow(file) + ' is changed');
            handleWatch(file);
        }).on('unlink', (file) => {
            log(colors.red(file) + ' is deleted');
            path.extname(file) === '.scss'
                ? del([file.replace(paths.src.baseDir, paths.dist.baseDir).replace('.scss', '.wxss')])
                : del([file.replace(paths.src.baseDir, paths.dist.baseDir)]);
        });
});

// 云开发相关输出流
gulp.task('cloud', () => {
    return gulp
        .src(`${paths.cloud.baseDir}/**`)
        .pipe(isProd ? plugins.jdists({
            trigger: 'prod'
        }) : plugins.jdists({
            trigger: 'dev'
        }))
        .pipe(gulp.dest(paths.cloud.destDir));
});

gulp.task('watch:cloud', () => {
    plugins.watch(`${paths.cloud.baseDir}/**`, () => {
        runSequence('cloud');
    }).on('add', (file) => {
        log(colors.green(file) + ' is added');
    }).on('change', (file) => {
        log(colors.yellow(file) + ' is changed');
    }).on('unlink', (file) => {
        log(colors.red(file) + ' is deleted');
        del([file.replace('server/', 'dist/')]);
    });
});


// 提供package.json scripts调用
gulp.task('clean', () => {
    return del([`${paths.dist.baseDir}/**`]);
});

gulp.task('dev', ['clean'], () => {
    runSequence('json', 'generateProjectConfigJson', 'images', 'wxml', 'wxss', 'js', 'wxs', 'extras', 'excludes', 'cloud', 'watch');
});

gulp.task('build', ['clean'], () => {
    runSequence('json', 'generateProjectConfigJson', 'images', 'wxml', 'wxss', 'js', 'wxs', 'extras', 'excludes', 'cloud');
});

gulp.task('cloud:dev', () => {
    runSequence('cloud', 'watch:cloud');
});
