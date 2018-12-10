const request = require("request");
const util = require("./util.js");

//module.exports.run = async(client,message,code,page) => {
module.exports.run = async(client,message,args) => {
	if(args[0].slice(7) == "") var page = 1;
	else var page = args[0].slice(7);
	if(!args[1]) return message.channel.send("Renseignez un objet à rechercher !");
	else var code = util.urlConvert(args.slice(1));

	var apiTarget = 'https://api.warframe.market/v1/items/'+code+'/orders';
	request(apiTarget, function(error,response,body) {
		if (!error && response.statusCode == 200) {
			//Si la recherche est pas bonne
			if(body.startsWith("<!DOCTYPE html>")) message.channel.send("Une erreur s'est produite. Êtes-vous sûr d'avoir cherché un objet valide ?");
			else
			{
				var orders = JSON.parse(body).payload.orders;

				var activeOffers = util.getActiveSellers(JSON.parse(body).payload.orders);
				activeOffers.sort((a,b)=> a.platinum - b.platinum);

				var activeOffersAux = util.arraySlicer(activeOffers,10,page-1);
				var onlineCount = util.getStatusCount("online",activeOffers);
				var ingameCount = util.getStatusCount("ingame",activeOffers);

				var returned = `= Ventes pour ${util.urlReverse(code)} [page ${page}/${Math.ceil(activeOffers.length/10)}] =\n`;
				returned += `= Total de mises en ventes: ${orders.length} | vendeurs en ligne: ${onlineCount} | vendeurs en jeu: ${ingameCount} =\n\n`;
				for(var i in activeOffersAux)
				{
					returned += util.sellingOrder(activeOffersAux[i]);
				}
				
				message.channel.send(util.convertAsciidoc(returned));
			}
		}

		else {
			console.log(error);
			message.channel.send("Une erreur s'est produite lors de l'accès à warframe.market.");
		}
	});
}

module.exports.config = {
	command: "sellers",
	syntax: "sellers[numéro de page] [objet à rechercher]",
	description: "affiche les ordres de vente pour un objet sur le warframe market.\n**ATTENTION:** \"sellers\" et le numéro de la page doivent être attachés.\n\n__Exemple:__ sellers2 affiche la deuxième page."
}