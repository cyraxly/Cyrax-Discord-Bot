const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  description: 'Display information about the server',
  execute(message) {
    const guild = message.guild;
    if (!guild) {
      return message.channel.send('Cannot find server information.');
    }

    const ownerId = '599360553218998272'; // Replace with actual user ID
    const ownerMention = `<@${ownerId}>`;

    // Build the embed
    const embed = new MessageEmbed()
      .setColor('#3498DB')
      .setTitle(`Server Information - ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }) || '')
      .setDescription(`Server owner: ${ownerMention}`)
      .addFields(
        { name: 'Member Count', value: guild.memberCount.toString(), inline: true },
        { name: 'Boost Tier', value: guild.premiumTier ? guild.premiumTier.toString() : 'None', inline: true },
        { name: 'Boost Count', value: guild.premiumSubscriptionCount.toString(), inline: true },
        { name: 'Created At', value: guild.createdAt ? guild.createdAt.toLocaleDateString() : 'Unknown', inline: true }
      )
      .setTimestamp()
      .setFooter('Cyrax.');

    message.channel.send({ embeds: [embed] });
  },
};
