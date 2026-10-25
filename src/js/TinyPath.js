goog.provide( 'TinyPath' );
// goog.provide( 'TinyPath.DEFINE.DEBUG' );

/**
 * @constructor
 * @param {string} urlOrigin http://example.com or https://example.com or //example.com
 * @param {string=} opt_absolutePathOfSrcRoot 'C:/User/xxx/xxx' No need to set this parameter if you only want to convert URLs
 */
TinyPath = function( urlOrigin, opt_absolutePathOfSrcRoot ){
    /** @const {string} */
    this._urlOrigin = urlOrigin +
        ( urlOrigin.charAt( urlOrigin.length - 1 ) === '/' ? '' : '/' );

    if( opt_absolutePathOfSrcRoot ){
        opt_absolutePathOfSrcRoot = this.normalizeFilePath( opt_absolutePathOfSrcRoot );

        /** @const {string} 'C:/src' => 'C:/src/' */
        this._absolutePathOfSrcRoot = opt_absolutePathOfSrcRoot +
            ( opt_absolutePathOfSrcRoot.charAt( opt_absolutePathOfSrcRoot.length - 1 ) === '/' ? '' : '/' );
    };
};

/** @namespace */
TinyPath.DEFINE = {};

/**
 * @private
 * @define {boolean} */
TinyPath.DEFINE.DEBUG = goog.define( 'TinyPath.DEFINE.DEBUG' , true );

/**----------------------------------------------------------------------------
 *   private
 */

/**
 * @private
 * @param {string} basePath root relative path
 * @param {string} relativePath
 * @return {string}
 */
TinyPath.prototype._relativePathToRootRelativePath = function( basePath, relativePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( this.normalizeFilePath( basePath ) !== basePath ){
            throw 'Use this.normalizeFilePath(basePath) before call. ' + basePath;
        };
        if( this.normalizeFilePath( relativePath ) !== relativePath ){
            throw 'Use this.normalizeFilePath(relativePath) before call. ' + relativePath;
        };
        if( this.supplementIndexHtml( basePath ) !== basePath ){
            throw 'Use this.supplementIndexHtml(basePath) before call. ' + basePath;
        };
        if( this.supplementIndexHtml( relativePath ) !== relativePath ){
            throw 'Use this.supplementIndexHtml(relativePath) before call. ' + relativePath;
        };
    };

    var originalRelativePath = relativePath;
    var basePathElements = basePath.split( '/' );

    basePathElements.pop();
    basePathElements[ 0 ] === '' && basePathElements.shift();

    if( relativePath.substr( 0, 2 ) === './' ){
        relativePath = relativePath.substr( 2 );
    };

    while( relativePath.substr( 0, 3 ) === '../' ){
        if( TinyPath.DEFINE.DEBUG ){
            if( !basePathElements.length ){
                throw 'Failed _relativePathToRootRelativePath! base:' + basePath + ' target:' + originalRelativePath;
            };
        };
        relativePath = relativePath.substr( 3 );
        --basePathElements.length;
    };

    return ( basePathElements.length ? '/' + basePathElements.join( '/' ) : '' ) + '/' + relativePath;
};

/**
 * @private
 * @param {string} basePath
 * @param {string} rootRelativePath
 * @return {string}
 */
TinyPath.prototype._rootRelativePathToRelativePath = function( basePath, rootRelativePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( this.normalizeFilePath( basePath ) !== basePath ){
            throw 'Use this.normalizeFilePath(basePath) before call. ' + basePath;
        };
        if( this.normalizeFilePath( rootRelativePath ) !== rootRelativePath ){
            throw 'Use this.normalizeFilePath(rootRelativePath) before call. ' + rootRelativePath;
        };
        if( this.supplementIndexHtml( basePath ) !== basePath ){
            throw 'Use this.supplementIndexHtml(basePath) before call. ' + basePath;
        };
        if( this.supplementIndexHtml( rootRelativePath ) !== rootRelativePath ){
            throw 'Use this.supplementIndexHtml(rootRelativePath) before call. ' + rootRelativePath;
        };
    };

    var link = [], i = 0, skipCompare = false,
        basePathElements, baseName,
        rootRelativePathElements, targetName,
        depth, l;

    basePathElements = basePath.split( '/' );
    baseName = basePathElements.pop();

    if( basePath === rootRelativePath ){
        return '';
    };

    rootRelativePathElements = rootRelativePath.split( '/' );
    targetName = rootRelativePathElements.pop();

    for( depth = basePathElements.length, l = Math.max( rootRelativePathElements.length, depth ); i < l; ++i ){
        if( skipCompare || rootRelativePathElements[ i ] !== basePathElements[ i ] ){
            if( i < depth ){
                link.unshift( '..' );
            };
            if( rootRelativePathElements[ i ] ){
                link.push( rootRelativePathElements[ i ] );
            };
            skipCompare = true;
        };
    };
    if( skipCompare || baseName !== targetName ){
        link.push( targetName );
    };
    return link.join( '/' );
};

