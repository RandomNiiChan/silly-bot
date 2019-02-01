module.exports.run = async(client, message, args) => {
	const config = require("../json/config.json");
	if(args[0])
	{
		if(args[0] == "dm")
		{
			try
			{
				message.author.send(config.inviteLink);
			}
			catch(error)
			{
				console.log(error);
				message.channel.send("Une erreur s'est produite lors de l'envoi.");
			}
		}
		else message.channel.send("Il faut écrire dm pour envoyer le lien en privé.");
	}
	else
	{
		message.channel.send(config.inviteLink);
	}
}

module.exports.config = {
	command: "invite",
	syntax: "invite {dm}",
	description: "Retourne le lien d'invitation du bot. Il est possible de l'envoyer en message privé en écrivant dm."
}