const request = require("request");
const util = require("./util.js");

//module.exports.run = async(client,message,search) => {
module.exports.run = async(client,message,args) => {
	//gestion des erreurs
	var type = util.queryType(args[0]);
	if(!type) return message.channel.send("Mauvais filtre !");
	if(!args[1]) return message.channel.send("Renseignez une recherche !");
	//endpoint et recherche
	var apiEndpoint = "https://mhw-db.com/"+type+"/";
	var search = util.stringifyArray(args.slice(1));

	request(apiEndpoint, function(error, response, body){
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			message.channel.send("Ok");
		}
		else {
			console.log(error);
			message.channel.send("Une erreur s'est produite lors de l'accès à mhw-db.com.");
		}
	});
}

module.exports.config = {
	command: "find",
	syntax: "find{type d'objet} [objet à chercher]",
	description: "Recherche un objet du jeu. Il faut renseigner le type d'objet à rechercher juste à côté de find."
}