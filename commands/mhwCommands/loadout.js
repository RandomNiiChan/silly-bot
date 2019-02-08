const request = require("request");
const util = require("./util.js");
const Discord = require("discord.js");
const sqlite3 = require("sqlite3");
const classes = require("./classes.js");
const Loadout = classes.Loadout;

module.exports.run = async(client,message,args) => {
	var loadoutsDatabase = new sqlite3.Database('../../databases/mhw.sqlite');
	var action = args[1];
	switch(action)
	{
		case 'create':
			if(!args[2]) message.channel.send("Please input a name for your loadout !");
			else
			{
				var arrayName = args.slice(2);
				var loadoutName = util.stringifyArray(arrayName).toLowerCase();
				console.log(loadoutName);
			}
		break;

		case 'delete':
			
		break;

		case 'list':
			var test = new Loadout("albert",message.author);
			message.channel.send(test.toString());
		break;

		default:
			message.channel.send("Samarchpa");
		break;
	}

	loadoutsDatabase.close();
}

module.exports.config = {
	command: "loadout",
	syntax: 'loadout {create|delete} (loadout name)',
	description: "Recherche un objet du jeu. Il faut renseigner le type d'objet à rechercher juste à côté de find."
}