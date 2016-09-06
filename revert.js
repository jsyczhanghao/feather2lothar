global.feather = require('fis'), path = require('path');

module.exports = function(source, target){
    var configFile = source + '/feather_conf.js';

    if(!feather.util.exists(configFile)){
        feather.log.on.error('[' + source + '] is not a valid feather\'s project!');
    }

    var content = feather.util.read(configFile);
    content = content.replace(/(?:feather|fis)\.config/g, 'feather.revertConfig');
    content = content.replace(/require\(/, ';return;require(');
    content = '(function(){feather.revertConfig=new feather.config.Config;feather.revertConfig.set("roadmap", {path: []});' + content + ';})()';
    eval(content);

    if(feather.revertConfig.get('project.modulename') == ''){
        feather.revertConfig.set('project.modulename', 'common');
    }

    feather.project.setProjectRoot(source);

    var files = feather.project.getSource();

    feather.log.notice('revert start ...');

    delete files['/' + path.basename(configFile)];
    
    require('./process/dir.js')(files);
    require('./process/widget.js')(files);
    require('./process/static.js')(files);
    require('./process/config.js')(files);

    feather.util.map(files, function(subpath, file){
        feather.util.write(target + file.release, file.getContent());
    });

    feather.log.notice('revert success!');
};