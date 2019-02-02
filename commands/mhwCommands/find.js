const request = require("request");
const util = require("./util.js");
const Discord = require("discord.js");

//module.exports.run = async(client,message,search) => {
module.exports.run = async(client,message,args) => {
	//gestion des erreurs
	var type = util.queryType(args[0]);
	if(!type) return message.channel.send("This filter is unsupported !");
	if(!args[1]) return message.channel.send("Please input a query !");
	//endpoint et recherche
	var apiEndpoint = "https://mhw-db.com/"+type+"/";
	var search = util.stringifyArray(args.slice(1));

	request(apiEndpoint, function(error, response, body){
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			var results = util.filterResults(data,search);

			message.channel.send(util.searchResults(results,search,type));
		}
		else {
			console.log(error);
			message.channel.send("An error has occured while accessing the database.");
		}
	});
}

module.exports.config = {
	command: "find",
	syntax: "find{type d'objet} [objet à chercher]",
	description: "Recherche un objet du jeu. Il faut renseigner le type d'objet à rechercher juste à côté de find."
}