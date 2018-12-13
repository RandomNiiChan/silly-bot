module.exports.run = async(client, message, args) => {
	const Discord = require('discord.js');
	const util = require('./util.js');

	if(args[1])
	{
		//Liste des commandes
		if(args[1] == "util")
		{
			//Retourner une commande inconnue
			message.channel.send("nani");
		}
		if(client.warcommands.get(args[1]))
		{
			var cmd = client.warcommands.get(args[1]);
			message.channel.send(util.helpCard(cmd));
		}
		else message.channel.send("heck");
	}
	else
	{
		//Afficher l'aide de la commande
		message.channel.send("nani");
	}
}

module.exports.config = {
	command: "help"
}