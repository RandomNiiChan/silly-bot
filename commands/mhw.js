module.exports.run = async(client, message, args) => {
	//Déclaration des modules à utiliser (NPM)
	const Discord = require("discord.js");
	const fs = require("fs");
	//Déclaration des modules à utiliser (custom)
	const util = require("./mhwCommands/util.js");
	//Déclaration des bases de données JSON
	const config = require("../json/config.json");
	//Déclaration de la requête URL

	if(!args[0]) element = 'help';
	else if(args[0].match(/find(a|w|c|d|i|s)/gm)) var element = "find";
	else if(args[0] === 'find') message.channel.send("Renseignez un élément à rechercher !");
	else var element = args[0];

	var cmd = client.mhwcommands.get(element);
	if(cmd) cmd.run(client, message, args);
	else message.channel.send("Commande inconnue.");
}

module.exports.config = {
	command: "mhw",
	syntax: "mhw {commande}",
	description: "Renseignez une commande pour obtenir des utilitaires en rapport avec Monster Hunter World. Ne pas préciser de commande fait apparaître la liste des commandes disponibles."
}