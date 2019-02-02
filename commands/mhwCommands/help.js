module.exports.run = async(client, message, args) => {
	const Discord = require('discord.js');
	const util = require('./util.js');
	const fs = require("fs");
	const config = require("../../json/config.json");

	message.channel.send("sisi dans cette tondeuse tout est bien fini");
}

module.exports.config = {
	command: "help",
	syntax: "help [commande]",
	description: "Affiche l'aide d'une commande Monster Hunter World."
}