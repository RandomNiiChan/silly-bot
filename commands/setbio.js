module.exports.run = async(client, message, args) => {
	const config = require("../json/config.json");
	const Discord = require("discord.js");
	
	var profiles = client.databases.get("profiles");

	if(!args[0]) return message.channel.send("Please input a description.");
	else {
		var bio = "";
		for(var i in args) bio+=`${args[i]} `;
		bio = bio.slice(0, -1);
	}

	profiles.run("UPDATE Users SET bio = ? WHERE userId = ?", [bio, message.author.id]);
	message.channel.send("Your bio has been updated to: `"+bio+"`.");
}

module.exports.config = {
	command: "setbio",
	syntax: "setbio {your description}",
	description: "Edits your profile's description."
}