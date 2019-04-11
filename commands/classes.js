const config = require('../json/config.json');
const Discord = require('discord.js');

class LootTable {
	constructor(rarities) {
		this.items = ["superRare","rare","uncommon","common"];

		this.weightedArray = new Array();
		this.probabilities = new Array();

		this.probabilities.push(rarities.superRare*100);
		this.probabilities.push(rarities.rare*100);
		this.probabilities.push(rarities.uncommon*100);
		this.probabilities.push(rarities.common*100);

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

	multiroll(rows) {

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
				string+=`${row.boosterId} :: ${row.name} - ${row.price}${config.currency}\n`;
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

			channel.send(`Do you want to buy ${Manager.vowelCheck(rowB.name)} booster for ${rowB.price}${config.currency} ? \`(yes/no)\``);
			var collector = new Discord.MessageCollector(channel,m=>m.author.id === this.ownerId, {time:10000});

			collector.on('collect', (mess) => {
				if(mess.content === "no") collector.stop("abort");
				else if(mess.content === "yes") collector.stop("validate");
			});

			collector.on('end', (collected,reason) => {
				switch(reason) {
					case 'time': channel.send("You took too much time to answer."); break;
					case 'abort': channel.send("Booster purchase aborted."); break;
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

	sellBooster(channel,boosterId) {
		//récupérer le booster
		this.database.get("SELECT * FROM Boosters B JOIN Inventory I ON I.itemId = B.boosterId WHERE boosterId = ? AND I.userId = ?",[boosterId,this.ownerId], (err,rowB) => {
			//Si il n'existe pas
			if(!rowB) return channel.send("You do not have this booster in your inventory.");

			channel.send(`Do you want to sell ${Manager.vowelCheck(rowB.name)} booster for ${rowB.price/2} ${config.currency} ? \`(yes/no)\``);
			var collector = new Discord.MessageCollector(channel,m=>m.author.id === this.ownerId, {time:10000});

			collector.on('collect', (mess) => {
				if(mess.content === "no") collector.stop("abort");
				else if(mess.content === "yes") collector.stop("validate");
			});

			collector.on('end', (collected,reason) => {
				switch(reason) {
					case 'time': channel.send("You took too much time to answer."); break;
					case 'abort': channel.send("Booster sale aborted."); break;
					case 'validate':
						this.database.get("SELECT * FROM Users WHERE userId = ?", [this.ownerId], (err,row) => {
							this.editBalance(rowB.price/2);
							this.removeFromInventory(boosterId,1,"booster");
							channel.send(`You sold ${Manager.vowelCheck(rowB.name)} booster for ${rowB.price/2} ${config.currency}.`);				
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
				rows.sort(function(x,y) {
					var map = {"common":1,"uncommon":2,"rare":3,"superRare":4};
					return (map[y.rarity]-map[x.rarity]);
				});
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
		var sql = "SELECT * FROM DropRates D JOIN Inventory I ON I.itemId = D.boosterId JOIN Boosters B ON B.boosterId = D.boosterId WHERE I.itemId IN (SELECT itemId FROM Inventory WHERE type = 'booster' AND itemId = ? AND userId = ?)";
		this.database.get(sql, [booster,this.ownerId], (err,row) => {
			if(!row) channel.send("You do not have this booster in your inventory.");
			else {
				channel.send(`Do you want to open ${Manager.vowelCheck(booster)} booster ? \`(yes/no)\``);
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
								channel.send(`By opening this booster, you gained ${Manager.vowelCheck(rows[i].name)} (${rows[i].rarity}) !`);
							});
						break;
					}
				});
			}
		});
	}

	sellDoggo(channel,doggo) {
		//récupérer le booster
		this.database.get("SELECT * FROM Doggos D JOIN Inventory I ON I.itemId = D.doggoId WHERE D.doggoId = ? AND I.userId = ?",[doggo,this.ownerId], (err,rowD) => {
			//Si il n'existe pas
			if(!rowD) return channel.send("You do not have this doggo in your inventory.");

			channel.send(`Do you want to sell ${Manager.vowelCheck(rowD.name)} doggo for ${rowD.price} ${config.currency} ? \`(yes/no)\``);
			var collector = new Discord.MessageCollector(channel,m=>m.author.id === this.ownerId, {time:10000});

			collector.on('collect', (mess) => {
				if(mess.content === "no") collector.stop("abort");
				else if(mess.content === "yes") collector.stop("validate");
			});

			collector.on('end', (collected,reason) => {
				switch(reason) {
					case 'time': channel.send("You took too much time to answer."); break;
					case 'abort': channel.send("Doggo sale aborted."); break;
					case 'validate':
						this.database.get("SELECT * FROM Users WHERE userId = ?", [this.ownerId], (err,row) => {
							this.editBalance(rowD.price);
							this.removeFromInventory(doggo,1,"doggo");
							channel.send(`You sold ${Manager.vowelCheck(rowD.name)} doggo for ${rowD.price} ${config.currency}.`);				
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
	}

	static inspect(doggo) {
		var embed = new Discord.RichEmbed();
		embed
			.attachFile(`./assets/doggos/${doggo.collection}/${doggo.doggoId}.jpg`)
			.setTitle(`${doggo.name} (${doggo.doggoId})`)
			.setDescription("Rarity: "+doggo.rarity)
			.setColor(config.embedColor)
			.setImage(`attachment://${doggo.doggoId}.jpg`)
			.addField('Selling price',doggo.price+" "+config.currency,true)
			.addField('Efficiency',doggo.efficiency,true)
			.addField('Collection',doggo.collection);
		return embed;
	}

	static toAsciiString(row) {
		return `${row.name} (${row.rarity} doggo) :: ${row.price}${config.currency}\nID :: ${row.doggoId}\nCollection :: ${row.collection}\nEfficiency :: ${row.efficiency}`;
	}
}

class Rift {
	//Creation du rift à partir d'une ligne sql
	constructor(row) {
		this.id = row.id;
		this.name = row.name;
		this.minReward = row.minReward;
		this.maxReward = row.maxReward;
		this.itemProb = row.itemProb;
		this.description = row.description;
		this.maxCapacity = row.maxCapacity;

		this.doggos = new Array();
		this.droppableItems = new Array();
		this.equippedItem = null;
	}

	assignItems(rows) {
		for(var row in rows) {

		}
	}

	generateRewardRaw() {
		return Math.floor(Math.random() * this.maxReward) + this.minReward;
	}

	generateReward() {
		var reward = 0;
		for(var d in this.doggos) {
			reward+=d.efficiency*this.generateRewardRaw();
		}
		return reward;
	}

	getItem() {
		if(Math.floor(Math.random()*100) < this.itemProb) {
			var item = this.droppableItems[Math.floor(Math.random()*this.droppableItems.length-1)];
			return item;
		}
		else return false;
	}

	getItems() {
		var items = new Array();
		for(var d in doggos) {
			var item = this.getItem();
			if(item) items.push(item);
		}
		return items;
	}

	run() {
		return {
			totalReward: this.generateReward(0),
			item: this.getItems()
		};
	}
}

class Item {
	constructor() {
		console.log('yes');
	}
}

class Doggo {
	constructor(row) {
		this.id = row.id;
		this.name = row.name;
		this.efficiency = efficiency;
	}
}

module.exports = {
	Manager : Manager,
	BoosterManager : BoosterManager,
	InventoryManager : InventoryManager,
	DoggoManager : DoggoManager,
	LootTable : LootTable,
	Item : Item
}

module.exports.config = {
	command: "classes"
}