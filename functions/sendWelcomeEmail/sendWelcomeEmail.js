const request = require('request');

exports.handler = function (event, context, callback) {

	var body = JSON.parse(event.body)
	var email = body.json.Email
	var name = body.json.Name
	var key = body.key

	request('https://maker.ifttt.com/trigger/send_welcome_email/with/key/' + key + '?value1=' + email + '&value2=' + name, function (error, response, body) {
  		console.error('error:', error);// Print the error if one occurred
  		console.log('statusCode:', response && response.statusCode);
  		console.log('body:', body);
	});

	callback(null, {
		statusCode: 200,
		body: "success"
	});

}