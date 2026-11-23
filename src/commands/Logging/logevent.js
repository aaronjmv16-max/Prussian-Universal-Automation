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
                .setDescription('Roblox Game URL (or Place ID)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time it Will Start')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('host')
                .setDescription('The Host')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('comments')
                .setDescription('Optional Comments')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const eventType = interaction.options.getString('type').trim();
            const rawLink = interaction.options.getString('link').trim();
            const hostTime = interaction.options.getString('time').trim();
            const hostUser = interaction.options.getUser('host');
            const comments = interaction.options.getString('comments');

            // Extract numeric Place ID safely without regex group indexing
            let gameLink = rawLink;
            if (/^\d+$/.test(rawLink)) {
                gameLink = `https://roblox.com{rawLink}`;
            } else if (rawLink.includes('://roblox.com')) {
                const afterGames = rawLink.split('://roblox.com')[1] || '';
                const numericId = afterGames.split('/')[0].split('?')[0].replace(/\D/g, '');
                if (!numericId) {
                    return await interaction.reply({
                        content: '❌ Could not find a valid Roblox Place ID in that link.',
                        flags: MessageFlags.Ephemeral
                    });
                }
                gameLink = `https://roblox.com{numericId}`;
            } else {
                return await interaction.reply({
                    content: '❌ Please provide a valid `://roblox.com...` link or Place ID.',
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
                .setURL(gameLink)
                .addFields(
                    { name: 'Host', value: `<@${hostUser.id}>`, inline: true },
                    { name: 'Scheduled Time', value: hostTime || 'TBA', inline: true },
                    { name: 'Game Link', value: `[Play on Roblox](${gameLink})`, inline: false },
                    { name: 'Comments', value: comments && comments.trim().length > 0 ? comments.trim() : 'None', inline: false }
                )
                .setFooter({ text: `Logged by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await logChannel.send({ embeds: [eventEmbed] });
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
