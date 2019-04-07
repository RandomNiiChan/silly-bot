module.exports.run = async(client, message, args) => {
	const config = require("../json/config.json");
	const classes = require("./classes.js");
	const Discord = require("discord.js");

	const Manager = classes.Manager;
	const BoosterManager = classes.BoosterManager;
	const InventoryManager = classes.InventoryManager;
	const DoggoManager = classes.DoggoManager;
	
	var profiles = client.databases.get("profiles");
	var dManager = new DoggoManager(profiles);
	var iManager = new InventoryManager(profiles,message.author.id);

	var mode = args[0];
	var doggo = args[1];

	switch(mode) {
		case 'sell':
			if(!doggo) return message.channel.send("Please input a doggo to inspect.");
			else iManager.sellDoggo(message.channel,doggo);
		break;

		case 'inspect':
			if(!doggo) return message.channel.send("Please input a doggo to inspect.");
			else {
				profiles.get("SELECT * FROM Doggos WHERE doggoId = ?",[doggo],(err,row) => {
					if(!row) return message.channel.send("This doggo doesn't exist...");
					else message.channel.send(DoggoManager.inspect(row));
				});
			}
		break;
	}
}

module.exports.config = {
	command: "doggo",
	syntax: "doggo [command]",
	description: "Manages your doggo collection. Do not specify any command to display the list of the available commands."
}
