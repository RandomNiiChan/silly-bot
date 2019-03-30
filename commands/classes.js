const config = require('../json/config.json');

class Manager {
	constructor(database) {
		this.database = database;
	}

	static asciiDoc(text) {
		return "```asciidoc\n"+text+"```";
	}

	static sliceArray(array,threshold,section) {
		if(array.length>threshold)
		{
			var maxSection = Math.floor(array.length/threshold);
			if(section > maxSection) return false;
			else return array.slice(threshold*section, threshold*(section+1));
		}
		else return array;
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

	static boosterToAsciiString(row) {
		return `${row.name} (collection ${row.collection}) :: ${row.price}${config.currency}`;
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

	viewInventory(channel,mode,page,threshold) {
		if(mode=="doggo") {
			var sql = "SELECT * FROM Inventory I JOIN Doggos D ON I.itemId = D.doggoId WHERE I.userId = ? AND I.type = ?";
			this.database.all(sql, [this.ownerId,mode], (err,rows) => {
				
				var maxPage = Math.ceil(rows.length/threshold);
				page = maxPage<page ? maxPage : page;
				
				var list = "= Your doggo inventory (Page "+page+"/"+maxPage+")=\n\n";
				rows = Manager.sliceArray(rows,threshold,page-1);

				rows.forEach((row) => {
					list+=`${row.name} (${row.rarity} doggo) :: ${row.price}${config.currency}\nCollection :: ${row.collection}\nEfficiency :: ${row.efficiency}\n\n`;
				});

				channel.send(Manager.asciiDoc(list));
			});
		}
		else if(mode=="booster") {
			var sql = "SELECT * FROM Inventory I JOIN Boosters B ON B.boosterId = I.itemId WHERE I.userId = ? AND I.type = ?";
			this.database.all(sql, [this.ownerId,mode], (err,rows) => {

				var maxPage = Math.ceil(rows.length/threshold);
				page = maxPage<page ? maxPage : page;
				
				var list = "= Your booster inventory (Page "+page+"/"+maxPage+")=\n\n";
				rows = Manager.sliceArray(rows,threshold,page);

				rows.forEach((row) => {
					list+=`${row.name} (collection ${row.collection}) :: ${row.price}${config.currency}\n`;
				});

				channel.send(Manager.asciiDoc(list));
			});
		}
		else return false;
	}
}

class DoggoManager extends Manager {
	constructor(database,ownerId) {
		super(database);
		this.ownerId = ownerId;
	}

	static toAsciiString() {
		return `${row.name} (${row.rarity} doggo) :: ${row.price}${config.currency}\nCollection :: ${row.collection}\nEfficiency :: ${row.efficiency}`;
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
	InventoryManager : InventoryManager,
	DoggoManager : DoggoManager
}

module.exports.config = {
	command: "classes"
}