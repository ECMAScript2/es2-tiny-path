goog.provide( 'TinyPath' );
goog.provide( 'TinyPath.DEFINE.DEBUG' );

/**
 * @constructor
 * @param {string} urlOrigin http://example.com or https://example.com or //example.com
 * @param {string=} opt_absolutePathOfRoot No need to set this parameter if you only want to convert URLs
 */
TinyPath = function( urlOrigin, opt_absolutePathOfRoot ){
    // "https://example.com/"
    this._urlOrigin = urlOrigin +
        urlOrigin.charAt( urlOrigin.length - 1 ) === '/' ? '' : '/';

    if( opt_absolutePathOfRoot ){
        opt_absolutePathOfRoot = this.normalizeFilePath( opt_absolutePathOfRoot );

        // C:/User/xxx/xxx/
        this._absolutePathOfRoot = opt_absolutePathOfRoot +
            opt_absolutePathOfRoot.charAt( opt_absolutePathOfRoot.length - 1 ) === '/' ? '' : '/';
    };
};

/**
 * @private
 * @define {boolean} */
TinyPath.DEFINE.DEBUG = goog.define( 'TinyPath.DEFINE.DEBUG' , false );

/**----------------------------------------------------------------------------
 *   Common
 */

/**
 * @param {string} filePathOrURL
 * @return {boolean}
 */
TinyPath.prototype.isAbsolutePath = function( filePathOrURL ){
    if( this._absolutePathOfRoot ){
        return this.isAbsoluteFilePath( filePathOrURL ) || this.isAbsoluteURL( filePathOrURL );
    };
    return this.isAbsoluteURL( filePathOrURL );
};

/**
 * @param {string} filePathOrURL
 * @return {boolean}
 */
TinyPath.prototype.isRootRelativePath = function( filePathOrURL ){
    return filePathOrURL.charAt( 0 ) === '/' && this.isNetworkPathReference( filePathOrURL );
};

/**----------------------------------------------------------------------------
 *   Convert
 */

/**
 * @param {string} filePath
 * @return {string}
 */
TinyPath.prototype.filePathToURL = function( filePath ){
    var rootRelativeURL = filePath.split( 'index.html' );

    // "/index.html" => ["/", ""] => "/"
    // "/index.html/index.html" => ["/", "/", ""] => "/index.html/"
    if( !rootRelativeURL[ rootRelativeURL.length - 1 ] ){
        rootRelativeURL.pop();
    };
    return rootRelativeURL.join( 'index.html' );
};

/**
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.urlToFilePath = function( url ){
    if( TinyPath.DEFINE.DEBUG ){
        if( this.isAbsoluteURL( url ) ){
            throw url + ' is not a root relative path or relative path!';
        };
    };

    var urlElements = url.split( '#' )[ 0 ].split( '/' );

    // "/" => ["", ""] => "/index.html"
    // "/index.html/" => ["", "index.html", ""] => "/index.html/index.html"
    if( !urlElements[ urlElements.length - 1 ] ){
        urlElements[ urlElements.length - 1 ] = 'index.html';
    };
    return urlElements.join( '/' );
};

/**----------------------------------------------------------------------------
 *   File Path
 */

/**
 * @param {string} filePath
 * @return {string}
 */
TinyPath.prototype.normalizeFilePath = function( filePath ){
    return filePath.split( '\\' ).join( '/' );
};

/**
 * @param {string} filePath
 * @return {boolean}
 */
TinyPath.prototype.isAbsoluteFilePath = function( filePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this._absolutePathOfRoot ){
            throw 'absoluteDirectoryPathOfRoot is empty!';
        };
    };
    return filePath.indexOf( this._absolutePathOfRoot ) === 0;
};

/**
 * @param {string} filePath
 * @return {boolean}
 */
TinyPath.prototype.isRelativeFilePath = function( filePath ){
    return !this.isAbsoluteFilePath( filePath ) && !this.isRootRelativePath( filePath );
};

/**
 * Absolute path => Source root relative path
 * 
 * @param {string} filePath
 * @return {string}
 */
TinyPath.prototype.absoluteFilePathToSrcRootRelativeFilePath = function( filePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this._absolutePathOfRoot ){
            throw 'absoluteDirectoryPathOfRoot is empty!';
        };
        if( !this.isAbsoluteFilePath( filePath ) ){
            throw filePath + ' is not a absolute path!';
        };
    };
    return this.normalizeFilePath( filePath ).substr( this._absolutePathOfRoot.length - 1 ); // -1 で "/" を残す
};

/**
 * Source root relative path => Absolute path
 * 
 * @param {string} filePath
 * @return {string}
 */
TinyPath.prototype.rootRelativeFilePathToAbsoluteFilePath = function( filePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this._absolutePathOfRoot ){
            throw 'absoluteDirectoryPathOfRoot is empty!';
        };
        if( !this.isRootRelativePath( filePath ) ){
            throw filePath + ' is not a root relative path!';
        };
    };

    return this._absolutePathOfRoot + filePath.substr( 1 ); // 頭に / がいる
};

/**
 * @param {string} basePath
 * @param {string} relativeFilePath
 * @return {string}
 */
TinyPath.prototype.relativeFilePathToSrcRootRelativeFilePath = function( basePath, relativeFilePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this.isRootRelativePath( basePath ) ){
            throw basePath + ' is not a root relative path!';
        };
        if( this.isRootRelativePath( relativeFilePath ) || this.isAbsolutePath( relativeFilePath ) ){
            throw relativeFilePath + ' is not a relative path!';
        };
    };

    var basePathElements = basePath.split( '/' );
    basePathElements.pop();
    basePathElements[ 0 ] === '' && basePathElements.shift();

    if( relativeFilePath.substr( 0, 2 ) === './' ){
        relativeFilePath = relativeFilePath.substr( 2 );
    };

    // 相対リンク
    while( relativeFilePath.substr( 0, 3 ) === '../' ){
        relativeFilePath = relativeFilePath.substr( 3 );
        --basePathElements.length;
    };
    return basePathElements.join( '/' ) + '/' + relativeFilePath;
};

