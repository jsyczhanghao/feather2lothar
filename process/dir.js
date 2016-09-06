'use strict';

var Path = require('path');


module.exports = function(files){
    feather.log.notice('revert directorys start ...');

    var suffix = '.' + feather.revertConfig.get('template.suffix', 'html');
    var modulename = feather.revertConfig.get('project.modulename');

    var dirMaps = {
        'component': 'widget',
        'test/component': 'data/widget',
        'test/page': 'data/page',
        'test': 'data',
        'static': 'static',
        'page': 'page'
    };

    feather.util.map(files, function(subpath, file){
        if(subpath.indexOf('/static/') == 0 && subpath.indexOf('/mod/') > -1){
            if(subpath.indexOf('/static/' + modulename) == 0){
                file.release = subpath.replace('/static/' + modulename, '/' + modulename + '/components').replace('/mod/', '/');
                file.modulename = modulename;
                return;
            }else if(subpath.indexOf('/static/mod/') == 0){
                file.release = subpath.replace('/static/mod/', '/common/components/');
                file.modulename = 'common';
                return;
            }else{
                file.release = subpath.replace('/static/', '/main/components/').replace('/mod/', '/');
                file.modulename = 'main';
                return;
            }
        }

        for(var source in dirMaps){
            var target = dirMaps[source];

            if(subpath.indexOf('/' + source + '/' + modulename) == 0){
                file.release = subpath.replace('/' + source + '/' + modulename, '/' + modulename + '/' + target);
                file.modulename = modulename;
                return;
            }else if(subpath.indexOf('/' + source + '/') == 0){
                file.release = subpath.replace('/' + source + '/', '/main/' + target + '/');
                file.modulename = 'main';
                return;
            }
        }
    });

    feather.log.notice('revert directorys success!');
};