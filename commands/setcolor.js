module.exports.run = async(client, message, args) => {
	const config = require("../json/config.json");
	const Discord = require("discord.js");
	
	var profiles = client.databases.get("profiles");

	if(!args[0]) return message.channel.send("Please input a color.");
	else {
		var regex = /[A-Fa-f0-9]{6}/gm
		if(args[0].match(regex)) {
			var color = "0x"+args[0];
			profiles.run("UPDATE Users SET color = ? WHERE userId = ?",[color,message.author.id]);
			message.channel.send("Your profile color has been updated!")
		}
		else message.channel.send("Wrong color format! Please input a 6-character long hex string, without the # (eg: fff000).");
	}
}

module.exports.config = {
	command: "setcolor",
	syntax: "setbio {6-character long hex string}",
	description: "Edits your profile's color. You must use a 6-character long hexadecimal color string corresponding to your color (eg: fff000), without the #.\n[This tool can help you.](https://www.w3schools.com/colors/colors_picker.asp)"
}