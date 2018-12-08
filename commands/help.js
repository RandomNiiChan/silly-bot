module.exports.run = async(client, message, args) => {
	const fs = require("fs");
	const Discord = require("discord.js");

	const config = require("../json/config.json");
	const about = require("../json/about.json");

	if(!args[0])
	{
		fs.readdir('./commands/', (err,files) => {
			if(err) console.error(err);
			var jsfiles = files.filter(f => f.split('.').pop() === 'js');
			var commandList = "";
			if(config.prefix == "*")
				var prefix = "\*";
			else if(config.prefix == "_")
				var prefix = "\_";
			else
				var prefix = config.prefix;
			var embed = new Discord.RichEmbed()
				.setColor(config.embedColor)
				.setTitle(`${about.name}, ${about.description}`)
				.setDescription(`Préfixe des commandes: ${config.prefix}\nEnvoyez **${config.prefix}[nom de la commande]** pour en apprendre plus sur celle-ci !`);

			jsfiles.forEach((f,i) => {
				var command = f.split('.');
				commandList+=command[0]+"\n";
			});

			embed.addField("Liste des commandes",commandList);

			message.channel.send(embed);
		});
	}
	else
	{
		fs.readdir("./commands/", (err, files) =>{
			if(err) console.log(err);
			if(files.includes(`${args[0]}.js`))
			{
				var command = require(`./${args[0]}.js`);
				var configFile = command.config;
				var embed = new Discord.RichEmbed()
					.setColor(config.embedColor)
					.setTitle(`Commande ${configFile.command}`)
					.addField("Syntaxe", config.prefix+configFile.syntax)
					.setDescription(configFile.description);
				message.channel.send(embed);
			}
			else
			{
				message.channel.send("La commmande n'existe pas");
			}
		});
	}
}

module.exports.config = {
	command: "help",
	syntax: "help [nom de la commande]",
	description: "Affiche l'aide de la commande passée en argument."
}