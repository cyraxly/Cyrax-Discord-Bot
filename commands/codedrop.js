const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'codedrop',
  description: 'Drop a random code snippet (Coming Soon).',
  execute(message, args) {
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Code Drop - Coming Soon!')
      .setDescription('We are currently working on bringing you an awesome collection of random code snippets. Stay tuned!')
      .addField('Exciting Features Ahead', 'Our team is building a custom API to provide you with high-quality, useful code snippets. In the meantime, keep coding and stay awesome!')
      .addField('What to Expect', 'You will be able to receive random code snippets in various languages, including HTML, CSS, JavaScript, Python, and more.')
      .setTimestamp()
      .setFooter({ text: 'Cyrax', iconURL: 'https://media.discordapp.net/attachments/1258790867603558403/1261694082800160768/CyraxBanner.png?ex=66948c6e&is=66933aee&hm=31375f6e45698410edf5b0f4f2097f3a9fca0a21cdc103faea79aec86853b36c&=&format=webp&quality=lossless&width=550&height=343' });

    message.channel.send({ embeds: [embed] });
  },
};
