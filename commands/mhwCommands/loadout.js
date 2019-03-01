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
		/*
			Créer un loadout
			---
			arguments: nom du loadout
			réalisé si:
			- on donne un nom
			- nom de 50 caractères ou moins
			- nom n'existe pas parmi les loadouts créés par l'utilisateur
			- l'utilisateur possède 5 loadouts ou plus
		*/
		case 'create':
			if(args[2]) {
				var name = args[2];
				var owner = message.author.id;
				console.log(owner);
				if(name.length > 50) 
					return message.channel.send("The loadout name is too long !");
				var register = new Loadout(name, owner);

				//Getting the number of loadouts
				loadoutsDatabase.get("SELECT COUNT(loadoutId) FROM Loadouts WHERE userId = ?", [owner], (err, row) => {
					if(err) throw err;
					var total = row["COUNT(loadoutId)"];
					//Cannot make more than 5 loadouts
					if(total > 5) return message.channel.send("You already have 5 loadouts, please delete one in order to create another one !");
					//
					else {
						loadoutsDatabase.get("SELECT * FROM Loadouts WHERE userId = ? AND name = ?",[owner,name], (err,row) => {
							if(row) return message.channel.send("You already have a loadout name this way.");
							else register.insertInto(loadoutsDatabase);
						});
					}
				});
			}
			else return message.channel.send("Please input a loadout name.");
		break;

		/*
			Supprimer un loadout
			---
			argument: nom du loadout
			réalisé si:
			- on donne un nom
			- existe dans les loadouts créés
			- l'utilisateur confirme en entrant le nom du loadout
		*/
		case 'delete':
			
		break;

		case 'debug':
			//loadoutsDatabase.get("SELECT * FROM Loadouts WHERE loadoutId = 5",[],(err,row) => {
			//	console.log(row);
			//});
			var test = new Array("yes","uno","dos","tres");
			console.log(String(test));
		break;

		/*
			Lister les loadouts
			---
			arguments: aucun
			réalisé: dans tous les cas
		*/
		case 'list':
			var user = message.author.id;
			var sql = "SELECT * FROM Loadouts WHERE userId = ?";
			loadoutsDatabase.all(sql, [user], (err,rows) => {
				if(err) {
					message.channel.send("An error has occured, OOF");
					throw err;
				}
				rows.forEach((row) => {
					var loadout = new Loadout(null,null,row);
				});
			});
		break;

		/*
			Editer une note sur le loadout
			---
			argument: nom du loadout (puis note une fois validé)
			réalisé si:
			- loadout existe
			- note moins de 140 caractères
		*/
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