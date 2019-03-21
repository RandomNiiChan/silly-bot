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

	iManager.viewInventory(message.channel,mode);
}

module.exports.config = {
	command: "inventory",
	syntax: "booster {doggo/booster}",
	description: "Displays your doggos or boosters inventory."
}