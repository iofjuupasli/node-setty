var util = require('util');
var path = require('path');
var fs = require('fs');

var nconf = require('nconf');
var depd = require('depd')('setty');

function Setty(cfg) {
    nconf.reset();
    nconf.env();
    var settingsDir = cfg.settingsDir || path.join(process.cwd(), './config/settings');
    fs.accessSync(settingsDir);
    var profile = process.env[cfg.profileEnv || 'SETTY_PROFILE'];
    if (!profile) {
        try {
            profile = fs.readFileSync(path.join(settingsDir, cfg.profile || '.config'), 'utf8').trim();
        } catch (e) {}
    }
    var configFileName = cfg.configFileName || 'config.json';
    if (profile) {
        var userConfigPath = path.join(settingsDir, profile, configFileName);
        fs.accessSync(userConfigPath);
        nconf.file('user', userConfigPath);
    } else if (cfg.strict) {
        throw new Error('user config required but not found');
    }
    var defaultConfigPath = path.join(settingsDir, configFileName);
    nconf.file('default', defaultConfigPath);
}

module.exports = Setty;
module.exports.get = nconf.get.bind(nconf);
module.exports.load = depd.function(Setty, 'load');