/**----------------------------------------------------------------------------
 *   Common
 */

/**
 * @param {string} filePathOrURL
 * @return {boolean}
 */
TinyPath.prototype.isAbsolutePath = function( filePathOrURL ){
    if( this._absolutePathOfSrcRoot ){
        return this.isAbsoluteFilePath( filePathOrURL ) || this.isAbsoluteURL( filePathOrURL );
    };
    return this.isAbsoluteURL( filePathOrURL );
};

/**----------------------------------------------------------------------------
 *   Convert
 */

/**
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.removeIndexHtml = function( url ){
    if( TinyPath.DEFINE.DEBUG ){
        if( this.getSearchParam( url ) || this.getHashFragment( url ) ){
            throw 'Use this.cleanURL(url) before call. ' + url;
        };
    };

    var urlElements = url.split( 'index.html' );

    // "/index.html" => ["/", ""] => "/"
    // "/index.html/index.html" => ["/", "/", ""] => "/index.html/"
    if( !urlElements[ urlElements.length - 1 ] ){
        urlElements.pop();
    };
    return urlElements.join( 'index.html' );
};

/**
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.supplementIndexHtml = function( url ){
    if( TinyPath.DEFINE.DEBUG ){
        if( this.getSearchParam( url ) || this.getHashFragment( url ) ){
            throw 'Use this.cleanURL(url) before call. ' + url;
        };
    };

    var pathElements = url.split( '/' );
    var lastIndex = pathElements.length - 1;

    // "/" => ["", ""] => "/index.html"
    // "/index.html/" => ["", "index.html", ""] => "/index.html/index.html"
    if( !pathElements[ lastIndex ] ){
        pathElements[ lastIndex ] = 'index.html';
    };
    return pathElements.join( '/' );
};

/**----------------------------------------------------------------------------
 *   File Path
 */

/**
 * @param {string} filePath
 * @return {string}
 */
TinyPath.prototype.filePathToFileName = function( filePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( this.normalizeFilePath( filePath ) !== filePath ){
            throw 'Use this.normalizeFilePath(filePath) before call. ' + filePath;
        };
    };
    return filePath.split( '/' ).pop();
};

/**
 * @param {string} filePath
 * @return {boolean}
 */
TinyPath.prototype.isAbsoluteFilePath = function( filePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this._absolutePathOfSrcRoot ){
            throw 'absoluteDirectoryPathOfRoot is empty!';
        };
        if( this.normalizeFilePath( filePath ) !== filePath ){
            throw 'Use this.normalizeFilePath(filePath) before call. ' + filePath;
        };
    };
    return filePath.indexOf( this._absolutePathOfSrcRoot ) === 0;
};

/**
 * @param {string} filePath
 * @return {boolean}
 */
TinyPath.prototype.isRootRelativeFilePath = function( filePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( this.normalizeFilePath( filePath ) !== filePath ){
            throw 'Use this.normalizeFilePath(filePath) before call. ' + filePath;
        };
    };
    return filePath.charAt( 0 ) === '/';
};


/**
 * @param {string} filePath
 * @return {boolean}
 */
TinyPath.prototype.isRelativeFilePath = function( filePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( this.normalizeFilePath( filePath ) !== filePath ){
            throw 'Use this.normalizeFilePath(filePath) before call. ' + filePath;
        };
    };
    return !this.isAbsoluteFilePath( filePath ) && !this.isRootRelativeFilePath( filePath );
};

/**
 * @param {string} filePath
 * @return {string}
 */
TinyPath.prototype.normalizeFilePath = function( filePath ){
    return filePath.split( '\\' ).join( '/' );
};

/**
 * Absolute path => Source root relative path
 * 
 * @param {string} filePath
 * @return {string}
 */
TinyPath.prototype.absoluteFilePathToSrcRootRelativeFilePath = function( filePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this._absolutePathOfSrcRoot ){
            throw 'absoluteDirectoryPathOfRoot is empty!';
        };
        if( !this.isAbsoluteFilePath( filePath ) ){
            throw filePath + ' is not a absolute path!';
        };
        if( this.normalizeFilePath( filePath ) !== filePath ){
            throw 'Use this.normalizeFilePath(filePath) before call. ' + filePath;
        };
    };
    return filePath.substr( this._absolutePathOfSrcRoot.length - 1 ); // -1 and leave the leading “/”.
};

