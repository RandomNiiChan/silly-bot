module.exports.run = async(client, message, args) => {
	const config = require("../json/config.json");
	const classes = require("./classes.js");
	const Discord = require("discord.js");

	const Manager = classes.Manager;
	const BoosterManager = classes.BoosterManager;
	const InventoryManager = classes.InventoryManager;
	
	var profiles = client.databases.get("profiles");
	var bManager = new BoosterManager(profiles);
	var iManager = new InventoryManager(profiles,message.author.id);

	var mode = args[0];
	var booster = args[1];

	switch(mode)
	{
		case 'buy':
			if(!booster) message.channel.send("Please input a booster to buy.");
			else iManager.buyBooster(message.channel, booster);
		break;

		case 'list':
			bManager.list(message.channel);
		break;

		case 'inspect':
			if(!booster) message.channel.send("Please input a booster to inspect.");
			else bManager.inspect(message.channel,booster);
		break;

		case 'open':
			if(!booster) message.channel.send("Please input a booster to open.");
			else {
				iManager.openBooster(message.channel,booster);
			}
		break;

		default:
			message.channel.send("TODO Booster command list");
		break;
	}
}

module.exports.config = {
	command: "booster",
	syntax: "booster [command]",
	description: "Manages your booster collection. Do not specify any command to display the list of the available commands."
}