/**
 * @param {string} basePath
 * @param {string} rootRelativeFilePath
 * @return {string}
 */
TinyPath.prototype.srcRootRelativeFilePathToRelativeFilePath = function( basePath, rootRelativeFilePath ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this.isRootRelativePath( basePath ) ){
            throw basePath + ' is not a root relative path!';
        };
        if( !this.isRootRelativePath( rootRelativeFilePath ) ){
            throw rootRelativeFilePath + ' is not a root relative path!';
        };
    };

    var link = [], i = 0, skipCompare = false,
        basePathElements, baseName,
        rootRelativeFilePathElements, targetName,
        depth, l;

    basePathElements = basePath.split( '/' );
    baseName = basePathElements.pop();

    if( basePath === rootRelativeFilePath ){
        return baseName;
    };

    rootRelativeFilePathElements = rootRelativeFilePath.split( '/' );
    targetName = rootRelativeFilePathElements.pop();

    for( depth = basePathElements.length, l = Math.max( rootRelativeFilePathElements.length, depth ); i < l; ++i ){
        if( skipCompare || rootRelativeFilePathElements[ i ] !== basePathElements[ i ] ){
            if( i < depth ){
                link.unshift( '..' );
            };
            if( rootRelativeFilePathElements[ i ] ){
                link.push( rootRelativeFilePathElements[ i ] );
            };
            skipCompare = true;
        };
    };
    if( skipCompare || baseName !== targetName ){
        link.push( targetName );
    };
    return link.join( '/' );
};

/**
 * @param {string} basePath
 * @param {string} filePath
 * @return {string}
 */
TinyPath.prototype.toSrcRootRelativeFilePath = function( basePath, filePath ){
    return this.isRelativeFilePath( filePath ) ? this.relativeFilePathToSrcRootRelativeFilePath( basePath, filePath ) : filePath;
};

/**----------------------------------------------------------------------------
 *   URL
 */

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
TinyPath.prototype.isRelativeURL = function( url ){
    return !this.isAbsoluteURL( url ) && !this.isRootRelativePath( url );
};

/**
 * Absolute path => Source root relative path
 * 
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.absoluteURLToRootRelativeURL = function( url ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this.isAbsoluteURL( url ) ){
            throw url + ' is not a absolute path!';
        };
        if( this.isRootRelativePath( url ) ){
            throw url + ' is a root relative path!';
        };
    };

    var len = this._urlOrigin.length - 1;

    if( url.indexOf( this._urlOrigin ) === 0 ){
        url = url.substr( len ); // -1 で "/" を残す
    } else if( this.isNetworkPathReference( this._urlOrigin ) ){
        if( url.indexOf( 'https:' + this._urlOrigin ) === 0 ){
            url = url.substring( 6, len );
        };
        if( url.indexOf( 'http:' + this._urlOrigin ) === 0 ){
            url = url.substring( 5, len );
        };
    };
    return url; // External Sites
};

/**
 * @param {string} basePath
 * @param {string} relativeURL
 * @return {string}
 */
TinyPath.prototype.relativeURLToRootRelativeURL = function( basePath, relativeURL ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this.isRootRelativePath( basePath ) ){
            throw basePath + ' is not a root relative path!';
        };
        if( this.isRootRelativePath( relativeURL ) || this.isAbsoluteURL( relativeURL ) ){
            throw relativeURL + ' is not a relative path!';
        };
    };

    var targetHash      = relativeURL.substr( relativeURL.indexOf( '#' ) );
    var rootRelativeURL = this.filePathToURL(
                              this.relativeFilePathToSrcRootRelativeFilePath(
                                  this.urlToFilePath( basePath ),
                                  this.urlToFilePath( relativeURL )
                              )
                          );

    if( targetHash ){
        rootRelativeURL += targetHash;
    };
    return rootRelativeURL;
};

/**
 * @param {string} basePath
 * @param {string} rootRelativeURL
 * @return {string}
 */
TinyPath.prototype.rootRelativeURLToRelativeURL = function( basePath, rootRelativeURL ){
    if( TinyPath.DEFINE.DEBUG ){
        if( !this.isRootRelativePath( basePath ) ){
            throw basePath + ' is not a root relative path!';
        };
        if( !this.isRootRelativePath( rootRelativeURL ) ){
            throw rootRelativeURL + ' is not a root relative path!';
        };
    };

    var targetHash  = rootRelativeURL.substr( rootRelativeURL.indexOf( '#' ) );
    var relativeURL = this.filePathToURL(
                          this.srcRootRelativeFilePathToRelativeFilePath(
                              this.urlToFilePath( basePath ),
                              this.urlToFilePath( rootRelativeURL )
                          )
                      );

    if( targetHash ){
        relativeURL += targetHash;
    };
    return relativeURL ? relativeURL : './';
};

/**
 * @param {string} basePath
 * @param {string} url
 * @return {string}
 */
TinyPath.prototype.toRootRelativeURL = function( basePath, url ){
    return this.isRelativeURL( url )
               ? this.relativeURLToRootRelativeURL( basePath, url )
         : this.isAbsoluteURL( url )
               ? this.absoluteURLToRootRelativeURL( url )
               : url;
};
