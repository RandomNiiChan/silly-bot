const isgd = require("isgd");
const config = require("../json/config.json");

module.exports.run = async(client, message, args) => {
	if(!args[0]) message.channel.send("Il faut une URL à raccourcir !");

	isgd.shorten(args[0], function(res) {
		if(res.startsWith("Error:")) message.channel.send("L'URL n'est pas valide !");
		else{
			message.delete();
			message.channel.send("Lien raccourci: "+res);
		} 
	});
}

module.exports.config = {
	command: "shrink",
	syntax: "shrink [url]",
	description: "Raccourcit une URL."
}