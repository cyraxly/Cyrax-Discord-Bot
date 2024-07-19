const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Ban a user and save them to the ban list',
  usage: 'c!ban @user [reason]',
  async execute(message, args) {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Insufficient Permissions')
        .setDescription('You do not have permissions to ban members.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [noPermissionEmbed] });
    }

    const user = message.mentions.users.first();
    if (!user) {
      const noUserEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('User Not Specified')
        .setDescription('Please mention the user to ban.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [noUserEmbed] });
    }

    const member = message.guild.members.resolve(user);
    if (!member) {
      const notInGuildEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('User Not Found')
        .setDescription("That user isn't in this guild.")
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [notInGuildEmbed] });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      // Ban the member
      await member.ban({ reason });

      // Create or read ban list
      const banListPath = './banned-users.json';
      let banList = [];
      
      if (fs.existsSync(banListPath)) {
        const data = fs.readFileSync(banListPath);
        banList = JSON.parse(data);
      }

      // Add new ban record
      const newBan = {
        user: {
          id: user.id,
          tag: user.tag,
        },
        moderator: {
          id: message.author.id,
          tag: message.author.tag,
        },
        reason: reason,
        timestamp: new Date().toISOString(),
      };
      banList.push(newBan);

      // Write to JSON file
      fs.writeFileSync(banListPath, JSON.stringify(banList, null, 2));

      // Optional: Create and send ban panel embed
      const bannedEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('User Banned')
        .setDescription(`${user.tag} has been banned.`)
        .addField('Reason', reason)
        .addField('Moderator', message.author.tag)
        .setTimestamp()
        .setFooter('Cyrax.');

      const banPanelChannelId = 'YOUR_BAN_PANEL_CHANNEL_ID'; // Replace with your ban panel channel ID
      const banPanelChannel = message.guild.channels.cache.get(banPanelChannelId);
      if (banPanelChannel) {
        const banPanelEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('Banned Users')
          .setDescription('List of banned users:')
          .setTimestamp()
          .setFooter('Cyrax.');

        banList.forEach(ban => {
          banPanelEmbed.addField(`${ban.user.tag}`, `Moderator: ${ban.moderator.tag}\nReason: ${ban.reason}`);
        });

        banPanelChannel.send({ embeds: [banPanelEmbed] });
      }

      message.channel.send({ embeds: [bannedEmbed] });

    } catch (err) {
      console.error('Error banning member:', err);
      const banErrorEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Error Banning User')
        .setDescription('There was an error banning the member.')
        .setTimestamp()
        .setFooter('Cyrax.');
      message.channel.send({ embeds: [banErrorEmbed] });
    }
  },
};
