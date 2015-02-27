var attacks = {
		"slap":"slaps",
		"stab":"stabs",
		"kick":"kicks",
		"eat":"eats",
		"lick":"licks",
		"rape":"rapes",
		"paint":"paints",
		"inspect":"inspects",
		"fondle":"fondles",
		"punch":"punches",
		"smack":"smacks",
		"masturbate":"masturbates",
		"scratch":"scratches",
		"comfort":"comforts",
		"pat":"pats",
		"pet":"pets",
		"lynch":"lynches",
		"suck":"sucks",
		"hug":"hugs",
		"kiss":"kisses",
		"murder":"murders"
};

function makeAttack(action) {
  return function(to, from, msg, send) {
    send.action(to, from, attacks[action] + ' ' + msg);
  }
}
var attackFuncs = {};
for (action in attacks) {
  attackFuncs[action] = {
    msg: makeAttack(action),
    desc: attacks[action] + ' target'
  };
}

attackFuncs.random = {
  msg: function(to, from, msg, send) {
    actions = Object.keys(attacks);
    attack = attacks[actions[Math.floor(Math.random() * actions.length)]];
    send.action(to, from, attack + ' ' + msg); },
  desc: 'Picks a random attack'
}

exports.name = 'Attack';
exports.desc = 'Assaults a target with assorted harassments';
exports.commands = attackFuncs;
