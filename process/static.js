function replaceUrl(content, file, files){
    return content.replace(/\/?(static\/|component\/|(['"]):\/?)(?:([^\/'"]+)\/?)?([^'"\r\n\)\?]*)/g, function(all, type, quote, namespace, s){
        var ext = all.split('.').pop();

        if(IMAGE_FILE_EXTS.indexOf(ext) > -1){
            var imgFile = files[all];

            if(imgFile && imgFile.modulename != file.modulename){
                var newImageFile = feather.file.wrap(feather.project.getProjectPath() + '/' + file.modulename + '/' + imgFile.subpath);
                newImageFile.setContent(imgFile.getContent());
                newImageFile.release = newImageFile.subpath;
                files[newImageFile.subpath] = newImageFile;
                return newImageFile.subpath.replace(/^\/[^\/]+/, '');
            }
        }

        var type;

        if(type.indexOf(':') == 1){
            s = (namespace || '') + (s ? '/' + s : s);

            if(file.modulename == 'common'){
                return quote + s;
            }else{
                return quote + 'common:' + s;
            }
        }else if(type.indexOf('component') == 0){ 
            type = 'widget';
        }else{
            type = 'static';
        }



        if(namespace == file.modulename && file.modulename != 'main'){
            s =  '/' + type + '/' + s;
        }else if(namespace == 'common'){
            s = 'common:' + type + '/' + s;
        }else{
            s = '/' + type + '/' + namespace + '/' + s;
        }

        return s.replace(/\/?static\/mod\//, '');
    });
}

var IMAGE_FILE_EXTS = [
    'svg', 'tif', 'tiff', 'wbmp',
    'png', 'bmp', 'fax', 'gif',
    'ico', 'jfif', 'jpe', 'jpeg',
    'jpg', 'woff', 'cur', 'webp',
    'swf', 'ttf', 'eot', 'woff2'
];
var IMAGE_REG = new RegExp('([\'"])([^\'"]+?\\.(?:' + IMAGE_FILE_EXTS.join('|') + '))', 'ig');

function replaceJsUrl(content, file, files){
    var REG = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(\/\/[^\r\n\f]+|\/\*[\s\S]*?(?:\*\/|$))|require\.async\(([\s\S]+?)(?=,\s*function\(|\))|require\(([^\)]+)\)|__(inline|uri)\(([^\)]+)\)/g;
    
    return content = content.replace(REG, function(all, comment, asyncs, sync, eType, inline){
        if(comment && comment.indexOf('@require') > -1){
            return replaceUrl(comment, file);
        }else if(asyncs){
            return 'require.async(' + replaceUrl(asyncs, file);
        }else if(sync){
            return 'require(' + replaceUrl(sync, file) + ')';
        }else if(eType){
            return '__' + eType + '(' + replaceUrl(inline, file, files) + ')';
        }

        return all;
    });
}

function replaceCssUrl(content, file, files){
    var REG = /(url|src)\(['"]?([\s\S]+?)(\?.*?)?['"]?\)/g;

    return content.replace(REG, function(all, type, url, query){
        return type + '("' + replaceUrl(url, file, files) + (query || '') + '")';
    });
}   

module.exports = function(files){
    feather.log.notice('revert static start ...');

    feather.util.map(files, function(subpath, file){
        var content = file.getContent();

        if(file.isHtmlLike){
            content = content.replace(/<(img|embed|audio|video|link|object|source|script)( [^>]+)>/g, function(all, type, content){
                return '<' + type + replaceUrl(content, file, files) + '>';
            }).replace(/(<script[^>]*>)([\s\S]+?)(<\/script>)|(<style[^>]*>)([\s\S]+?)(<\/style>)/g, function(all, scriptTagStart, script, scriptTagClose, styleTagStart, style, styleTagClose){
                if(script){
                    return scriptTagStart + replaceJsUrl(script, file, files) + scriptTagClose;
                }else{
                    return styleTagStart + replaceCssUrl(style, file, files) + styleTagClose;
                }
            });
        }else if(file.isJsLike){
            content = replaceJsUrl(content, file, files);
        }else if(file.isCssLike){
            content = replaceCssUrl(content, file, files);
        }

        file.setContent(content

            );
    });

    feather.log.notice('revert static success!');
};