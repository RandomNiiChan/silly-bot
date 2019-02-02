const Discord = require("discord.js");
const config = require("./json/config.json");
const fs = require("fs");

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.warcommands = new Discord.Collection();
client.mhwcommands = new Discord.Collection();

function loadGeneralCmds()
{
	fs.readdir('./commands/', (err,files) => {
		if(err) console.error(err);

		var jsfiles = files.filter(f => f.split('.').pop() === 'js');
		if(jsfiles.length <= 0) return console.log("No general commands found.");
		else console.log("===General commands===\n"+jsfiles.length+" command files found.");

		jsfiles.forEach((f,i) => {
			delete require.cache[require.resolve(`./commands/${f}`)];
			console.log(`Command ${f} loading...`);
			var cmds = require(`./commands/${f}`);
			client.commands.set(cmds.config.command, cmds);
		});
	});
}

function loadWarframeCmds()
{
	fs.readdir('./commands/warframeCommands/', (err,files) => {
		if(err) console.log(err);

		var jsfiles = files.filter(f => f.split('.').pop() === 'js');
		if(jsfiles.length <= 0) return console.log("No warframe commands found.");
		else console.log("===Warframe commands===\n"+jsfiles.length+" command files found.");

		jsfiles.forEach((f,i) => {
			delete require.cache[require.resolve(`./commands/warframeCommands/${f}`)];
			console.log(`Command ${f} loading...`);
			var cmds = require(`./commands/warframeCommands/${f}`);
			client.warcommands.set(cmds.config.command, cmds);
		});
	});
}

function loadMonsterHunterCmds()
{
	fs.readdir('./commands/mhwCommands/', (err,files) => {
		if(err) console.log(err);

		var jsfiles = files.filter(f=>f.split('.').pop() === 'js');
		if(jsfiles.length <= 0) return console.log("No MHW commands found.");
		else console.log("===MHW commands===\n"+jsfiles.length+" command files found.");

		jsfiles.forEach((f,i) => {
			delete require.cache[require.resolve(`./commands/mhwCommands/${f}`)];
			console.log(`Command ${f} loading...`);
			var cmds = require(`./commands/mhwCommands/${f}`);
			client.mhwcommands.set(cmds.config.command, cmds);
		});
	});
}

loadGeneralCmds();
loadWarframeCmds();
loadMonsterHunterCmds();

client.on("ready", () => {
	console.log("beep boop i am working");
	client.user.setActivity(`${config.botGame} | ${config.prefix}help`);
});

client.on("message", (message) => {
	const prefix = config.prefix;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if(message.isMentioned(client.users.get(client.user.id))) message.channel.send({file: "assets/pingGif.gif"});

	if(!message.content.startsWith(prefix) || message.author.bot) return;

	if(command === "reload")
	{
		loadGeneralCmds();
		loadWarframeCmds();
		loadMonsterHunterCmds();
		message.channel.send(`meep morp commands reloaded`);
	}

	var cmd = client.commands.get(command);
	if(cmd) cmd.run(client, message, args);
});

client.on("error", (error) => {
	console.log(error.message);	
});

client.login(config.token);