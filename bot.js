const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const fs = require('fs');
const { prefix, token, allowedChannelId, adminRoles } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();

// Read command files and set commands in the collection
try {
  const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`Command loaded: ${command.name}`);
  }
  console.log(`Total commands loaded: ${client.commands.size}`);
} catch (error) {
  console.error('Error loading commands:', error);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('with commands | under development', { type: 'PLAYING' }); // Set bot status
});

client.on('messageCreate', async message => {
  if (message.author.bot) return; // Ignore messages from other bots

  // Check if user has admin role or other staff roles
  const member = message.guild.members.cache.get(message.author.id);
  const isAdminOrStaff = member.roles.cache.some(role => adminRoles.includes(role.name));

  // Check if the message is in the allowed bot commands channel or if the user is an admin/staff
  if (message.channelId !== allowedChannelId && !isAdminOrStaff) {
    // Check if the message is a command
    if (message.content.startsWith(prefix)) {
      // Delete the message
      try {
        await message.delete();
      } catch (error) {
        console.error('Error deleting message:', error);
      }

      // Reply with a warning message
      const embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('🛑 Bot Usage Restricted')
        .setDescription(`This bot can only be used in <#${allowedChannelId}> channel. Please use bot commands there.`);

      try {
        await message.author.send({ embeds: [embed] });
        await message.channel.send(`Please use bot commands in <#${allowedChannelId}>.`, { allowedMentions: { repliedUser: false } });
      } catch (error) {
        console.error('Error sending DM or replying with embed:', error);
      }
      
      return; // Exit the message handling here to prevent further processing
    }
  }

  // Handle ping command
  if (message.content.toLowerCase() === `<@!${client.user.id}>` || message.content.toLowerCase() === `<@${client.user.id}>`) {
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('🤖 Bot Usage Information')
      .setDescription(`Hello! I'm a bot designed to assist you with various commands. If you're unsure how to use me, try using \`${prefix}help\` to see a list of available commands and their usage.`)
      .setFooter(`Prefix: ${prefix}`);

    try {
      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    } catch (error) {
      console.error('Error replying with embed:', error);
    }
    return; // Exit the message handling here since a valid bot mention was detected
  }

  // Command handling
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  console.log(`Prefix: ${prefix}`);
  console.log(`Command Name: ${commandName}`);

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    await command.execute(message, args); // Execute the command
  } catch (error) {
    console.error('Error executing command:', error);
    try {
      await message.reply('There was an error executing that command.', { allowedMentions: { repliedUser: false } });
    } catch (replyError) {
      console.error('Error replying with error message:', replyError);
    }
  }
});

client.login(token);
