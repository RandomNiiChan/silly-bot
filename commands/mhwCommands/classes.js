const request = require("request");
const util = require("./util.js");
const Discord = require("discord.js");
const sqlite3 = require("sqlite3");

class Loadout {
	constructor(name, user) {
		this.userId = user.id;
		this.name = name;
		this.id = this.generateId();
	}

	get id() {
		return this._id;
	}

	set id(id) {
		this._id = id;
	}

	generateId() {
		return Math.floor(Math.random()*16777215).toString(16);
	}

	toString() {
		return `${this.userId} - ${this.name} - ${this.id}`;
	}

	static rowToString(row) {
		return `${row.name} - Contient: xxx, xxx, xxx\n`;
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