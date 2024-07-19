const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kick a user and log the kick',
  usage: 'c!kick @user [reason]',
  async execute(message, args) {
    if (!message.member.permissions.has('KICK_MEMBERS')) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Insufficient Permissions')
        .setDescription('You do not have permissions to kick members.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [noPermissionEmbed] });
    }

    const user = message.mentions.users.first();
    if (!user) {
      const noUserEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('User Not Specified')
        .setDescription('Please mention the user to kick.')
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

    // Check if the bot can kick the user
    if (!member.kickable) {
      const notKickableEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('User Not Kickable')
        .setDescription('I cannot kick that user, they may have a higher role than me or I do not have the necessary permissions.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [notKickableEmbed] });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      // Kick the member
      await member.kick(reason);

      // Create or read kick list
      const kickListPath = './kicked-users.json';
      let kickList = [];
      
      if (fs.existsSync(kickListPath)) {
        const data = fs.readFileSync(kickListPath);
        kickList = JSON.parse(data);
      }

      // Add new kick record
      const newKick = {
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
      kickList.push(newKick);

      // Write to JSON file
      fs.writeFileSync(kickListPath, JSON.stringify(kickList, null, 2));

      // Optional: Create and send kick panel embed
      const kickedEmbed = new MessageEmbed()
        .setColor('#FFA500')
        .setTitle('User Kicked')
        .setDescription(`${user.tag} has been kicked.`)
        .addField('Reason', reason)
        .addField('Moderator', message.author.tag)
        .setTimestamp()
        .setFooter('Cyrax.');

      const kickPanelChannelId = 'YOUR_KICK_PANEL_CHANNEL_ID'; // Replace with your kick panel channel ID
      const kickPanelChannel = message.guild.channels.cache.get(kickPanelChannelId);
      if (kickPanelChannel) {
        const kickPanelEmbed = new MessageEmbed()
          .setColor('#FFA500')
          .setTitle('Kicked Users')
          .setDescription('List of kicked users:')
          .setTimestamp()
          .setFooter('Cyrax.');

        kickList.forEach(kick => {
          kickPanelEmbed.addField(`${kick.user.tag}`, `Moderator: ${kick.moderator.tag}\nReason: ${kick.reason}`);
        });

        kickPanelChannel.send({ embeds: [kickPanelEmbed] });
      }

      message.channel.send({ embeds: [kickedEmbed] });

    } catch (err) {
      console.error('Error kicking member:', err);
      const kickErrorEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Error Kicking User')
        .setDescription('There was an error kicking the member.')
        .setTimestamp()
        .setFooter('Cyrax.');
      message.channel.send({ embeds: [kickErrorEmbed] });
    }
  },
};
