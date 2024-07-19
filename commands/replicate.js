const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'replicate',
  description: 'Replicates a webhook embed from a message link.',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      const noPermissionEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Insufficient Permissions')
        .setDescription('Only administrators can use this command.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [noPermissionEmbed] });
    }

    if (!args[0]) {
      const noArgsEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Missing Message Link')
        .setDescription('Please provide a message link to replicate.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [noArgsEmbed] });
    }

    const messageLink = args[0];
    const regex = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
    const match = messageLink.match(regex);

    if (!match) {
      const invalidLinkEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Invalid Message Link')
        .setDescription('Please provide a valid Discord message link.')
        .setTimestamp()
        .setFooter('Cyrax.');
      return message.channel.send({ embeds: [invalidLinkEmbed] });
    }

    const guildId = match[1];
    const channelId = match[2];
    const messageId = match[3];

    try {
      const channel = await message.client.channels.fetch(channelId);
      const fetchedMessage = await channel.messages.fetch(messageId);

      if (!fetchedMessage) {
        const noMessageEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('Message Not Found')
          .setDescription('Unable to find the specified message.')
          .setTimestamp()
          .setFooter('Cyrax.');
        return message.channel.send({ embeds: [noMessageEmbed] });
      }

      // Replicate the embed
      const replicatedEmbed = new MessageEmbed()
        .setColor(fetchedMessage.embeds[0].color)
        .setTitle(fetchedMessage.embeds[0].title)
        .setDescription(fetchedMessage.embeds[0].description)
        .addFields(fetchedMessage.embeds[0].fields)
        .setTimestamp()
        .setFooter('Cyrax');

      // Ask for destination channel
      const promptEmbed = new MessageEmbed()
        .setColor('#3498DB')
        .setTitle('Replicate Embed')
        .setDescription('Please mention the channel where you want to send the replicated embed.')
        .setTimestamp()
        .setFooter('Cyrax.');

      const promptMessage = await message.channel.send({ embeds: [promptEmbed] });

      const filter = m => {
        const channelMentionRegex = /<#(\d+)>/;
        const channelIdRegex = /^(\d+)$/;

        // Check if the message content matches channel mention or channel ID
        return (channelMentionRegex.test(m.content.trim()) || channelIdRegex.test(m.content.trim())) && m.author.id === message.author.id;
      };

      const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

      collector.on('collect', async m => {
        let destinationChannelId = m.content.trim();
        if (destinationChannelId.startsWith('<#') && destinationChannelId.endsWith('>')) {
          destinationChannelId = destinationChannelId.slice(2, -1); // Extract channel ID from mention
        }

        const destinationChannel = await message.client.channels.fetch(destinationChannelId);
        
        if (!destinationChannel) {
          const invalidChannelEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Invalid Channel Mentioned')
            .setDescription('Could not find the mentioned channel.')
            .setTimestamp()
            .setFooter('Cyrax.');
          return message.channel.send({ embeds: [invalidChannelEmbed] });
        }

        await destinationChannel.send({ embeds: [replicatedEmbed] });
        collector.stop();
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          const timeoutEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Command Timeout')
            .setDescription('No destination channel mentioned; command timed out.')
            .setTimestamp()
            .setFooter('Cyrax.');
          promptMessage.edit({ embeds: [timeoutEmbed] });
        }
      });

    } catch (error) {
      console.error('Error replicating embed:', error);
      const errorEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('There was an error replicating the embed.')
        .setTimestamp()
        .setFooter('Cyrax.');
      message.channel.send({ embeds: [errorEmbed] });
    }
  },
};
