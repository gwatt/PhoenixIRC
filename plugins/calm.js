
function calm(msg, to, from, send) {
  var num = Match.floor(Math.random() * 30) + 1;
  send(to, from, 'http://calmingmanatee.com/img/manatee' + num + '.jpg');
}

module.exports = function(Trigger) {
  return {
    name: 'Calm',
    desc: 'Links a picture of a calming manatee',
    message: calm,
    trigger: Trigger.Match,
    triggerText: /calm down/i
  };
};
