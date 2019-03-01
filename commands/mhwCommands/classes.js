const request = require("request");
const util = require("./util.js");
const Discord = require("discord.js");
const sqlite3 = require("sqlite3");

class Loadout {
	constructor(name,owner,row) {
		if(name!=null && owner != null && row == null) {
			this.owner = owner;
			this.name = name;

			this.note = null;
			this.weapon = null;
			this.charm = null;
			this.head = null;
			this.chest = null;
			this.gloves = null;
			this.waist = null;
			this.legs = null;

			this.id = null;
		}
		else if(row != null) {
			this.name = row.name;
			this.owner = row.userId;
			
			this.note = row.note;
			this.weapon = row.weapon;
			this.charm = row.charm;
			this.head = row.head;
			this.chest = row.chest;
			this.gloves = row.gloves;
			this.waist = row.waist;
			this.legs = row.legs;

			this.id = row.loadoutId;
		}
	}

	insertInto(database) {
		var args = [this.owner, this.name, ""]
		database.run("INSERT INTO Loadouts(userId,name,note) VALUES(?,?,?)", args, function(err) {
			if(err) {
				message.channel.send("An error has occured, OOF");
				return console.log(err.message);
			}
			console.log("A new loadout has been created, id: "+this.lastID);
		});
	}

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

	toString() {
		Loadout.getSlots(this)
	}
}

class Wearable {
	constructor(object) {
		this.availableSlots = object.slots;
	}

	toString() {

	}
}

module.exports = {
	Loadout: Loadout,
	Wearable: Wearable
}

module.exports.run = async(client, message, args) => {
	//Cette commande doit rester vide
	//C'est un fichier qui contient des commandes utiles
}

module.exports.config = {
	command: "classes"
}