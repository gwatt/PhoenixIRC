
var irc = require('./irc/irc.js');

module.config = {};
module.plugins = {};

function load(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

function send(to, from, msg) {
  if (module.config.botName === to) bot.say(from, msg);
  else bot.say(to, msg);
}

function loadConfig() {
  var cfg = null;
  try {
    cfg = load('./config');
  } catch (e) {
    console.log('Error loading config');
    console.log(e);
  }
  return cfg;
}

function loadPlugin(plugin, cfg) {
  var p = null;
  try {
    p = load('./plugins/' + plugin);
    if (typeof cfg === 'boolean') {
      p.active = cfg;
    } else {
      for (k in cfg) {
        p[k] = cfg[k];
      }
    }
  } catch(e) {
    console.log('Error loading ' + plugin);
    console.log(e);
  }
  return p;
}

function loadPlugins(config) {
  var plugins = {};
  for (pname of config.superPlugins) {
    var p = loadPlugin(pname)(module);
    console.log(p);
    if (p) {
      p.active = true;
      p.permanent = true;
      plugins[pname] = p;
    }
  }
  for (pname in config.plugins) {
    var p = loadPlugin(pname, config.plugins[pname]);
    if (p) {
      if (p.name && p.desc) plugins[pname] = p;
      else console.log('Not loading', pname);
    }
  }
  return plugins;
}

function handleMessage(from, to, text, msg) {
  for (n of module.config.blacklist) {
    if (n.toLowerCase() === from.toLowerCase()) return;
  }
  var words = text.split(/\s+/).filter(function (str) { return str.length > 0; });
  var lwords = words.map(function (str) { return str.toLowerCase(); });
  for (p in module.plugins) {
    p = module.plugins[p];
    for (cmd in p.commands) {
      if (module.config.trigger + cmd.toLowerCase() === lwords[0]) {
        p.commands[cmd].msg(to, from, words.slice(1).join(' '), send);
        return;
      }
    }
    for (m in p.matches) {
      if (text.match(RegExp(m, 'gi'))) {
        p.matches[m].msg(to, from, text, send);
        return;
      }
    }
  }
}

function reload() {
  var cfg = loadConfig();
  if (cfg) var plgns = loadPlugins(cfg);
  if (cfg) {
    module.config = cfg;
    console.log('Loaded configs');
  }
  else console.log('Unable to reload config, using old one');
  if (plgns) {
    module.plugins = plgns;
    console.log('Loaded plugins');
    console.log(module.plugins);
  }
  else console.log('Unable to reload plugins');
}

module.reload = reload;
module.exports.module = module;

reload();
if (!module.config) process.exit(1);

var bot = new irc.Client(module.config.server, module.config.botName, {
  channels:module.config.channels,
  userName:module.config.userName,
  realName:module.config.realName
});

bot.addListener('message', handleMessage);
bot.addListener('error', console.log);

process.on('SIGHUP', reload);
