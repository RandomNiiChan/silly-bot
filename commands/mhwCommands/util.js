const config = require("../../json/config.json");
const Discord = require("discord.js");

function normalize(string)
{
	string = string.toLowerCase();
	return string.charAt(0).toUpperCase() + string.substr(1);
}
module.exports.normalize = normalize;

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

function queryType(command)
{
	var element = command.slice(4);
	if(element === "a") return "armor";
	else if(element === "w") return "weapons";
	else if(element === "c") return "charms";
	else if(element === "d") return "decorations";
	else if(element === "i") return "items";
	else if(element === "s") return "skills";
	else return false;
}
module.exports.queryType = queryType;

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

//Convertit une string en asciidoc pour discord
function convertAsciidoc(text)
{
	return "```asciidoc\n"+text+"```";
}
module.exports.convertAsciidoc = convertAsciidoc;

function filterResults(response, query)
{
	var regex = new RegExp(query.toLowerCase().replace(" ",".*"),'gm');
	var array = response.filter(function(v) {
		return v.name.toLowerCase().match(regex);
	});
	return array;
}
module.exports.filterResults = filterResults;

function searchResults(results,search,type)
{
	if(results.length > 0) var res = `= ${results.length} ${type} matching "${search}" =\n\n`;
	else return `No ${type} found for ${search}.`;
	for(var i in results) res+=results[i].name+"\n";
	return convertAsciidoc(res);
}
module.exports.searchResults = searchResults;

module.exports.run = async(client, message, args) => {
	//Cette commande doit rester vide
	//C'est un fichier qui contient des commandes utiles
}

module.exports.config = {
	command: "util"
}