module.exports.run = async(client, message, args) => {
	const util = require("./util.js");
	const WorldState = require('warframe-worldstate-parser');
	const worldstateData = await (require('request-promise'))('http://content.warframe.com/dynamic/worldState.php');
	const ws = new WorldState(worldstateData);

	var voidFissures = ws.fissures;
	voidFissures.sort((a,b) => a.tierNum - b.tierNum);

	var totalFissures = ws.fissures.length;
	var generatedTime = util.timeString(ws.timestamp);
	var string = `= Etat des fissures (${generatedTime}): ${totalFissures} fissures actives =\n`;
	for(var i=0; i<totalFissures; i++) string+=util.fissureInfo(voidFissures[i]);

	message.channel.send(util.convertAsciidoc(string));
}

module.exports.config = {
	command: "fissures"
}