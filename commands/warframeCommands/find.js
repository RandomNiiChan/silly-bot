const request = require("request");
const util = require("./util.js");

module.exports.find = async(client,message,search) => {

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