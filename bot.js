
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
  var plugins = [];
  for (pname in config.plugins) {
    var p = loadPlugin(pname, config.plugins[pname]);
    if (p) plugins.push(p);
  }
  plugins.push({
    name: 'Help',
    desc: 'Show information about plugins',
    trigger: Trigger.Command,
    triggerText: 'help',
    message: help,
    active: true,
    permanent: true
  });
  plugins.push({
    name: 'Enable',
    desc: 'Enable disabled plugins',
    trigger: Trigger.Command,
    triggerText: 'enable',
    message: enable,
    active: true,
    permanent: true
  });
  plugins.push({
    name: 'Disable',
    desc: 'Disable enabled plugins',
    trigger: Trigger.Command,
    triggerText: 'disable',
    message: disable,
    active: true,
    permanent: true
  });
  plugins.push({
    name: 'Reload',
    desc: 'Reload disabled plugins',
    trigger: Trigger.Command,
    triggerText: 'reload',
    message: reload,
    active: true,
    permanent: true
  });
  return plugins;
}

function matches(p, text) {
  var match = false;
  if (!p.active) return match;
  var trigger = config.trigger + p.triggerText;
  if (p.trigger === Trigger.Command && text.split(/\s+/)[0] === trigger) {
    match = trigger.length + 1;
  } else if (p.trigger === Trigger.Match && text.match(p.triggerText)) {
    match = 0;
  }
  return match;
}

function handleMessage(from, to, text, msg) {
  for (n of config.blacklist) {
    if (n.toLowerCase() === from.toLowerCase()) return;
  }
  text = text.split(/\s+/).join(' ');
  var ltext = text.toLowerCase();
  for (p in plugins) {
    p = plugins[p];
    var m = matches(p, ltext);
    if (m !== false) {
      p.message(text.substring(m), to, from, say);
    }
  }
}

function authorized(name) {
  name = name.toLowerCase();
  for (n of config.admins) {
    if (name === n.toLowerCase()) return true;
  }
}

function _reload(_, to, from, send) {
  if (authorized(from)) reload();
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

function findPlugin(name) {
  name = name.toLowerCase();
  for (p of plugins) {
    if (p.name.toLowerCase() === name) return p;
  }
}

function help(name, to, from, send) {
  if (name) {
    var plugin = findPlugin(name);
    if (plugin) {
      send(to, from, plugin.name + ': ' + plugin.desc);
      if (plugin.trigger === Trigger.Command) {
        send(to, from, 'Activate with "' + config.trigger + p.triggerText + ' <text>"');
      } else if (plugin.trigger === Trigger.Match) {
        send(to, from, 'Activate with the text: "' + p.trigger + '"');
      }
    } else {
      send(to, from, "No plugin '" + name + "' found");
    }
  } else {
    var active = [], inactive = [];
    for (p of plugins) {
      if (p.active) active.push(p.name);
      else inactive.push(p.name);
    }
    send(to, from, active.length + ' active plugins: ' + active.join(', '));
    send(to, from, inactive.length + ' inactive plugins: ' + inactive.join(', '));
  }
}

function enable(name, to, from, send) {
  if (!authorized(from)) return;
  var p = findPlugin(name);
  if (p) {
    if (!p.active) {
      p.active = true;
      send(to, from, 'Activated ' + name);
    } else {
      send(to, from, name + ' was already active');
    }
  } else {
    send(to, from, 'No plugin: ' + name);
  }
}

function disable(name, to, from, send) {
  if (!authorized(from)) return;
  var p = findPlugin(name);
  if (p) {
    if (p.active && !p.permanent) {
      p.active = false;
      send(to, from, 'Deactivated ' + name);
    } else if (p.permanent) {
      send(to, from, 'Refusing to disable ' + name);
    } else {
      send(to, from, name + ' was already inactive');
    }
  } else {
    send(to, from, 'No plugin: ' + name);
  }
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
