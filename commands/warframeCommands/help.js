module.exports.run = async(client, message, args) => {
	const Discord = require('discord.js');
	const util = require('./util.js');
	const fs = require("fs");
	const config = require("../../json/config.json");

	//Si il y a un argument après "help"
	if(args[1])
	{
		var cmd = client.warcommands.get(args[1]);
		//Si c'est util, ça foire
		if(args[1] == "util" || !cmd)
		{
			message.channel.send("Commande inconnue !");
		}
		//Si la commande existe
		else
		{
			message.channel.send(util.helpCard(cmd));
		}
	}
	//Sinon on affiche la liste des commandes
	else
	{
		fs.readdir('./commands/warframeCommands/', (err,files) => {
			if(err) console.error(err);

			//Liste des commandes, sans util.js
			var jsfiles = files.filter(f => f.split('.').pop() === 'js' && f.split('.')[0] != 'util');

			var commandList = "";

			if(config.prefix == "*") var prefix = "\*";
			else if(config.prefix == "_") var prefix = "\_";
			else var prefix = config.prefix;

			var embed = util.rootEmbed()
				.setTitle("Liste des commandes Warframe")
				.setDescription(`Voici la liste des commandes disponibles. Exécutez ${prefix}warframe [nom de la commande] !\n**ATTENTION: ces informations ne sont valables que pour la version PC.**`);

			jsfiles.forEach((f,i) => {
				var command = f.split('.');
				commandList+=command[0]+"\n";
			});

			embed.addField("Liste des commandes",commandList);

			message.channel.send(embed);
		});
	}
}

module.exports.config = {
	command: "help"
}