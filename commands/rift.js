module.exports.run = async(client, message, args) => {
	const config = require("../json/config.json");
	const Discord = require("discord.js");
	
	var profiles = client.databases.get("profiles");

	var test = null;
	profiles.serialize(function() {
		profiles.get("SELECT * FROM Users WHERE userId = ?",[message.author.id], (err,row) => {
			test = row;
		}, function() {
			callback(test);
		});
	});

	console.log(test);
}

module.exports.config = {
	command: "rift",
	syntax: "rift",
	description: "rift"
}