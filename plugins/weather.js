var request = require('request');

//MESSAGE EVENT
function weather(to, from, msg, send) {
	location = msg.split(/\s+/).join('');
	request('http://api.openweathermap.org/data/2.5/weather?units=imperial&q=' + location,
		function(error, message, body) {
			var body = JSON.parse(body);
			var main = body.main;
			if(main===undefined) { return; }
			var temp = main.temp;
			var humid = main.humidity;
			var low = main.temp_min;
			var high = main.temp_max;
			location = location.split(',').join(', ');
			var statement = "The weather in " + location + " is " + temp + " degrees F. Humidity is " + 
			humid + ". The high is " + high + "F and the low is " + low + "F.";
			send(to, from, statement);
		});
}

exports.name = 'Weather';
exports.desc = 'Finds the weather at a location';

exports.commands = {
  weather: {msg: weather, desc: 'Finds the weather at a location'}
};
