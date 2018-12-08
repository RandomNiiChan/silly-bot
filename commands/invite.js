module.exports.run = async(client, message, args) => {
	const config = require("../json/config.json");
	message.channel.send(config.inviteLink);
}

module.exports.config = {
	command: "invite",
	syntax: "invite {dm | optionnel}",
	description: "Retourne le lien d'invitation du bot. Il est possible de l'envoyer en message privé en écrivant dm."
}