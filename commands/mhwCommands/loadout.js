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
				var loadout = new Loadout(loadoutName, message.author);
				
				loadoutsDatabase.get("SELECT COUNT(loadoutId) FROM Loadouts WHERE userId = ?", [loadout.userId], function(err, result) {
					if(result['COUNT(loadoutId)'] >= 5) return message.channel.send("You already have 5 loadouts. Please consider deleting one !");
					else {
						loadout.registerLoadout(loadoutsDatabase);
						message.channel.send("You created a new loadout: "+loadout.name);
					} 
				});
			}
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
			var embed = new Discord.RichEmbed()
			.setTitle("Test")
			.addField("yes","```test\ntest\ntest```");
			message.channel.send(embed);
		break;

		/* TODO
		case 'note':
			if(!args[2]) message.channel.send("Please input a note for your loadout !");
			else {
				var loadoutNote = util.stringifyArray(args.slice(2));
				if(loadoutNote.length > 140) return message.channel.send("This note is too long. Please note that the maximal length for a note is 140 characters !");
				else {

				}
			}
		break;
		*/

		default:
			message.channel.send("Unknown loadout command.");
		break;
	}

	loadoutsDatabase.close();
}

module.exports.config = {
	command: "loadout",
	syntax: 'loadout {create|delete|rename|note} (loadout name) [note|new loadout name]',
	description: "Creates a MHW loadout. You can edit its note or its name after its original name."
}