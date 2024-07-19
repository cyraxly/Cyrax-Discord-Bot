const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'warn',
  description: 'Warn a user in the server',
  execute(message, args) {
    // Check if the user has permissions to warn members
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Insufficient Permissions')
        .setDescription('You do not have permissions to warn members.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [noPermissionEmbed] });
    }

    // Mentioned user to warn
    const user = message.mentions.users.first();
    if (!user) {
      const noUserEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('User Not Specified')
        .setDescription('Please mention the user to warn.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [noUserEmbed] });
    }

    // Get the member object of the mentioned user
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

    // Check if a reason is provided, default to 'No reason provided'
    const reason = args.slice(1).join(' ') || 'No reason provided';

    // Send a DM to the warned user
    try {
      user.send(`You have been warned in ${message.guild.name} for: ${reason}`);
    } catch (err) {
      console.error('Failed to send DM to user:', err);
    }

    // Log the warning in a log channel (optional)

    // Send embed message confirming the warning
    const warnEmbed = new MessageEmbed()
      .setColor('#FFFF00')
      .setTitle('User Warned')
      .setDescription(`${user.tag} has been warned.`)
      .addField('Reason', reason)
      .addField('Moderator', message.author.tag)
      .setTimestamp()
      .setFooter('Cyrax.');

    message.channel.send({ embeds: [warnEmbed] });
  },
};
