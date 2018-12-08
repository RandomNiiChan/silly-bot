module.exports.run = async(client,message,args) => {
	//Déclaration des modules à utiliser (NPM)
	const Discord = require("discord.js");
	const WorldState = require('warframe-worldstate-parser');
	const fs = require("fs");
	//Déclaration des modules à utiliser (custom)
	const util = require("./warframeCommands/util.js");
	//Déclaration des bases de données JSON
	const config = require("../json/config.json");
	//Déclaration de la requête URL
	const worldstateData = await (require('request-promise'))('http://content.warframe.com/dynamic/worldState.php');
	const ws = new WorldState(worldstateData);

	message.channel.send(util.urlReverse(args[0]));
}

module.exports.config = {
	command: "dummy"
}