module.exports.run = async(client, message, args) => {
	const config = require("../json/config.json");
	const Discord = require("discord.js");
	const request = require('request');

	var apiTarget = 'https://dog.ceo/api/breeds/image/random';

	request(apiTarget, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			const json = JSON.parse(body);
			var embed = new Discord.RichEmbed();
			if(json.status == "error")
			{
				embed.setTitle("Erreur "+json.code+" !");
				embed.setDescription(json.message);
				embed.setColor(config.embedColorError);
			}
			else
			{
				var url = json.message;
				var array = url.split('/');
				array = array.filter(function (el) {
					return (el != '' && el != 'https:');
				});
				var breed = array[2].replace("-"," ");
				embed.setTitle(`Random dog (${breed.charAt(0).toUpperCase()+breed.slice(1)})`);
				embed.setImage(url);
				embed.setColor(config.embedColor);
				embed.setFooter("https://dog.ceo/");
			}
			message.channel.send(embed);
		}
		else {
			console.log(error);
			message.channel.send('Une erreur est survenue.');
		}
	});
}

module.exports.config = {
	command: "dog",
	syntax: "dog",
	description: "Poste une photo de chien."
}