const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'mute',
  description: 'Mute a user in the server',
  async execute(message, args) {
    if (!message.member.permissions.has('MUTE_MEMBERS')) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Insufficient Permissions')
        .setDescription('You do not have permissions to mute members.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [noPermissionEmbed] });
    }

    const user = message.mentions.users.first();
    if (!user) {
      const noUserEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('User Not Specified')
        .setDescription('Please mention the user to mute.')
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

    // Check if the bot can mute the user
    if (!member.manageable) {
      const notMuteableEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('User Not Muteable')
        .setDescription('I cannot mute that user, they may have a higher role than me or I do not have the necessary permissions.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [notMuteableEmbed] });
    }

    // Mute role handling (assuming a mute role exists)
    const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) {
      const noMuteRoleEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Muted Role Not Found')
        .setDescription('Could not find a "Muted" role. Please create one with the necessary permissions.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [noMuteRoleEmbed] });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      // Add the mute role to the member
      await member.roles.add(muteRole, reason);

      // Inform the user and log the mute
      const mutedEmbed = new MessageEmbed()
        .setColor('#FFA500')
        .setTitle('User Muted')
        .setDescription(`${user.tag} has been muted.`)
        .addField('Reason', reason)
        .addField('Moderator', message.author.tag)
        .setTimestamp()
        .setFooter('Cyrax.');

      message.channel.send({ embeds: [mutedEmbed] });

    } catch (err) {
      console.error('Error muting member:', err);
      const muteErrorEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Error Muting User')
        .setDescription('There was an error muting the member.')
        .setTimestamp()
        .setFooter('Cyrax.');
      message.channel.send({ embeds: [muteErrorEmbed] });
    }
  },
};
