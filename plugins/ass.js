/*
 * @Author: 5thWall
 * @Date: 7/27/2014
 */

function ass(to, from, msg, send) {
  msg = msg.replace(/-(ass)\s/gi, " $1-");
  send(to, from, msg);
}

exports.name = 'Ass';
exports.desc = 'Re-hyphenates asses (E.g., sweet-ass car -> sweet ass-car)';
exports.matches = {
  '-ass\\s': {msg: ass, desc: 'Dat ass'}
};
