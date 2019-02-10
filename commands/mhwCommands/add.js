const request = require("request");
const util = require("./util.js");
const Discord = require("discord.js");
const sqlite3 = require("sqlite3");
const classes = require("./classes.js");

module.exports.run = async(client,message,args) => {
	var loadoutsDatabase = new sqlite3.Database('./databases/mhw.sqlite');
	var action = args[1];
	switch(action)
	{
		case 'wishlist':

		break;

		case 'loadout':

		break;

		case '':

		break;

		default:
			message.channel.send("Unknown add command.");
		break;
	}

	loadoutsDatabase.close();
}

module.exports.config = {
	command: "loadout",
	syntax: 'loadout {create|delete} (loadout name)',
	description: "Recherche un objet du jeu. Il faut renseigner le type d'objet à rechercher juste à côté de find."
}