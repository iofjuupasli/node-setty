var _ = require('underscore');
var nconf = require('nconf');
var util = require('util');
var path = require('path');
var fs = require('fs');

var setty = new Setty();
exports = module.exports = setty;

function Setty(){
  this.config = null;
}

Setty.prototype.configure = function(cfg){
  _.defaults(cfg, {
    profile: '.config',
    //Setty will check this environment variable before failing if profile file is not found
    profileEnv: 'SETTY_PROFILE',
    configFileName: 'config.json',
    settingsDir: null
  });
  this.config = cfg;

  if (!fs.existsSync(cfg.settingsDir)) {
    throw new Error('Make sure that settings directory exists.');
  }
  cfg.profileFilePath = path.join(cfg.settingsDir, cfg.profile);
  cfg.rootConfigPath = path.join(cfg.settingsDir, cfg.configFileName);

  if (!fs.existsSync(cfg.rootConfigPath)) {
    throw new Error(['Make sure that root config "', cfg.configFileName, '" exists in the following dir: ', cfg.settingsDir].join(''));
  }

  var envProfilePath = process.env[cfg.profileEnv];

  if (!fs.existsSync(cfg.profileFilePath) && !envProfilePath) {
    return;
  }

  cfg.profilePath = envProfilePath || fs.readFileSync(cfg.profileFilePath, 'utf8').trim();
  cfg.userConfigPath = path.join(cfg.settingsDir, cfg.profilePath, cfg.configFileName);

  if (!fs.existsSync(cfg.userConfigPath)) {
    var err = util.format('User config file does not exists at "%s". ' +
      'Make sure that profile file "%s" point to the user config. ', cfg.userConfigPath, cfg.profile);

    throw new Error(err);
  }
};

Setty.prototype.load = function(cfg){
  this.configure(cfg);

  nconf.reset();
  //Load environment variables
  //https://github.com/flatiron/nconf#env
  nconf.env();
  if (this.config.userConfigPath){
    nconf.file('user', this.config.userConfigPath);
  }
  nconf.file('default', this.config.rootConfigPath);
};

Setty.prototype.get = function(name){
  return nconf.get(name);
};
