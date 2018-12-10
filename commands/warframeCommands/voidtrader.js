module.exports.run = async(client, message, args) => {
	const util = require("./util.js");
	//Worldstate
	const WorldState = require('warframe-worldstate-parser');
	const worldstateData = await (require('request-promise'))('http://content.warframe.com/dynamic/worldState.php');
	const ws = new WorldState(worldstateData);

	message.channel.send(util.voidTrader(ws.voidTrader,ws.timestamp));
}

module.exports.config = {
	command: "voidtrader"
}