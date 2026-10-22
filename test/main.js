const test = require('ava');


const Compiler = require('google-closure-compiler').compiler;

// Compiler.prototype.javaPath = '/node_modules/MODULE_NAME/jre/jre1.8.0_131.jre/Contents/Home/bin/java';

const compiler = new Compiler({
    dependency_mode : 'PRUNE',
    entry_point     : 'goog:TinyPath',
    js              : ['./src/closure-primitives/base.js', './src/js/TinyPath.js' ],
    formatting      : 'PRETTY_PRINT'
    // compilation_level: 'ADVANCED'
});

compiler.run((exitCode, stdOut, stdErr) => {
    // console.log( exitCode, stdOut, 'cc' );

    const TinyPath = new Function( stdOut + ';; return TinyPath;' )();

    const path = new TinyPath( '//example.com', __dirname );

    test('supplementIndexHtml',
        (t) => {
            t.deepEqual(
                path.supplementIndexHtml( '/' ),
                '/index.html'
            );

            t.deepEqual(
                path.supplementIndexHtml( '/about/campany/' ),
                '/about/campany/index.html'
            );

            t.deepEqual(
                path.supplementIndexHtml( './' ),
                './index.html'
            );
        }
    );

    test('cleanURL',
        (t) => {
            t.deepEqual(
                path.cleanURL( '/index.html#5' ),
                '/'
            );
            t.deepEqual(
                path.cleanURL( './?aaa' ),
                './'
            );
            t.deepEqual(
                path.cleanURL( './a.html#aaa' ),
                'a.html'
            );
            t.deepEqual(
                path.cleanURL( './index.html/index.html/index.html#5' ),
                'index.html/index.html/'
            );
        }
    );

    test('absoluteURLToRootRelativeURL',
        (t) => {
            t.deepEqual(
                path.absoluteURLToRootRelativeURL( '//example.com/' ),
                '/'
            );

            t.deepEqual(
                path.absoluteURLToRootRelativeURL( '//example.com/about/campany/' ),
                '/about/campany/'
            );
        }
    );

    test('rootRelativeURLToAbsoluteURL',
        (t) => {
            t.deepEqual(
                path.rootRelativeURLToAbsoluteURL( '/index.html#5' ),
                '//example.com/#5'
            );

            t.deepEqual(
                path.rootRelativeURLToAbsoluteURL( '/about/campany/?a=//#dede##' ),
                '//example.com/about/campany/?a=//#dede##'
            );
        }
    );

    test('rootRelativeURLToRelativeURL',
        (t) => {
            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/about/campany/', '/about/history.html' ),
                '../history.html'
            );
            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/', '/about/history.html' ),
                'about/history.html'
            );
            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/1/2/3/4/5', '/1/2/3/json/weather.json' ),
                '../json/weather.json'
            );
            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/1/2/3/4/5/', '/1/2/3/json/weather.json' ),
                '../../json/weather.json'
            );

            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/about/campany/?aha??#', '/about/history.html#de' ),
                '../history.html#de'
            );
            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/labels/animal/', '/labels/#top' ),
                '../#top'
            );
            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/labels/animal.html', '/labels/index.html#top' ),
                './#top'
            );
            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/labels/animal.html', '/labels/#top' ),
                './#top'
            );
            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/labels/', '/labels/#top' ),
                '#top'
            );
            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/labels/index.html', '/labels/#top' ),
                '#top'
            );

            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/labels/index.html#top', '/labels/' ),
                ''
            );

            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/labels/index.html?k=', '/labels/?a=//#top' ),
                './?a=//#top'
            );
            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/labels/index.html?k=//#a', '/labels/?a=//#top//' ),
                './?a=//#top//'
            );

            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/index.html/index.html/', '/index.html/history.html' ),
                '../history.html'
            );

            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/index.html/index.html/index.html', '/index.html/history.html' ),
                '../history.html'
            );

            t.deepEqual(
                path.rootRelativeURLToRelativeURL( '/index.html/index.html/index.html?a#0/#', '/index.html/history.html' ),
                '../history.html'
            );
        }
    );
    test('relativeURLToRootRelativeURL',
        (t) => {
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/about/campany/', 'history.html#ddd' ),
                '/about/campany/history.html#ddd'
            );
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/', 'index.html#ddd' ),
                '/#ddd'
            );
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/', '#ddd' ),
                '/#ddd'
            );

            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/', 'about/history.html' ),
                '/about/history.html'
            );
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/about/campany/#ddd', 'history.html#ddd' ),
                '/about/campany/history.html#ddd'
            );
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/#hash', 'about/history.html' ),
                '/about/history.html'
            );
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/1/2/3/4/5', '../../3/json/weather.json' ),
                '/1/2/3/json/weather.json'
            );

            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/', 'about/history.html?b=/./#c' ),
                '/about/history.html?b=/./#c'
            );
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/??', 'about/history.html?b=/./??#c' ),
                '/about/history.html?b=/./??#c'
            );
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/?d=ji###', 'about/history.html?b=/./#c##??' ),
                '/about/history.html?b=/./#c##??'
            );

            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/index.html/', 'history.html#ddd' ),
                '/index.html/history.html#ddd'
            );
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/index.html/index.html', 'history.html#ddd' ),
                '/index.html/history.html#ddd'
            );
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/index.html/index.html?a#/#', 'history.html#ddd' ),
                '/index.html/history.html#ddd'
            );
        }
    );
});
