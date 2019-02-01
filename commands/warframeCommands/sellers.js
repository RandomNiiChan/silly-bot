const request = require("request");
const util = require("./util.js");

module.exports.run = async(client,message,args) => {
	//On essaye de choper la page
	if(args[0].slice(7) == "") var page = 1;
	else var page = args[0].slice(7);
	page = Math.abs(parseInt(page));
	if(page == 0) page = 1;

	//on convertit les pages en code pour cette api de mort
	if(!args[1]) return message.channel.send("Renseignez un objet à rechercher !");
	else var code = util.urlConvert(args.slice(1));

	//requête vers warframe market
	var apiTarget = 'https://api.warframe.market/v1/items/'+code+'/orders';
	request(apiTarget, function(error,response,body) {
		if (!error && response.statusCode == 200) {
			//Si la recherche est pas bonne
			if(body.startsWith("<!DOCTYPE html>")) message.channel.send("Une erreur s'est produite. Êtes-vous sûr d'avoir cherché un objet valide ?");
			else
			{
				var orders = JSON.parse(body).payload.orders;

				//On retire les utilisateurs hors ligne
				var activeOffers = util.getActiveSellers(JSON.parse(body).payload.orders);
				//On trie par prix de vente croissant
				activeOffers.sort((a,b)=> a.platinum - b.platinum);

				var maxPage = Math.ceil(activeOffers.length/10);
				if(page>maxPage) page = maxPage;

				//Extrait la bonne page renseignée par l'utilisateur
				var activeOffersAux = util.arraySlicer(activeOffers,10,page-1);
				//utilisateurs en ligne et en jeu
				var onlineCount = util.getStatusCount("online",activeOffers);
				var ingameCount = util.getStatusCount("ingame",activeOffers);

				//On génère le résultat
				var returned = `= Ventes pour ${util.urlReverse(code)} [page ${page}/${maxPage}] =\n`;
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
	syntax: "sellers{numéro de page} [objet à rechercher]",
	description: "Affiche les ordres de vente pour un objet sur le warframe market.\n**ATTENTION:** \"sellers\" et le numéro de la page doivent être attachés.\n\n__Exemple:__ sellers2 affiche la deuxième page."
}