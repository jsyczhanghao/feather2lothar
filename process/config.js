'use strict';

//任意类型转json
function json(obj, addSpace, space, _bspace){
    var tmp, space = space || '\t', _bspace = _bspace || '';

    if(obj.constructor == Object){
        tmp = [];

        for(var i in obj){
            tmp.push('"' + i + '": ' + json(obj[i], addSpace, space + '\t', space));
        }

        if(tmp.length){
            return "{" + (addSpace ? '\r\n' + space : '') + tmp.join(',' + (addSpace ? '\r\n' + space : ''), addSpace, space) + (addSpace ? '\r\n' + _bspace : '') + "}";
        }else{
            return "{}";
        }            
    }else if(obj.constructor == Array){
        tmp = [];

        obj.forEach(function(v){
            tmp.push(json(v, addSpace, space + '\t', space));
        });

        if(tmp.length){
            return "[" + (addSpace ? '\r\n' + space : '') + tmp.join(',' + (addSpace ? '\r\n' + space : ''), addSpace, space) + (addSpace ? '\r\n' + _bspace : '') + "]";
        }else{
            return "[]";
        }   
    }else if(obj.constructor == String){
        tmp = '"' + String(obj) + '"';
    }else{
        tmp = String(obj);
    }

    return tmp.replace(/[\r\n]+/g, '');
};

module.exports = function(files){
    feather.log.notice('revert config start ...');

    var ms = [];

    feather.util.map(files, function(subpath, file){
        if(file.modulename && ms.indexOf(file.modulename) == -1){
            ms.push(file.modulename);
        }
    });

    var deploys = feather.revertConfig.get('deploy') || {}, root = feather.project.getProjectPath();
    feather.revertConfig.del('deploy');

    if(feather.revertConfig.get('roadmap.domain')){
        feather.revertConfig.set('domain', feather.revertConfig.get('roadmap.domain'));
    }

    var match = [];

    feather.revertConfig.get('roadmap.path', []).forEach(function(item){
        var reg = item.reg;
        delete item.reg;
        match.push('lothar.match(' + reg + ', ' + json(item, true) + ');');
    });

    feather.revertConfig.del('roadmap');

    

    ms.forEach(function(m){
        var config = feather.revertConfig.get();
        var configFile = new feather.file(root + '/' + m + '/conf/conf.js');
        config.project.modulename = m;
        configFile.setContent('lothar.config.merge(' + json(config, true) + ');\r\n' + match.join('\r\n'));
        files[configFile.subpath] = configFile;

        feather.util.map(deploys, function(name, item){
            var filename = '/' + m + '/conf/deploy/' + name + '.js';
            var file = new feather.file(root + filename);
            file.setContent('module.exports = ' + json(item, true) + ';');
            files[filename] = file;
        });
    });

    var rewriteFile = files['/feather_rewrite.php'];

    if(rewriteFile){
        var content = rewriteFile.getContent();
        var reg = /['"]\S([^'"]+)\S['"]\s*=>\s*['"]([^'"]+)['"]/g;
        var rewrite, rewrites = {};

        while(rewrite = reg.exec(content)){
            var path = rewrite[2], url = rewrite[1];

            path = ('/' + path).replace(/^\/+/, '/');

            if(files[path]){
                var r = files[path].release.replace(/^\/+/, '');
                r = r.split('/');

                if(!rewrites[r[0]]){
                    rewrites[r[0]] = {};
                }

                rewrites[r[0]][url] = r.slice(1).join('/');
            }
        }

        for(var m in rewrites){
            var _ = new feather.file(root + '/' + m + '/conf/rewrite.js');
            _.setContent('module.exports = ' + json(rewrites[m], true) + ';');
            files[_.subpath] = _;
        }

        delete files['/feather_rewrite.php'];

    }

    feather.log.notice('revert config success!');
};