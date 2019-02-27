const request = require("request");
const util = require("./util.js");
const Discord = require("discord.js");
const sqlite3 = require("sqlite3");

const classes = require("./classes.js");
const Loadout = classes.Loadout;

module.exports.run = async(client,message,args) => {
	var loadoutsDatabase = new sqlite3.Database('./databases/mhw.sqlite');
	var action = args[1];
	switch(action)
	{
		case 'create':
			
		break;

		case 'list':
			
		break;

		case 'debug':

		break;

		case 'note':
			
		break;

		default:
			message.channel.send("Unknown loadout command.");
		break;
	}

	loadoutsDatabase.close();
}

module.exports.config = {
	command: "loadout",
	syntax: 'loadout {create|delete|rename|note} (loadout name) [note|new loadout name]',
	description: "Creates a MHW loadout. You can edit its note or its name after its original name.\n**Warning: the name of the loadout is limited to one word.**"
}