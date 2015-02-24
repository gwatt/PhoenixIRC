var req = require('request');

function anagram(to, from, msg, send) {
  req.post({ url: 'http://www.sternestmeanings.com/say.json',
             form: { msg: msg }
           },
           function (error, response, body) {
             if (!error && response.statusCode === 200) {
               body = JSON.parse(body);
               if (toString.call(body) === "[object Array]") {
                 send(to, from, body[0]);
               } else {
                 send(to, from, '"' + msg + '" is an anagram for "' + body.message.response + '"');
               }
             } else {
               send(to, from, "No anagram for you!");
             }
           }
  );
}

exports.name = 'Anagram';
exports.desc = 'Returns an anagram of the given text, if it can find one';
exports.commands = {
  anagram: {msg: anagram, desc: 'Invokes the anagram command'}
};