import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('logevent')
        .setDescription('Log and announce a Roblox event without a join button.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of event (e.g., Tryout, SSU, etc.)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Roblox game URL (or Place ID)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time its Hosted')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('host')
                .setDescription('The Host of the Event')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('comments')
                .setDescription('Optional Comments')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const eventType = interaction.options.getString('type');
            let gameLink = interaction.options.getString('link').trim();
            const hostTime = interaction.options.getString('time');
            const hostUser = interaction.options.getUser('host');
            const comments = interaction.options.getString('comments');

            // 1. If user entered just a numeric Place ID, convert it to a direct roblox.com URL
            if (/^\d+$/.test(gameLink)) {
                gameLink = `https://roblox.com{gameLink}`;
            } else {
                // 2. Ensure https:// prefix if missing
                if (!gameLink.startsWith('http://') && !gameLink.startsWith('https://')) {
                    gameLink = `https://${gameLink}`;
                }

                // 3. Extract ONLY the numeric Place ID using .at(1) so the URL is always clean
                const placeIdMatch = gameLink.match(/roblox\.com\/(?:[a-z]{2}\/)?games\/(\d+)/i);
                const placeId = placeIdMatch ? placeIdMatch.at(1) : null;
                if (placeId) {
                    gameLink = `https://roblox.com{placeId}`;
                } else if (!gameLink.includes('roblox.com')) {
                    return await interaction.reply({
                        content: '❌ Please provide a valid `roblox.com` game link or Place ID.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            }

            // 4. Verify Discord will accept the final URL format
            try {
                new URL(gameLink);
            } catch {
                return await interaction.reply({
                    content: '❌ That link is not a valid URL. Try pasting the full `https://roblox.com...` link or just the numeric Place ID.',
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
                .setColor('#D6AB29')
                .setTitle(`📢 Event: ${eventType}`)
                .setURL(gameLink)
                .addFields(
                    { name: 'Host', value: `${hostUser}`, inline: true },
                    { name: 'Scheduled Time', value: hostTime, inline: true },
                    { name: 'Game Link', value: `[Play on Roblox](${gameLink})`, inline: false },
                    { name: 'Comments', value: comments?.trim() || 'None', inline: false }
                )
                .setFooter({ text: `Logged by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await logChannel.send({ embeds: [eventEmbed] });
            await interaction.reply({ content: '✅ Event successfully logged!', flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error('❌ logevent command error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An unexpected error occurred while logging the event.',
                    flags: MessageFlags.Ephemeral
                }).catch(() => {});
            }
        }
    }
};
