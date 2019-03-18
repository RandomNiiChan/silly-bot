const config = require("../../json/config.json");
const Discord = require("discord.js");

function normalize(string)
{
	string = string.toLowerCase();
	return string.charAt(0).toUpperCase() + string.substr(1);
}
module.exports.normalize = normalize;

//Fonction auxilliaire pour la conversion des timestamp
//Si le chiffre est inférieur à 9 on rajoute un 0 avant
function twoDigits(number)
{
	if(number <= 9) return '0'+number;
	else return number;
}
module.exports.twoDigits = twoDigits;

//Générer la base d'un embed
function rootEmbed()
{
	var embed = new Discord.RichEmbed()
	.setColor(config.embedColor)
	.setThumbnail("https://cdn.glitch.com/049db61c-f3f3-4185-9d81-b3fa8dc6cb22%2Fwarframe.png?1545598146058");
	return embed;
}
module.exports.rootEmbed = rootEmbed;

//Générer une string à partir d'un timestamp
function timeString(timeCode)
{
	var stamp = new Date(timeCode);
	if(stamp == 'Invalid Date') return false;

	var hours = twoDigits(stamp.getHours());
	var minutes = twoDigits(stamp.getMinutes());
	var seconds = twoDigits(stamp.getSeconds());

	var day = twoDigits(stamp.getDate());
	var month = twoDigits(stamp.getMonth()+1);
	var year = ""+stamp.getYear();
	var year = twoDigits("20"+year.substr(-2));

	return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
module.exports.timeString = timeString;

//Convertit une string en asciidoc pour discord
function convertAsciidoc(text)
{
	return "```asciidoc\n"+text+"```";
}
module.exports.convertAsciidoc = convertAsciidoc;

//retourne l'information d'une fissure en tant qu'une string
function fissureInfo(fissure)
{
	var string = `[${fissure.node} - Fissure ${fissure.tier} (T${fissure.tierNum})]\n`;
	string+= `${fissure.missionType} ${fissure.enemy} - Se ferme dans ${fissure.eta}\n\n`;

	return string;
}
module.exports.fissureInfo = fissureInfo;

//retourne un embed qui affiche les informations du void trader
function voidTrader(trader,timestamp)
{
	//remplacer par des timestamp
	var embed = rootEmbed();
	if(trader.active)
	{
		embed.setTitle(`[${timeString(timestamp)}] Le marchand du néant ${trader.character} est arrivé !`);
		embed.setDescription(`Retrouvez-le ici: ${trader.location}`);
		embed.addField("Présent depuis",trader.startString.slice(1),true);
		embed.addField("Départ dans", trader.endString, true);
	}
	else
	{
		embed.setTitle(`[${timeString(timestamp)}] Le marchand du néant ${trader.character} arrive bientôt.`);
		embed.setDescription(`Vous pourrez le retrouver ici: ${trader.location}`);
		embed.addField("Arrive dans",trader.startString,true);
		embed.addField("Repart dans", trader.endString, true);
	}
	return embed;
}
module.exports.voidTrader = voidTrader;

//Prend un array, et en extrait la x-ième page (la taille des page est à mettre en arguments)
function arraySlicer(array,threshold,section)
{
	if(array.length>threshold)
	{
		var maxSection = Math.floor(array.length/threshold);
		if(section > maxSection) return false;
		else return array.slice(threshold*section, threshold*(section+1));
	}
	else return array;
}
module.exports.arraySlicer = arraySlicer;

//Savoir si un nombre est in entier naturel
function isNormalInteger(str)
{
	var n = Math.floor(Number(str));
	return String(n) === str && n > 0;
}
module.exports.isNormalInteger = isNormalInteger;

//Prend un tableau et l'affiche sous forme d'une string
//les éléments sont séparés par des espaces
function stringifyArray(array)
{
	var ret = "";
	for(var i=0; i<array.length; i++)
	{
		if(i==array.length-1) ret+=array[i];
		else ret+=array[i]+" ";
	}
	return ret;
}
module.exports.stringifyArray = stringifyArray;

//prend une réponse du warmarket et une recherche utilisateur
//retourne la liste des objets correspondant à la recherche sous la forme d'asciidoc
function itemList(response,query)
{
	var array = response.filter(function(v) {
		return v.item_name.toLowerCase().includes(query.toLowerCase());
	});
	var itemArray = array.slice(0,10);

	var display = `= Résultats de la recherche pour "${query}" =\n`;
	if(array.length > 10) display+="[Seuls les 10 premiers objets sont affichés; affinez votre recherche pour plus de précision.]\n";
	if(array.length == 0) return convertAsciidoc(display+="[Aucun résultat. Vérifiez bien que les termes entrés soient corrects !]\n");
	display+="\n";

	for(var i=0; i<itemArray.length; i++)
	{
		display+="* "+itemArray[i].item_name+"\n";
	}
	return convertAsciidoc(display);
}
module.exports.itemList = itemList;

//Convertit un urlcode de warmarket en String normalisée
function urlConvert(search)
{
	return stringifyArray(search).toLowerCase().replace(/ /g,"_");
}
module.exports.urlConvert = urlConvert;

//La même chose de urlConvert mais l'inverse
function urlReverse(code)
{
	var string = "";
	var array = code.split("_");
	for(var i in array)
	{
		if(i == array.length-1) string+=array[i].charAt(0).toUpperCase()+array[i].slice(1);
		else string+=array[i].charAt(0).toUpperCase()+array[i].slice(1)+" ";
	}
	return string;
}
module.exports.urlReverse = urlReverse;

//retourne les offres de vente actives des utilisateurs en ligne et en jeu
function getActiveSellers(orders)
{
	return orders.filter(function(o){
		return o.visible && o.order_type == "sell" && (o.user.status == "online" || o.user.status == "ingame");
	});
}
module.exports.getActiveSellers = getActiveSellers;

//retourne le nombre d'offres de ventes des utilisateurs en jeu
//(selon un statut: ingame, online, offline)
function getStatusCount(status,orders)
{
	var count = orders.filter(function(o){
		return o.user.status == status;
	});
	return count.length;
}
module.exports.getStatusCount = getStatusCount;

//Convertit une offre pour un objet en tant que string contenant ses informations
function sellingOrder(order)
{
	var seller = order.user;
	var statusTag = (seller.status == "online" ? "En ligne" : "En jeu");
	return `[${seller.ingame_name} (${seller.reputation} rep) // ${statusTag}]\n    Prix à l'unité: ${order.platinum}pl (stock: ${order.quantity})\n`;
}
module.exports.sellingOrder = sellingOrder;

function helpCard(command)
{
	var conf = command.config;
	return rootEmbed()
	.setTitle(`Commande ${conf.command}`)
	.setDescription(conf.description)
	.addField("Syntaxe", config.prefix+"warframe "+conf.syntax);
}
module.exports.helpCard = helpCard;

function aboutAlert(alert,rank)
{
	if(alert.mission.description) var alertstring = `[${parseInt(rank)+1} - ${alert.mission.description} - ${alert.mission.type} ${alert.mission.faction} (${alert.eta} restant)]\n`;
	else var alertstring = `[${parseInt(rank)+1} - ${alert.mission.type} ${alert.mission.faction} (${alert.eta} restant)]\n`;

	var minlevel = alert.mission.minEnemyLevel;
	var maxlevel = alert.mission.maxEnemyLevel;
	alertstring += `${alert.mission.node} (niveaux ${minlevel}-${maxlevel}) / Récompense(s): ${alert.mission.reward.asString}\n\n`;

	return alertstring;
}
module.exports.aboutAlert = aboutAlert;

module.exports.run = async(client, message, args) => {
	//Cette commande doit rester vide
	//C'est un fichier qui contient des commandes utiles
	message.channel.send("ALEEEEEED");
}

module.exports.config = {
	command: "util"
}