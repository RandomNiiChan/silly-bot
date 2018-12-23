module.exports.run = async(client, message, args) => {
	//Déclaration des modules à utiliser (NPM)
	const Discord = require("discord.js");
	const WorldState = require('warframe-worldstate-parser');
	const fs = require("fs");
	//Déclaration des modules à utiliser (custom)
	const util = require("./warframeCommands/util.js");
	//Déclaration des bases de données JSON
	const config = require("../json/config.json");
	//Déclaration de la requête URL

	if(!args[0]) element = 'help';
	else if(args[0].match(/sellers[0-9]*/gm)) var element = "sellers";
	else var element = args[0];

	var cmd = client.warcommands.get(element);
	if(cmd) cmd.run(client, message, args);
	else message.channel.send("Commande inconnue.");
}

module.exports.config = {
	command: "warframe",
	syntax: "warframe {élément | optionnel}",
	description: "Affiche l'état actuel du monde de Warframe sur PC."
}