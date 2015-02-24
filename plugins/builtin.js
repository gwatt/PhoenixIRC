
var bot;

function authorized(name) {
  for (a of bot.config.admins) if (a.toLowerCase() === name.toLowerCase()) return true;
}

function help(to, from, msg, send) {
  var words = msg.toLowerCase().split(/\s+/);
  var pkg = bot.plugins[words[0]];
  var cmd = words[1];
  if (msg.length === 0) {
    var active = [], inactive = [];
    for (p in bot.plugins) {
      p = bot.plugins[p];
      if (p.active) active.push(p);
      else inactive.push(p);
    }
    send(to, from, 'There are ' + active.length + ' active plugins: ' + active.map(function(p) { return p.name; }).join(', '));
    send(to, from, 'There are ' + inactive.length + ' inactive plugins: ' + inactive.map(function(p) { return p.name; }).join(', '));
  } else if (words.length === 1) {
    if (pkg) {
      send(to, from, pkg.desc);
      cmds = Object.keys(p.commands);
      if (p.commands) {
        cmds = Object.keys(p.commands);
        send(to, from, p.name + ' has ' + cmds.length + ' commands: ' + cmds.join(', '));
      }
      if (p.matches) {
        matches = Object.keys(p.matches);
        send(to, from, p.name + ' has ' + matches.length + ' text triggers: ' + matches.join(', '));
      }
    }
    else send(to, from, "No plugin: '" + words[0] + "'");
  } else if (words.length === 2) {
    if (pkg && pkg.commands[cmd]) send(to, from, pkg.commands[cmd].desc);
    else send(to, from, "No help found for '" + msg + "'");
  } else send(to, from, "No help for '" + msg + "'");
}

function disable(to, from, msg, send) {
  if (!authorized(from)) return;
  msg = msg.toLowerCase().split(/\s+/);
  for (m of msg) {
    p = bot.plugins[m];
    if (p) {
      if (p.permanent) send(to, from, 'Refusing to disable ' + p.name);
      else if (p.active) {
        p.active = false;
        send(to, from, 'Disabled ' + p.name);
      } else send(to, from, p.name + ' already disabled')
    } else send(to, from, m + ' not found');
  }
}

function enable(to, from, msg, send) {
  if (!authorized(from)) return;
  msg = msg.toLowerCase().split(/\s+/);
  for (m of msg) {
    p = bot.plugins[m];
    if (p) {
      if (!p.active) {
        p.active = true;
        send(to, from, 'Enabled ', p.name);
      } else send(to, from, p.name + ' already enabled');
    } else send(to, from, p.name + ' not found');
  }
}

module.exports = function(_bot) {
  bot = _bot;
  return {
    name: "Builtin",
    desc: "Builtin plugins that should always be loaded and active.",
    commands: {
      help: {msg: help, desc: 'Displays information about plugins'},
      enable: {msg: enable, desc: 'Enables disabled plugins'},
      disable: {msg: disable, desc: 'Disables enabled plugins'},
      reload: {msg: bot.reload, desc: 'Reloads all plugins and some configuration (Name/Channel/Server is unchanged)'}
    }
  };
};
