module.exports.run = async(client, message, args) => {
	const Discord = require("discord.js");
	const config = require("../json/config.json");
	const about = require("../json/about.json");

	var embed = new Discord.RichEmbed()
	.setColor(config.embedColor)
	.setTitle(`${about.name}, ${about.description}`)
	.setDescription(`Créé par ${about.author}.`)
	.addField("Version",about.version)
	.addField("Moteur",about.engine);

	message.channel.send(embed)
}

module.exports.config = {
	command: "about",
	syntax: "about",
	description: "Affiche les informations techniques du bot."
}