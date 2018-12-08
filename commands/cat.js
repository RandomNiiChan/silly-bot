module.exports.run = async(client, message, args) => {
	const https = require("https");
	const request = require("request");
	const config = require("../json/config.json");
	const Discord = require("discord.js");

	var apiTarget = 'https://aws.random.cat/meow';

	request(apiTarget, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			const url = JSON.parse(body).file;
			var embed = new Discord.RichEmbed()
			.setColor(config.embedColor)
			.setFooter("https://aws.random.cat")
			.setTitle("Random cat")
			.setImage(url);
			message.channel.send(embed);
		}
		else {
			console.log(error);
			message.channel.send('Une erreur est survenue.');
		}
	});
}

module.exports.config = {
	command: "cat",
	syntax: "cat",
	description: "Poste une photo de chat."
}