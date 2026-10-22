declare class TinyPath {
    private _urlOrigin:string;
    private _absolutePathOfSrcRoot:string|undefined;

    constructor(urlOrigin:string, opt_absolutePathOfSrcRoot:string|undefined);

    isAbsolutePath(filePathOrURL:string):boolean;

    removeIndexHtml(filePath:string):string;
    supplementIndexHtml(url:string):string;

    filePathToFileName(filePath:string):string;
    isAbsoluteFilePath(filePath:string):boolean;
    isRootRelativeFilePath(filePath:string):boolean;
    isRelativeFilePath(filePath:string):boolean;
    normalizeFilePath(filePath:string):string;
    absoluteFilePathToSrcRootRelativeFilePath(filePath:string):string;
    rootRelativeFilePathToAbsoluteFilePath(filePath:string):string;
    relativeFilePathToSrcRootRelativeFilePath(basePath:string, relativeFilePath:string):string;
    srcRootRelativeFilePathToRelativeFilePath(basePath:string, rootRelativeFilePath:string):string;
    toSrcRootRelativeFilePath(basePath:string, filePath:string):string;

    urlToFileName(url:string):string;
    isAbsoluteURL(url:string):boolean;
    isNetworkPathReference(url:string):boolean;
    isRootRelativeURL(url:string):boolean;
    isRelativeURL(url:string):boolean;
    cleanURL(url:string):string;
    getSearchParam(url:string):string;
    getHashFragment(url:string):string;
    absoluteURLToRootRelativeURL(url:string):string;
    rootRelativeURLToAbsoluteURL(url:string):string;
    relativeURLToRootRelativeURL(baseURL:string, relativeURL:string):string;
    rootRelativeURLToRelativeURL(baseURL:string, rootRelativeURL:string):string;
    toRootRelativeURL(baseURL:string, url:string):string;
    toRelativeURL(baseURL:string, url:string):string;
}