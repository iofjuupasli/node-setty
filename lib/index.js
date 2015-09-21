var path = require('path');
var fs = require('fs');

var nconf = require('nconf');
var depd = require('depd')('setty');

function getSettingsDir(cfg) {
    var settingsDir = cfg.settingsDir ||
        path.join(process.cwd(), './config/settings');
    if (!fs.existsSync(settingsDir)) {
        throw new Error('setty directory not found: ' + settingsDir);
    }
    return settingsDir;
}

function getProfileName(cfg, settingsDir) {
    var profile = process.env[cfg.profileEnv || 'SETTY_PROFILE'];
    if (!profile) {
        try {
            profile = fs.readFileSync(
                path.join(settingsDir, cfg.profile || '.config'), 'utf8'
            ).trim();
        } catch (e) {}
    }
    return profile;
}

function importProfileConfig(settingsDir, profile, configFileName) {
    var userConfigPath = path.join(settingsDir, profile, configFileName);
    if (!fs.existsSync(userConfigPath)) {
        throw new Error('setty config not found: ' + userConfigPath);
    }
    nconf.file('user', userConfigPath);
}

function importDefaultConfig(settingsDir, configFileName) {
    var defaultConfigPath = path.join(settingsDir, configFileName);
    nconf.file('default', defaultConfigPath);
}

function Setty(cfg) {
    nconf.reset();
    nconf.env();
    var settingsDir = getSettingsDir(cfg);
    var profile = getProfileName(cfg, settingsDir);
    var configFileName = cfg.configFileName || 'config.json';
    if (profile) {
        importProfileConfig(settingsDir, profile, configFileName);
    } else if (cfg.strict) {
        throw new Error('user config required but not found');
    }
    importDefaultConfig(settingsDir, configFileName);
}

module.exports = Setty;
module.exports.get = nconf.get.bind(nconf);
module.exports.load = depd.function(Setty, 'load');
