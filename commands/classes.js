const config = require('../json/config.json');
const Discord = require('discord.js');

class LootTable {
	constructor(row) {
		this.items = ["superRare","rare","uncommon","common"];

		this.weightedArray = new Array();
		this.probabilities = new Array();

		this.probabilities.push(row.superRare*100);
		this.probabilities.push(row.rare*100);
		this.probabilities.push(row.uncommon*100);
		this.probabilities.push(row.common*100);

		this.generateWeightedArray();
	}

	generateWeightedArray() {
		for(var i in this.probabilities) {
			for(var j=0; j<this.probabilities[i]; j++) {
				this.weightedArray.push(this.items[i]);
			}
		}
	}

	roll() {
		var random = Math.random()*(this.weightedArray.length-1);
		random = Math.ceil(random);
		return this.weightedArray[random];
	}
}

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

	static vowelCheck(string) {
		var res = "";
		if(string.match(/^(a|e|i|o|u|A|E|I|O|U).*/gm)) res = "an "+string;
		else res = "a "+string;

		return res;
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

	static toAsciiString(row) {
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

	removeFromInventory(itemId,quantity,type) {
		this.database.get("SELECT * FROM Inventory WHERE userId = ? AND itemId = ?", [this.ownerId, itemId], (err,row) => {
			if(row.quantity-quantity >= 1) this.database.run("UPDATE Inventory SET quantity = ? WHERE userId = ? AND itemId = ?", [row.quantity-quantity, this.ownerId, itemId]);
			else this.database.run("DELETE FROM Inventory WHERE userId = ? AND itemId = ?",[this.ownerId,itemId]);
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

			channel.send(`Do you want to buy ${Manager.vowelCheck(row.name)} booster ? \`(yes/no)\``);
			var collector = new Discord.MessageCollector(channel,m=>m.author.id === this.ownerId, {time:10000});

			collector.on('collect', (mess) => {
				if(mess.content === "no") collector.stop("abort");
				else if(mess.content === "yes") collector.stop("validate");
			});

			collector.on('end', (collected,reason) => {
				switch(reason) {
					case 'time': channel.send("You took too much time to answer."); break;
					case 'abort': channel.send("Booster opening aborted."); break;
					case 'validate':
						this.database.get("SELECT * FROM Users WHERE userId = ?", [this.ownerId], (err,row) => {
							//Si assez de crédits
							if(row.credits >= rowB.price) {
								this.editBalance(-rowB.price);
								this.insertIntoInventory(boosterId,1,"booster");
								channel.send(`You bought ${Manager.vowelCheck(rowB.name)} booster for ${rowB.price} ${config.currency}.`);
							}
							else {
								return channel.send("You don't have enough "+config.currency+".");
							}					
						});
					break;
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
					var temp = DoggoManager.toAsciiString(row)+`\nQuantity :: ${row.quantity}\n\n`;
					list+=temp;
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
					var temp = BoosterManager.toAsciiString(row)+`\nQuantity :: ${row.quantity}\n\n`;
					list+=temp;
				});

				channel.send(Manager.asciiDoc(list));
			});
		}
		else return false;
	}

	openBooster(channel,booster) {
		//Vérifier si le booster existe dans la BD
		this.database.get("SELECT * FROM Boosters WHERE boosterId = ?",[booster], (err,row) => {
			//console.log(row);
			if(!row) return channel.send("This booster does not exist.");

			channel.send(`Do you want to open ${Manager.vowelCheck(row.name)} booster ? \`(yes/no)\``);
			var collector = new Discord.MessageCollector(channel,m=>m.author.id === this.ownerId, {time:10000});

			collector.on('collect', (mess) => {
				if(mess.content === "no"){
					//mess.delete();
					collector.stop("abort");
				}
				else if(mess.content === "yes"){
					//mess.delete();
					collector.stop("validate");
				}
			});

			collector.on('end', (collected,reason) => {
				switch(reason) {
					case 'time': channel.send("You took too much time to answer."); break;
					case 'abort': channel.send("Booster opening aborted."); break;
					case 'validate':
						//boosterId, common, uncommon, rare, superRare, userId, type, itemId, quantity, name, price
						//Si le booster n'existe pas ou qu'il ne l'a pas retourne aucune ligne
						var sql = "SELECT * FROM DropRates D JOIN Inventory I ON I.itemId = D.boosterId JOIN Boosters B ON B.boosterId = D.boosterId WHERE I.itemId IN (SELECT itemId FROM Inventory WHERE type = 'booster' AND itemId = ? AND userId = ?)";
						this.database.get(sql, [booster,this.ownerId], (err,row) => {
							if(!row) channel.send("You do not have this booster in your inventory.");
							else {
								//tirage de la rareté
								var loot = new LootTable(row);
								var rarity = loot.roll();
								//console.log(rarity);
								//choisir un doggo parmi la collection choisie et la rareté tirée
								this.database.all("SELECT * FROM Doggos WHERE rarity = ? AND collection = ?", [rarity,booster], (err,rows) => {
									//console.log(rows);
									var i = Math.random()*(rows.length-1);
									i = Math.ceil(i);
									this.insertIntoInventory(rows[i].doggoId,1,"doggo");
									this.removeFromInventory(booster,1,"booster");
									channel.send(`By opening this booster, you gained ${Manager.vowelCheck(rows[i].name)}!`);
								});
							}
						});
					break;
				}
			});
		});
	}
}

class DoggoManager extends Manager {
	constructor(database,ownerId) {
		super(database);
		this.ownerId = ownerId;
	}

	static toAsciiString(row) {
		return `${row.name} (${row.rarity} doggo) :: ${row.price}${config.currency}\nCollection :: ${row.collection}\nEfficiency :: ${row.efficiency}`;
	}
}

module.exports = {
	Manager : Manager,
	BoosterManager : BoosterManager,
	InventoryManager : InventoryManager,
	DoggoManager : DoggoManager,
	LootTable : LootTable
}

module.exports.config = {
	command: "classes"
}