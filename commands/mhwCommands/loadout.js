const request = require("request");
const util = require("./util.js");
const Discord = require("discord.js");
const sqlite3 = require("sqlite3");

module.exports.run = async(client,message,args) => {
	let db = new sqlite3.Database('../../databases/mhw.sqlite', sqlite3.OPEN_READWRITE, (err) => {
		if (err) console.error(err.message);
		console.log('Successfully opened the database.');
	});

	var action = args[1];
	switch(action)
	{
		case 'create':
			
		break;

		case 'delete':

		break;
	}

	db.close((err) => {
		if(err) console.error(err.message);
		console.log('Successfully closed the database.');
	});
}

module.exports.config = {
	command: "loadout",
	syntax: 'loadout {create|delete} (loadout name)',
	description: "Recherche un objet du jeu. Il faut renseigner le type d'objet à rechercher juste à côté de find."
}