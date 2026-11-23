import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('logevent')
        .setDescription('Log and announce a Roblox event without a join button.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of event (e.g., Training, Raid, Tryout, SSU)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Roblox game URL (or Place ID)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Details or Rules')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time Scheduled')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('host')
                .setDescription('The User Hosting the Event')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('comments')
                .setDescription('Optional Comments')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const eventType = interaction.options.getString('type');
            let gameLink = interaction.options.getString('link').trim();
            const description = interaction.options.getString('description');
            const hostTime = interaction.options.getString('time');
            const hostUser = interaction.options.getUser('host');
            const comments = interaction.options.getString('comments');

            // If user entered just a numeric Place ID, convert it to a direct roblox.com URL
            if (/^\d+$/.test(gameLink)) {
                gameLink = `https://roblox.com{gameLink}`;
            } else {
                // Ensure https:// prefix if missing (e.g., ://roblox.com...)
                if (!gameLink.startsWith('http://') && !gameLink.startsWith('https://')) {
                    gameLink = `https://${gameLink}`;
                }

                // Extract Place ID if it's a ://roblox.com<id> URL so it always opens cleanly
                const placeIdMatch = gameLink.match(/roblox\.com\/(?:[a-z]{2}\/)?games\/(\d+)/i);
                if (placeIdMatch) {
                    gameLink = `https://roblox.com{placeIdMatch}`;
                } else if (!gameLink.includes('roblox.com')) {
                    return await interaction.reply({
                        content: '❌ Please provide a valid `roblox.com` game link or Place ID.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            }

            const logChannel = interaction.guild.channels.cache.get('1574462575561801819');
            if (!logChannel) {
                return await interaction.reply({
                    content: '⚠️ Log channel not found. Check the channel ID in `logevent.js`.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const eventEmbed = new EmbedBuilder()
                .setColor('#2B2D31')
                .setTitle(`Event: ${eventType}`)
                .setURL(gameLink)
                .setDescription(description)
                .addFields(
                    { name: 'Host', value: `${hostUser}`, inline: true },
                    { name: 'Scheduled Time', value: hostTime, inline: true },
                    { name: 'Game Link', value: `[Play on Roblox](${gameLink})`, inline: false },
                    { name: 'Comments', value: comments || 'None', inline: false }
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

