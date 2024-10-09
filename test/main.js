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
            )
        }
    );
    test('relativeURLToRootRelativeURL',
        (t) => {
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/about/campany/', 'history.html#ddd' ),
                '/about/campany/history.html#ddd'
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
            )
            t.deepEqual(
                path.relativeURLToRootRelativeURL( '/1/2/3/4/5', '../../3/json/weather.json' ),
                '/1/2/3/json/weather.json'
            )
        }
    );
});
