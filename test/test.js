/*jshint mocha:true*/
var assert = require('assert');
var setty = require('..');
var path = require('path');

describe('Setty', function () {
    it('should load and merge user and default settings', function () {
        setty({
            profile: '.config',
            configFileName: 'config.json',
            settingsDir: path.join(__dirname, 'settings')
        });

        assert.equal(setty.get('connection'), "Andrew's connection");
    });

    it('throw an error if settingsDir is not specified or does not exists', function () {
        assert.throws(setty);
    });

    it('throw an error if root config file does not exists', function () {
        assert.throws(setty.bind(null, {
            configFileName: 'not-exists.json',
            settingsDir: path.join(__dirname, 'settings')
        }));
    });

    it('should load profile from environment variable', function () {
        var envKey = 'SETTY_PROFILE1';
        process.env[envKey] = 'andrew';
        setty({
            profileEnv: 'SETTY_PROFILE1',
            profile: '.not-exists',
            configFileName: 'config.json',
            settingsDir: path.join(__dirname, 'settings')
        });

        assert.equal(setty.get('connection'), "Andrew's connection");
        process.env[envKey] = undefined;
    });

    it('should use only defaults if profile not specified', function () {
        setty({
            settingsDir: path.join(__dirname, 'settings'),
            profile: '.not-exists'
        });
        assert.equal(setty.get('connection'), 'Default');
    });

    it('should throw in strict if profile config not exists', function () {
        assert.throws(setty.bind(null, {
            settingsDir: path.join(__dirname, 'settings'),
            profile: '.not-exists',
            strict: true
        }));
    });

    it('should works with deprecated method', function () {
        setty.load({
            profile: '.config',
            configFileName: 'config.json',
            settingsDir: path.join(__dirname, 'settings')
        });

        assert.equal(setty.get('connection'), "Andrew's connection");
    });
});
