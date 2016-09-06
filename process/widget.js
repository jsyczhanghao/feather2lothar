var RULES = [
    [/^([^:]+)?\:((?:[^\/]+\/)*)((?:(?!\.[^.]+).)+?)(\..+)?$/, function(_0, _1, _2, _3, _4){
        return (_1 ? (_1 + '/') : '') + _2 + _3 + (_4 ? _4 : ('/' + _3 + '.html'));
    }],

    [/^.+$/, function(all){
        return all.replace(new RegExp('\\.html$'), '') + '.html';
    }]
];

function getWidgetPath(path){
    RULES.forEach(function(rule){
        path = path.replace(rule[0], rule[1]);
    });

    return path.replace(/\/+/, '/').replace(/^\//, '').replace(/\.[^\.]+$/, '');
}

module.exports = function(files){
    feather.log.notice('revert widget start ...');

    feather.util.map(files, function(subpath, file){
        var content = file.getContent();

        if(file.isHtmlLike){
            content = content.replace(/\$this->component\(\s*['"]([^'"]+)['"]([^;]+);|<component(?: [\s\S]*?name=['"]([^'"]+)['"])?[^>]*>(?:([\s\S]*?)<\/component>)?/g, function(all, id, content, ID){
                id = id || ID;
                id = getWidgetPath(id);

                var sp = id.split('/'), namespace = sp[0];

                if(namespace == file.modulename){
                    namespace = '';
                    id = sp.slice(1).join('/');
                }else if(namespace == 'common'){
                    namespace = 'common:';
                    id = sp.slice(1).join('/');
                }else{
                    namespace = '';
                    id = sp.join('/');
                }

                id = namespace + id;

                if(content){
                    return '?>@widget(\'' + id + '\'' + 
                    content + '<?php ';
                }else{
                    return '@widget(\'' + id + '\')';
                }
            }).replace(/<\?php\s+\?>/g, '');
        }

        file.setContent(content);
    });

    feather.log.notice('revert widget success!');
};