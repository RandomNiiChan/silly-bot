module.exports = (client, message) => {
  const config = require('../json/config.json');

  const prefix = config.prefix;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(message.isMentioned(client.users.get(client.user.id))) message.channel.send({file: "assets/pingGif.gif"});

  if(!message.content.startsWith(prefix) || message.author.bot) return;

  if(command === "reload")
  {
    loadCmds();
    message.channel.send(`beep beep boop commands reloaded`);
  }

  var cmd = client.commands.get(command);
  if(cmd) cmd.run(client, message, args);
};