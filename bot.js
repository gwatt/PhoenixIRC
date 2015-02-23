
var irc = require('./irc/irc.js');

var Trigger = { Command: 'Command', Match: 'Match' };

var config;
var plugins;

function load(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

function say(to, from, msg) {
  bot.say(to, msg);
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
    p = load('./plugins/' + plugin)(Trigger);
    if (typeof cfg === 'boolean') {
      p.active = cfg;
    } else {
      for (k in Object.keys(cfg)) {
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
  var plugins = [];
  for (pname in config.plugins) {
    var p = loadPlugin(pname, config.plugins[pname]);
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
  if (cfg) {
    config = cfg;
    console.log('Loaded configs');
  }
  else console.log('Unable to reload config, using old one');
  if (plgns) {
    plugins = plgns;
    console.log('Loaded plugins');
  }
  else console.log('Unable to reload plugins');
}

reload();
if (!config) process.exit(1);

var bot = new irc.Client(config.server, config.botName, {
  channels:config.channels,
  userName:config.userName,
  realName:config.realName
});

bot.addListener('message', handleMessage);
bot.addListener('error', console.log);

process.on('SIGHUP', reload);