/**
 * Source root relative path => Absolute path
 * 
 * @param {string} filePath
 * @return {string}
 */
TinyPath.prototype.rootRelativeFilePathToAbsoluteFilePath = function( filePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this._absolutePathOfSrcRoot ){
            throw 'absoluteDirectoryPathOfRoot is empty!';
        };
        if( !this.isRootRelativeFilePath( filePath ) ){
            throw filePath + ' is not a root relative path!';
        };
        if( this.normalizeFilePath( filePath ) !== filePath ){
            throw 'Use this.normalizeFilePath(filePath) before call. ' + filePath;
        };
    };
    return this._absolutePathOfSrcRoot + filePath.substr( 1 ); // There is a “/” at the beginning.
};

/**
 * @param {string} basePath
 * @param {string} relativeFilePath
 * @return {string}
 */
TinyPath.prototype.relativeFilePathToSrcRootRelativeFilePath = function( basePath, relativeFilePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this.isRootRelativeFilePath( basePath ) ){
            throw basePath + ' is not a root relative path!';
        };
        if( this.isRootRelativeFilePath( relativeFilePath ) || this.isAbsolutePath( relativeFilePath ) ){
            throw relativeFilePath + ' is not a relative path!';
        };
        if( this.normalizeFilePath( basePath ) !== basePath ){
            throw 'Use this.normalizeFilePath(filePath) before call. ' + basePath;
        };
        if( this.normalizeFilePath( relativeFilePath ) !== relativeFilePath ){
            throw 'Use this.normalizeFilePath(relativeFilePath) before call. ' + relativeFilePath;
        };
    };
    return this._relativePathToRootRelativePath( basePath, relativeFilePath );
};

/**
 * @param {string} basePath
 * @param {string} rootRelativeFilePath
 * @return {string} "": same file
 */
TinyPath.prototype.srcRootRelativeFilePathToRelativeFilePath = function( basePath, rootRelativeFilePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this.isRootRelativeFilePath( basePath ) ){
            throw basePath + ' is not a root relative path!';
        };
        if( !this.isRootRelativeFilePath( rootRelativeFilePath ) ){
            throw rootRelativeFilePath + ' is not a root relative path!';
        };
        if( this.normalizeFilePath( basePath ) !== basePath ){
            throw 'Use this.normalizeFilePath(filePath) before call. ' + basePath;
        };
        if( this.normalizeFilePath( rootRelativeFilePath ) !== rootRelativeFilePath ){
            throw 'Use this.normalizeFilePath(rootRelativeFilePath) before call. ' + rootRelativeFilePath;
        };
    };
    return this._rootRelativePathToRelativePath( basePath, rootRelativeFilePath );
};

/**
 * @param {string} basePath
 * @param {string} filePath
 * @return {string}
 */
TinyPath.prototype.toSrcRootRelativeFilePath = function( basePath, filePath ){
    return this.isRelativeFilePath( filePath )
               ? this.relativeFilePathToSrcRootRelativeFilePath( basePath, filePath ) :
           this.isAbsoluteFilePath( filePath )
               ? this.absoluteFilePathToSrcRootRelativeFilePath( filePath )
               : filePath;
};

/**----------------------------------------------------------------------------
 *   URL
 */

/**
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.urlToFileName = function( url ){
    return this.cleanURL( url ).split( '/' ).pop() || 'index.html';
};

/**
 * @param {string} url
 * @return {boolean}
 */
TinyPath.prototype.isAbsoluteURL = function( url ){
    return this.isNetworkPathReference( url ) || url.substr( 0, 7 ) === 'http://' || url.substr( 0, 8 ) === 'https://';
};

/**
 * @param {string} url
 * @return {boolean}
 */
TinyPath.prototype.isNetworkPathReference = function( url ){
    return url.substr( 0, 2 ) === '//';
};

/**
 * @param {string} url
 * @return {boolean}
 */
TinyPath.prototype.isRootRelativeURL = function( url ){
    return url.charAt( 0 ) === '/' && !this.isNetworkPathReference( url );
};

/**
 * @param {string} url
 * @return {boolean}
 */
TinyPath.prototype.isRelativeURL = function( url ){
    return !this.isAbsoluteURL( url ) && !this.isRootRelativeURL( url );
};

