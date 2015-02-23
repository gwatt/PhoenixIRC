var req = require('request');

function anagram(text, to, from, send) {
  var resp;
  req.post({ url: 'http://www.sternestmeanings.com/say.json',
             form: { msg: text }
           },
           function (error, response, body) {
             if (!error && response.statusCode === 200) {
               body = JSON.parse(body);
               if (toString.call(body) === "[object Array]") {
                 send(to, from, body[0]);
               } else {
                 send(to, from, '"' + text + '" is an anagram for "' + body.message.response + '"');
               }
             } else {
               send(to, from, "No anagram for you!");
             }
           }
  );
}

module.exports = function(Trigger) {
  return {
    message: anagram,
    trigger: Trigger.Command,
    triggerText: 'anagram',
    name: 'Anagram',
    desc: 'Returns an anagram of the message text'
  };
};