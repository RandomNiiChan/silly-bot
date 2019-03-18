const config = require('../json/config.json');

class Manager {
	constructor(database) {
		this.database = database;
	}

	static asciiDoc(text) {
		return "```asciidoc\n"+text+"```";
	}
}

class BoosterManager extends Manager{
	constructor(database) {
		super(database);
	}

	list(channel) {
		this.database.all("SELECT * FROM Boosters", [], (err,rows) => {
			var string = "= Available Boosters =\n\n";
			rows.forEach((row)=>{
				string+=`${row.boosterId} :: ${row.name} - ${row.price}$\n`;
			});

			channel.send(Manager.asciiDoc(string));
		});
	}

	inspect(channel,booster) {
		this.database.get("SELECT * FROM Boosters B JOIN dropRates D ON B.boosterId = D.boosterId WHERE B.boosterId = ?", [booster], (err,row) => {
			var string = `= ${row.name}'s statistics =\n\n`;
			string+="Common doggo probability :: "+row.common*100+"%\n";
			string+="Uncommon doggo probability :: "+row.uncommon*100+"%\n";
			string+="Rare doggo probability :: "+row.rare*100+"%\n";
			string+="Super rare doggo probability :: "+row.superRare*100+"%\n";

			channel.send(Manager.asciiDoc(string));
		});
	}
}

class InventoryManager extends Manager {
	constructor(database,ownerId) {
		super(database);
		this.ownerId = ownerId;
	}

	insertIntoInventory(itemId,quantity,type) {
		this.database.get("SELECT * FROM Inventory WHERE userId = ? AND itemId = ?", [this.ownerId, itemId], (err,row) => {
			if(row) {
				this.database.run("UPDATE Inventory SET quantity = ? WHERE userId = ? AND itemId = ?", [row.quantity+quantity, this.ownerId, itemId]);
			}
			else {
				this.database.run("INSERT INTO Inventory(userId,type,itemId,quantity) VALUES(?,?,?,?)",[this.ownerId,type,itemId,quantity]);
			}
		});
	}

	editBalance(amount) {
		this.database.get("SELECT * FROM Users WHERE userId = ?", [this.ownerId], (err,row) => {
			this.database.run("UPDATE Users SET credits =  ? WHERE userId = ?", [row.credits + amount, this.ownerId]);
		});
	}

	buyBooster(channel,boosterId) {
		//récupérer le booster
		this.database.get("SELECT * FROM Boosters WHERE boosterId = ?",[boosterId], (err,rowB) => {
			//Si il n'existe pas
			if(!rowB) return channel.send("This booster doesn't exist.");
			this.database.get("SELECT * FROM Users WHERE userId = ?", [this.ownerId], (err,row) => {
				//Si assez de crédits
				if(row.credits >= rowB.price) {
					this.editBalance(-rowB.price);
					this.insertIntoInventory(boosterId,1,"booster");
					//conjugaison
					if(rowB.name.match(/^(a|e|i|o|u|y|A|E|I|O|U|Y).*/gm))
						channel.send(`You bought an ${rowB.name} booster for ${rowB.price} ${config.currency}.`);
					else 
						channel.send(`You bought a ${rowB.name} booster for ${rowB.price} ${config.currency}.`);
				}
				else {
					return channel.send("You don't have enough "+config.currency+".");
				}					
			});
		});
	}
}

module.exports.run = async(client, message, args) => {
	//Cette commande doit rester vide
	//C'est un fichier qui contient des commandes utiles
	message.channel.send("ALEEEEEED");
}

module.exports = {
	Manager : Manager,
	BoosterManager : BoosterManager,
	InventoryManager : InventoryManager
}

module.exports.config = {
	command: "classes"
}