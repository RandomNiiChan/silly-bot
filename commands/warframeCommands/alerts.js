module.exports.run = async(client, message, args) => {
	const Discord = require('discord.js');
	const util = require('./util.js');
	const config = require("../../json/config.json");

	const WorldState = require('warframe-worldstate-parser');
	const worldstateData = await (require('request-promise'))('http://content.warframe.com/dynamic/worldState.php');
	const ws = new WorldState(worldstateData);

	var alerts = ws.alerts.filter(alert => alert.active);
	var totalAlerts = alerts.length;

	if(args[1])
	{
		var index = Math.abs(parseInt(args[1]))-1;
		var alertCard = util.rootEmbed();
		if(index > totalAlerts-1) return message.channel.send("Alerte invalide !");
		else message.channel.send("Oui");

		
	}
	else
	{
		var generatedTime = util.timeString(ws.timestamp);
		var list = `= Liste des alertes (${generatedTime}): ${totalAlerts} au total =\n\n`;

		alerts.sort((a,b) => a.mission.minEnemyLevel - b.mission.minEnemyLevel);

		for(var i in alerts) list+=util.aboutAlert(alerts[i],i);

		message.channel.send(util.convertAsciidoc(list));
	}
}

module.exports.config = {
	command: "alerts"
}