/**
 * remove "./", "index.html", ?searchParam=, #hash-fragment
 * 
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.cleanURL = function( url ){
    url = this.removeIndexHtml( url.split( '?' )[ 0 ].split( '#' )[ 0 ] );

    return 2 < url.length && url.substr( 0, 2 ) === './' ? url.substr( 2 ) : url;
};

/**
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.getSearchParam = function( url ){
    var hash = this.getHashFragment( url );

    url = hash ? url.split( hash )[ 0 ] : url;

    var searchParamIndex = url.indexOf( '?' );

    return searchParamIndex === -1 ? '' : url.substr( searchParamIndex );
};

/**
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.getHashFragment = function( url ){
    var hashIndex = url.indexOf( '#' );

    return hashIndex === -1 ? '' : url.substr( hashIndex );
};

/**
 * Absolute URL => Source root relative UEL
 * 
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.absoluteURLToRootRelativeURL = function( url ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this.isAbsoluteURL( url ) ){
            throw url + ' is not a absolute URL!';
        };
    };

    var len = this._urlOrigin.length - 1; // -1 and leave the leading “/”.

    if( url.indexOf( this._urlOrigin ) === 0 ){
        url = url.substr( len );
    } else if( this.isNetworkPathReference( this._urlOrigin ) ){
        if( url.indexOf( 'https:' + this._urlOrigin ) === 0 ){
            url = url.substring( 6, len );
        };
        if( url.indexOf( 'http:' + this._urlOrigin ) === 0 ){
            url = url.substring( 5, len );
        };
    };
    return url;
};


/**
 * Source root relative URL => Absolute URL
 * 
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.rootRelativeURLToAbsoluteURL = function( url ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this._urlOrigin ){
            throw 'urlOrigin is empty!';
        };
        if( !this.isRootRelativeURL( url ) ){
            throw url + ' is not a root relative URL!';
        };
    };
    return this._urlOrigin + this.cleanURL( url ).substr( 1 ) + this.getSearchParam( url ) + this.getHashFragment( url );
};

/**
 * @param {string} baseURL
 * @param {string} relativeURL
 * @return {string}
 */
TinyPath.prototype.relativeURLToRootRelativeURL = function( baseURL, relativeURL ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this.isRootRelativeURL( baseURL ) ){
            throw baseURL + ' is not a root relative URL!';
        };
        if( this.isRootRelativeURL( relativeURL ) || this.isAbsoluteURL( relativeURL ) ){
            throw relativeURL + ' is not a relative URL!';
        };
    };

    var rootRelativeURL = this.removeIndexHtml(
                              this._relativePathToRootRelativePath(
                                  this.supplementIndexHtml( this.cleanURL( baseURL ) ),
                                  this.supplementIndexHtml( this.cleanURL( relativeURL ) )
                              )
                          );

    return rootRelativeURL + this.getSearchParam( relativeURL ) + this.getHashFragment( relativeURL );
};

/**
 * @param {string} baseURL
 * @param {string} rootRelativeURL
 * @return {string} "": same URL, "./": index.html of same directory
 */
TinyPath.prototype.rootRelativeURLToRelativeURL = function( baseURL, rootRelativeURL ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this.isRootRelativeURL( baseURL ) ){
            throw baseURL + ' is not a root relative URL!';
        };
        if( !this.isRootRelativeURL( rootRelativeURL ) ){
            throw rootRelativeURL + ' is not a root relative URL!';
        };
    };

    var searchParam = this.getSearchParam( rootRelativeURL );
    var relativeURL = this._rootRelativePathToRelativePath(
                          this.supplementIndexHtml( this.cleanURL( baseURL ) ),
                          this.supplementIndexHtml( this.cleanURL( rootRelativeURL ) )
                      );
    var isIndex     = relativeURL === 'index.html';

    if( relativeURL && !isIndex ){
        relativeURL = this.removeIndexHtml( relativeURL );
    } else if( isIndex || searchParam ){
        relativeURL = './';
    };

    return relativeURL + searchParam + this.getHashFragment( rootRelativeURL );
};

/**
 * @param {string} baseURL
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.toRootRelativeURL = function( baseURL, url ){
    return this.isRelativeURL( url )
               ? this.relativeURLToRootRelativeURL( baseURL, url )
         : this.isAbsoluteURL( url )
               ? this.absoluteURLToRootRelativeURL( url )
               : url;
};

/**
 * @param {string} baseURL
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.toRelativeURL = function( baseURL, url ){
    var maybeRootRelativeURL = url;

    if( this.isAbsoluteURL( url ) ){
        maybeRootRelativeURL = this.absoluteURLToRootRelativeURL( url );

        if( maybeRootRelativeURL === url ){
            return url; // External URL
        };
        return this.rootRelativeURLToRelativeURL( baseURL, maybeRootRelativeURL );
    };

    return this.isRootRelativeURL( url )
               ? this.rootRelativeURLToRelativeURL( baseURL, url )
               : url;
};
