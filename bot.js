
var irc = require('./irc/irc.js');

var Trigger = { Command: 'Command', Match: 'Match' };

var config;
var plugins;

function say(to, from, msg) {
  bot.say(to, msg);
}

function loadConfig() {
  var cfg = null;
  try {
    cfg = require('./config.js');
  } catch (e) {
    console.log('Error loading config');
    console.log(e);
  }
  return cfg;
}

function loadPlugin(plugin, cfg) {
  var p = null;
  try {
    p = require('./plugins/' + plugin + '.js');
    if (cfg && typeof p.init === 'function') {
      p.init(cfg);
    }
  } catch(e) {
    console.log('Error loading ' + plugin);
    console.log(e);
  }
  return p;
}

function loadPlugins(config) {
  var plugins = [];
  var p;
  for (pname in config.plugins) {
    p = null;
    if (typeof config.plugins[pname] === 'boolean') {
      if (config.plugins[pname]) {
        p = loadPlugin(pname);
      }
    } else if (config.plugins[pname].active) {
      p = loadPlugin(pname, config.plugins[pname]);
    }
    if (p) plugins.push(p);
  }
  return plugins;
}

function handleMessage(from, to, text, msg) {
  for (n in config.blacklist) {
    if (n.toLowerCase() === from.toLowerCase()) return;
  }
  var ltext = text.toLowerCase();
  for (p in plugins) {
    var trigger = config.trigger + p.triggerText + ' ';
    if (p.trigger === Trigger.Command && ltext.startsWith(trigger)) {
      say(to, from, p.message(text));
    } else if (p.trigger === Trigger.Match && ltext.match(p.triggerText)) {
      say(to, from, p.message(text));
    }
  }
}

function reload() {
  var cfg = loadConfig();
  if (cfg) var plgns = loadPlugins(cfg);
  if (cfg) config = cfg;
  else console.log('Unable to reload config, using old one');
  if (plgns) plugins = plgns;
  else console.log('Unable to reload plugins');
}

reload();

var bot = new irc.Client(config.server, config.botName, {
  channels:config.channels,
  userName:config.userName,
  realName:config.realName
});

if (!config) process.exit(1);

bot.addListener('message', handleMessage);
bot.addListener('error', console.log);

process.on('SIGHUP', reload);
