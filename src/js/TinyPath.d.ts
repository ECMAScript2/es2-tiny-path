declare class TinyPath {
    private _urlOrigin:string;
    private _absolutePathOfSrcRoot:string|undefined;

    constructor(urlOrigin:string, opt_absolutePathOfSrcRoot:string|undefined);

    isAbsolutePath(filePathOrURL:string):boolean;

    filePathToURL(filePath:string):string;
    urlToFilePath(url:string):string;

    isAbsoluteFilePath(filePath:string):boolean;
    isRootRelativeFilePath(filePath:string):boolean;
    isRelativeFilePath(filePath:string):boolean;
    normalizeFilePath(filePath:string):string;
    absoluteFilePathToSrcRootRelativeFilePath(filePath:string):string;
    rootRelativeFilePathToAbsoluteFilePath(filePath:string):string;
    relativeFilePathToSrcRootRelativeFilePath(basePath:string, relativeFilePath:string):string;
    srcRootRelativeFilePathToRelativeFilePath(basePath:string, rootRelativeFilePath:string):string;
    toSrcRootRelativeFilePath(basePath:string, filePath:string):string;


    isAbsoluteURL(url:string):boolean;
    isNetworkPathReference(url:string):boolean;
    isRootRelativeURL(url:string):boolean;
    isRelativeURL(url:string):boolean;
    absoluteURLToRootRelativeURL(url:string):string;
    rootRelativeURLToAbsoluteURL(url:string):string;
    relativeURLToRootRelativeURL(basePath:string, relativeURL:string):string;
    rootRelativeURLToRelativeURL(basePath:string, rootRelativeURL:string):string;
    toRootRelativeURL(basePath:string, url:string):string;
    toRelativeURL(basePath:string, url:string):string;
}