
// IMPORT THE AIRTABLE.JS PACKAGE
const Airtable = require('airtable');

/** THIS IS YOUR SERVERLESS FUNCTION */
exports.handler = function (event, context, callback) {
	//pull the required information from your environment variables, which can be set in the Netlify UI
	const { API_URL, API_CLIENT_ID, API_KEY } = process.env;

	// THIS FUNCTION FORMATS AND SENDS YOUR RESPONSE BACK TO YOUR FRONT-END
	const send = body => {
		callback(null, {
			statusCode: 200,
			body: JSON.stringify(body)
		});
	}

	// CONFIGURE YOUR AIRTABLE BASE CONNECTION
	Airtable.configure({
		endpointUrl: API_URL,
		apiKey: API_KEY
	});
	var base = Airtable.base(API_CLIENT_ID);

	var data = {};

	// Complete function
	function complete() {
		send(data);
	}

	// Start function
	function start() {
		getNextMeeting();
	}

	// Get leaders
	function getLeaders() {
		var leaders = new Array;
		base('Leaders').select({ sort: [{ field: "Created Time", direction: "asc" }] }).eachPage(function page(records, fetchNextPage) {
			records.forEach(function (record) {
				var name = record.get('Name');
				var classname = record.get('Class');
				var github = record.get('GitHub');
				var ranks = record.get('Ranks');
				var profilePic = record.get('Profile Picture')[0]['url'];
				leaders.push({ "name": name, "class": classname, "github": github, "ranks": ranks, "profilepic": profilePic });
			});
			fetchNextPage();
		}, function done(error) {
			console.log(error);
			data['leaders'] = leaders;
			complete();
		});
		//return leaders;
	}

	// Get resources
	function getResources() {
		var resources = new Array;
		base('Resources').select({ sort: [{ field: "Created Time", direction: "asc" }] }).eachPage(function page(records, fetchNextPage) {
			records.forEach(function (record) {
				var name = record.get('Name');
				var description = record.get('Description');
				var thumbnail = record.get('Thumbnail')[0]['url'];
				var link = record.get('Link');
				resources.push({ "name": name, "description": description.replace(/\xA0/g, ' '), "thumbnail": thumbnail, "link": link });
			});
			fetchNextPage();
		}, function done(error) {
			console.log(error);
			data['resources'] = resources;
			getLeaders();
		});
		//return resources;
	}

	// Get next meeting time and location
	function getNextMeeting() {
		var meetingInfo = {};
		base('Meeting').select({ maxRecords: 1, sort: [{ field: "Created Time", direction: "desc" }] }).eachPage(function page(records, fetchNextPage) {
			records.forEach(function (record) {
				var time = record.get('Meeting Time');
				var location = record.get('Location');
				var notes = record.get('Notes');
				meetingInfo = { "time": time, "location": location, "notes": notes };
			});
			fetchNextPage();
		}, function done(error) {
			console.log(error);
			data['nextMeeting'] = meetingInfo;
			getResources();
		});
		//return meetingInfo;
	}

	start();

}