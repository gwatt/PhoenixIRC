
function calm(to, from, msg, send) {
  var num = Math.floor(Math.random() * 30) + 1;
  send(to, from, 'http://calmingmanatee.com/img/manatee' + num + '.jpg');
}

exports.name = 'Calm';
exports.desc = 'Links a picture of a manatee to calm you down';
exports.matches = {
  'calm down': {msg: calm, desc: 'Picture of a manatee'}
};
