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
				var loadoutName = args[2];
				var loadout = new Loadout(loadoutName, message.author);
				
				loadoutsDatabase.get("SELECT COUNT(name) FROM Loadouts WHERE userId = ?", [loadout.userId], function(err, result) {
					if(result['COUNT(loadoutId)'] >= 5) return message.channel.send("You already have 5 loadouts. Please consider deleting one !");
					else {
						loadout.registerLoadout(loadoutsDatabase,message.channel);
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
				if(rows.length == 0) list+="You do not have any loadouts yet !"
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

		case 'note':
			if(!args[2]) return message.channel.send("Please enter the name of the loadout whose label you want to change.");
			else {
				//Entrer le nom du loadout
				var name = args[2];

				//Commencer la collecte
				message.channel.send("Please input the new loadout note.");
				const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 20000 });

				//récupération d'un message
				collector.on('collect', msg => {
					loadoutsDatabase.run("UPDATE Loadouts SET note = ? WHERE userId = ? AND ");
					// var loadoutsDatabase = new sqlite3.Database('./databases/mhw.sqlite');
					// var note = msg.content;
					// if(note.length>140) return message.channel.send("Your note iss too long: please input a note shorter than 140 characters.");
					// if(note.toLowerCase() === "stop") collector.stop("abort");
					// loadoutsDatabase.run("UPDATE Loadouts SET note = ? WHERE userId = ? AND ", [note,msg.author]);
					// message.channel.send(`Updated ${loadout}'s note: new note is [${note}]`);
					collector.stop();
				});

				//Fin de collecte
				collector.on('end', (collected, reason) => {
					if(reason == 'time') message.channel.send("You took too much time to write your note. This action has been cancelled.");
					else if(reason == 'abort') message.channel.send("Operation aborted.");
					else {
						message.channel.send("An unexpected error has occured.");
						console.log(reason);
					}
				});
			}
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