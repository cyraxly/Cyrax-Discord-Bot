const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { prefix } = require('../config.json');

module.exports = {
  name: 'help',
  description: 'Displays list of available commands and their usage.',
  execute(message, args) {
    const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Command List')
      .setDescription('Here is a list of available commands and their usage:');

    for (const file of commandFiles) {
      const command = require(`./${file}`);
      embed.addField(`**${prefix}${command.name}**`, `${command.description}\n`);
    }

    message.reply({ embeds: [embed] });
  },
};
