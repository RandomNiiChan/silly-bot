const request = require("request");
const util = require("./util.js");

module.exports.run = async(client,message,search) => {

	var apiTarget = 'https://api.warframe.market/v1/items';

	request(apiTarget, function(error, response, body){
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body).payload.items.en;
			message.channel.send(util.itemList(data,search));
		}

		else {
			console.log(error);
			message.channel.send("Une erreur s'est produite lors de l'accès à warframe.market.");
		}
	});
}

module.exports.config = {
	command: "find",
	syntax: "find [objet à chercher]",
	description: "Recherche un objet en vente sur le warframe market."
}