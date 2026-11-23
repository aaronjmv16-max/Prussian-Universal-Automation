import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('logevent')
        .setDescription('Log and announce a Roblox event without a join button.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of Event')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Full Roblox Game URL')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time the Event is Hosted')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('host')
                .setDescription('The User of the Host')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('comments')
                .setDescription('Optional Comments')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const eventType = interaction.options.getString('type').trim();
            const gameLink = interaction.options.getString('link').trim();
            const hostTime = interaction.options.getString('time').trim();
            const hostUser = interaction.options.getUser('host');
            const comments = interaction.options.getString('comments');

            // Strictly require an HTTPS link
            let parsedUrl;
            try {
                parsedUrl = new URL(gameLink);
            } catch {
                return await interaction.reply({
                    content: '❌ Please provide a valid link starting with `https://`.',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('roblox.com')) {
                return await interaction.reply({
                    content: '❌ Only `https://` Roblox links are allowed (e.g., `https://roblox.com...`).',
                    flags: MessageFlags.Ephemeral
                });
            }

            const logChannel = interaction.guild.channels.cache.get('1574462575561801819');
            if (!logChannel) {
                return await interaction.reply({
                    content: '⚠️ Log channel not found. Check the channel ID in `logevent.js`.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const eventEmbed = new EmbedBuilder()
                .setColor(0xD6AB29)
                .setTitle(`📢 Event: ${eventType}`)
                .setURL(parsedUrl.href)
                .addFields(
                    { name: 'Host', value: `<@${hostUser.id}>`, inline: true },
                    { name: 'Scheduled Time', value: hostTime || 'TBA', inline: true },
                    { name: 'Game Link', value: parsedUrl.href, inline: false },
                    { name: 'Comments', value: comments && comments.trim().length > 0 ? comments.trim() : 'None', inline: false }
                )
                .setFooter({ text: `Logged by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await logChannel.send({
                content: '@everyone',
                embeds: [eventEmbed],
                allowedMentions: { parse: ['everyone'] }
            });

            await interaction.reply({ content: '✅ Event successfully logged!', flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error('❌ logevent error details:', JSON.stringify(error.rawError || error, null, 2));
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `❌ Failed to log event: \`${error.message}\``,
                    flags: MessageFlags.Ephemeral
                }).catch(() => {});
            }
        }
    }
};
