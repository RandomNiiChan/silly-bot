module.exports.run = async(client, message, args) => {
	const util = require("./util.js");
	const WorldState = require('warframe-worldstate-parser');
	const worldstateData = await (require('request-promise'))('http://content.warframe.com/dynamic/worldState.php');
	const ws = new WorldState(worldstateData);

	var voidFissures = ws.fissures;
	var generatedTime = util.timeString(ws.timestamp);
	voidFissures.sort((a,b) => a.tierNum - b.tierNum);

	if(args[1])
	{
		voidFissures = voidFissures.filter(fissure => fissure.tier.toLowerCase() == args[1].toLowerCase());
		var totalFissures = voidFissures.length;
		var string = `= Etat des fissures ${util.normalize(args[1])} (${generatedTime}): ${totalFissures} fissures actives =\n\n`;

		if(!totalFissures) string+= "Aucune fissure pour cette ère.\nVérifiez l'orthographe, ou revenez plus tard.\n\n";
		else for(var i in voidFissures) string+=util.fissureInfo(voidFissures[i]);
	}
	else
	{
		var totalFissures = ws.fissures.length;
		var string = `= Etat des fissures (${generatedTime}): ${totalFissures} fissures actives =\n\n`;

		if(totalFissures == 0) string+= "Malheureusement, aucune fissure n'est en cours. Le vide se porte bien.";
		else for(var i in voidFissures) string+=util.fissureInfo(voidFissures[i]);
	}

	message.channel.send(util.convertAsciidoc(string));
}

module.exports.config = {
	command: "fissures",
	description: "Affiche les fissures du Vide en cours sur Warframe. Il est possible de filtrer les fissures par ère.",
	syntax: "fissures {ère}"
}