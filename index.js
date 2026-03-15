import { Client, GatewayIntentBits, Events, SlashCommandBuilder, ActivityType } from 'discord.js';
import { DISCORD_TOKEN, GUILD_ID } from './config.js';
import { googleSearch } from './utils/googleSearch.js';
import { openRouterChat } from './utils/openRouter.js';
import { generateImage } from './utils/imageGen.js';

if (!DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN');
  process.exit(1);
}
if (!GUILD_ID) {
  console.error('Missing GUILD_ID');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Build the slash commands once
const slashCommands = [
  new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search Google and summarize results')
    .addStringOption(opt => opt.setName('query').setDescription('Search query').setRequired(true)),
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the AI anything')
    .addStringOption(opt => opt.setName('question').setDescription('Your question').setRequired(true)),
  new SlashCommandBuilder()
    .setName('imagine')
    .setDescription('Generate an image from text')
    .addStringOption(opt => opt.setName('prompt').setDescription('Image prompt').setRequired(true)),
  new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Get a savage gamer roast')
].map(cmd => cmd.toJSON());

client.once(Events.ClientReady, async () => {
  console.log(`🔥 Logged in as ${client.user.tag}`);
  try {
    // Register commands in your guild only (instant update)
    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.commands.set(slashCommands);
    console.log('✅ Slash commands registered to the guild.');
  } catch (err) {
    console.error('Failed to register guild commands:', err);
  }

  client.user.setActivity('WWM Guides | /ask /imagine', { type: ActivityType.Watching });
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;
  await interaction.deferReply();

  try {
    if (cmd === 'search') {
      const q = interaction.options.getString('query', true);
      const results = await googleSearch(q);

      if (!results.length) {
        await interaction.editReply('No results found or search failed.');
        return;
      }

      // Summarize results with AI: pass titles+links for short summary
      const summaryPrompt = `Summarize these sources briefly for a gamer asking about: ${q}\n\n` +
        results.map((r, i) => `${i+1}. ${r.title} — ${r.link}`).join('\n');

      const summary = await openRouterChat(summaryPrompt);
      await interaction.editReply(`**Search summary:**\n${summary}\n\n**Sources:**\n${results.map(r => `- ${r.title}\n  ${r.link}`).join('\n')}`);
    }

    else if (cmd === 'ask') {
      const question = interaction.options.getString('question', true);
      const ans = await openRouterChat(question);
      await interaction.editReply(ans);
    }

    else if (cmd === 'imagine') {
      const prompt = interaction.options.getString('prompt', true);
      const url = await generateImage(prompt);
      if (!url) {
        await interaction.editReply('Image generation failed. Try again or simplify the prompt.');
        return;
      }
      await interaction.editReply({ content: `🎨 **Prompt:** ${prompt}`, files: [url] });
    }

    else if (cmd === 'roast') {
      const roast = await openRouterChat('Give me a savage gamer roast, short and spicy.');
      await interaction.editReply(roast);
    }

  } catch (err) {
    console.error('Interaction error:', err);
    await interaction.editReply('❌ An error occurred. Check logs.');
  }
});

client.login(DISCORD_TOKEN);
