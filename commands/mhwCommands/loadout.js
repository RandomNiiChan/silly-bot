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
			var sql = 'SELECT * FROM Loadouts WHERE userId = ?';
			if(message.mentions.users.first()) var id = message.mentions.users.first().id;
			else var id = message.author.id;
			var list = `= ${message.author.username}'s Loadouts =\n\n`;

			loadoutsDatabase.all(sql, id, (err,rows) => {
				if(err) throw err;
				if(!rows) list+="You do not have any loadouts yet !"
				rows.forEach((row) => {
					list+=Loadout.rowToString(row);
				});

				message.channel.send(util.convertAsciidoc(list));
			});
		break;

		case 'debug':
			var sql = "SELECT * FROM sqlite_master WHERE tbl_name='Loadouts'";
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