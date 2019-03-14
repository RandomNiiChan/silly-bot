module.exports.run = async(client, message, args) => {
	const config = require("../json/config.json");
	const Discord = require("discord.js");
	
	var profiles = client.databases.get("profiles");

	var embed = new Discord.RichEmbed();
	embed.setColor(config.embedColor);

	if(message.mentions.users.first()) var user = message.mentions.users.first();
	else var user = message.author;

	profiles.get("SELECT * FROM Users WHERE userId = ?",[user.id], (err,row) => {
		embed.setTitle(user.tag);
		embed.setDescription(row.bio);
		embed.addField("Level "+row.level, "XP: "+row.xp+"/"+row.nextLevel);
		embed.addField("Balance",row.credits+" "+config.currency);
		embed.setThumbnail(user.avatarURL);

		message.channel.send(embed);
	});
}

module.exports.config = {
	command: "profile",
	syntax: "profile {user}",
	description: "Returns your profile. If a user is mentioned, it will display the mentioned user's profile instead."
}