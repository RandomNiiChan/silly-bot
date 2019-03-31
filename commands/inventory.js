module.exports.run = async(client, message, args) => {
	const config = require("../json/config.json");
	const classes = require("./classes.js");
	const Discord = require("discord.js");

	const Manager = classes.Manager;
	const BoosterManager = classes.BoosterManager;
	const InventoryManager = classes.InventoryManager;
	
	var profiles = client.databases.get("profiles");
	var iManager = new InventoryManager(profiles,message.author.id);

	var page = args[1] ? args[1] : 1;
	var mode = args[0] ? args[0] : "booster";

	//gestion des alias
	if(mode == 'b') mode = "booster";
	else if(mode == 'd') mode = "doggo";
	if(!mode == 'booster' && !mode == 'doggo') return message.channel.send("Unknown parameter");

	iManager.viewInventory(message.channel,mode,page,5);
}

module.exports.config = {
	command: "inventory",
	syntax: "booster {doggo/booster}",
	description: "Displays your doggos or boosters inventory."
}