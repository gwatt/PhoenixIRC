/*
 * @Author: 5thWall
 * @Date: 7/27/2014
 */

function ass(msg, to, from, send) {
  msg = msg.replace(/-(ass)\s/gi, " $1-");
  send(to, from, msg);
}

module.exports = function(Trigger) {
  return {
    name: 'Ass',
    desc: 'Turns $x-ass $y into $x ass-$y',
    message: ass,
    trigger: Trigger.Match,
    triggerText: /-ass\s/gi
  };
};
