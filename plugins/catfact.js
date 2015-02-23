var request = require('request');

//MESSAGE EVENT
function catfact(msg, to, from, send){
  request.get('http://catfacts-api.appspot.com/api/facts', function(error,response,body) {
    var fact = JSON.parse(body).facts[0];
    send(to, from, fact);
  });
}

module.exports = function(Trigger) {
  return {
    name: 'CatFact',
    desc: 'Shows facts about cats',
    message: catfact,
    trigger: Trigger.Command,
    triggerText: 'catfact'
  };
};
