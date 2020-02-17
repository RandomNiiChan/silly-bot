const Discord = require("discord.js");
const config = require("./json/config.json");
const fs = require("fs");
const sqlite = require("sqlite3");

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.warcommands = new Discord.Collection();
client.mhwcommands = new Discord.Collection();
client.databases = new Discord.Collection();
client.rifts = new Discord.Collection();

function loadDatabases() {
	fs.readdir('./databases/', (err,files) => {
		if(err) console.log(err);

		var databases = files.filter(f=>f.split('.').pop() === 'sqlite');
		if(databases.length <= 0) return console.log("No databases (.sqlite) found.");
		else console.log("===Databases===\n"+databases.length+" databases found.");

		databases.forEach((f,i) => {
			delete require.cache[require.resolve(`./databases/${f}`)];
			console.log(`Database ${f} loading...`);
			var db = new sqlite.Database(`./databases/${f}`, (err) => {
				if(err) console.error("Error while connecting to the database: "+err.message);
			});
			var name = f.split('.')[0];
			client.databases.set(name,db);
		});
	});
}

function loadGeneralCmds() {
	fs.readdir('./commands/', (err,files) => {
		if(err) console.error(err);

		var jsfiles = files.filter(f => f.split('.').pop() === 'js');
		if(jsfiles.length <= 0) return console.log("No general commands found.");
		else console.log("===General commands===\n"+jsfiles.length+" command files found.");

		jsfiles.forEach((f,i) => {
			delete require.cache[require.resolve(`./commands/${f}`)];
			
			if(f == "classes.js" || f == "util.js") console.log("[Utilitary file found: "+f+"]");
			else {
				console.log(`Command ${f} loading...`);
				var cmds = require(`./commands/${f}`);
				client.commands.set(cmds.config.command, cmds);
			}
		});
	});
}

function loadWarframeCmds() {
	fs.readdir('./commands/warframeCommands/', (err,files) => {
		if(err) console.log(err);

		var jsfiles = files.filter(f => f.split('.').pop() === 'js');
		if(jsfiles.length <= 0) return console.log("No warframe commands found.");
		else console.log("===Warframe commands===\n"+jsfiles.length+" command files found.");

		jsfiles.forEach((f,i) => {
			delete require.cache[require.resolve(`./commands/warframeCommands/${f}`)];

			if(f == "classes.js" || f == "util.js") console.log("[Utilitary file found: "+f+"]");
			else {
				console.log(`Command ${f} loading...`);
				var cmds = require(`./commands/warframeCommands/${f}`);
				client.warcommands.set(cmds.config.command, cmds);
			}
		});
	});
}

function loadMonsterHunterCmds() {
	fs.readdir('./commands/mhwCommands/', (err,files) => {
		if(err) console.log(err);

		var jsfiles = files.filter(f=>f.split('.').pop() === 'js');
		if(jsfiles.length <= 0) return console.log("No MHW commands found.");
		else console.log("===MHW commands===\n"+jsfiles.length+" command files found.");

		jsfiles.forEach((f,i) => {
			delete require.cache[require.resolve(`./commands/mhwCommands/${f}`)];

			if(f == "classes.js" || f == "util.js") console.log("[Utilitary file found: "+f+"]");
			else {
				console.log(`Command ${f} loading...`);
				var cmds = require(`./commands/mhwCommands/${f}`);
				client.mhwcommands.set(cmds.config.command, cmds);	
			}
		});
	});
}

function initUser(userId) {
	var profiles = client.databases.get("profiles");
	profiles.run("INSERT INTO Users(userId,level,xp,nextLevel,credits,bio) VALUES(?,?,?,?,?,?)",[userId,1,0,10,0,"I have no description yet."]);
}

function loadEverything(){
	loadGeneralCmds();
	loadWarframeCmds();
	loadMonsterHunterCmds();
	loadDatabases();
}

client.on("ready", () => {
	console.log("beep boop i am working");
	client.user.setActivity(`${config.botGame} | ${config.prefix}help`);
});

client.on("message", (message) => {
	const prefix = config.prefix;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	var profiles = client.databases.get("profiles");

	if(message.author.bot || message.channel.type === "dm") return;

	var profiles = client.databases.get("profiles");

	//Mise à jour de l'XP et du niveau
	profiles.get('SELECT * FROM Users WHERE userId = ?', [message.author.id], (err,row) => {
		//on regarde si l'utilisateur existe dans la table
		if(row) {
			profiles.run(`UPDATE Users SET xp = ${row.xp+1} WHERE userId = ?`, [message.author.id]);
			if(row.xp+1 >= row.nextLevel) {
				profiles.run("UPDATE Users SET level = ?, nextLevel = ?, xp = 0 WHERE userId = ?",[row.level+1, ((row.level+1)^2)*10, message.author.id]);
				message.reply(`You advanced to the level ${row.level+1}! Congratulations!`);
			}
		}
		else {
			console.log(`Inserting ${message.author.tag} (${message.author.id}) into the database.`);
			initUser(message.author.id);
		}
	});

	if (!message.content.startsWith(prefix)) return;

	//Gestion du texte des messages
	if(command === "reload") {
		loadEverything();
		message.channel.send(`meep morp commands and databases reloaded`);
		console.log("===Commands fully reloaded===")
	}

	var cmd = client.commands.get(command);
	if(cmd) cmd.run(client, message, args);
});

client.on("error", (error) => {
	console.log(error.message);	
});

client.login(process.env.BOT_TOKEN);