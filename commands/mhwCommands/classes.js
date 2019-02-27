const request = require("request");
const util = require("./util.js");
const Discord = require("discord.js");
const sqlite3 = require("sqlite3");

class Loadout {
	static getSlots(row) {
		var usedSlots = new Array();
		if(row.weapon) usedSlots.push("weapon");
		if(row.charm) usedSlots.push("charm");
		if(row.head) usedSlots.push("head");
		if(row.chest) usedSlots.push("chest");
		if(row.gloves) usedSlots.push("gloves");
		if(row.waist) usedSlots.push("waist");
		if(row.legs) usedSlots.push("legs");

		if(usedSlots.length == 0) return `Loadout is empty. [${row.note}]`;
		else return `Contains: ${usedSlots.join(", ")}. [${row.note}]`
	}
}

module.exports = {
	Loadout: Loadout
}

module.exports.run = async(client, message, args) => {
	//Cette commande doit rester vide
	//C'est un fichier qui contient des commandes utiles
}

module.exports.config = {
	command: "classes"
}