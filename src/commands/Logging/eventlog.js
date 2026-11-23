import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { replyUserError, ErrorTypes } from '../../utils/errorHandler.js';

export default {
    data: new SlashCommandBuilder()
        .setName('logevent')
        .setDescription('Log and announce a Roblox event without a join button.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of event (e.g., Training, Shift, Raid, Tryout)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Roblox game URL')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Details or rules for the event')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time the event will be hosted (e.g., 5:00 PM EST)')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('host')
                .setDescription('The user hosting the event')
                .setRequired(true)),

    async execute(interaction, config, client) {
        try {
            const eventType = interaction.options.getString('type');
            const gameLink = interaction.options.getString('link');
            const description = interaction.options.getString('description');
            const hostTime = interaction.options.getString('time');
            const hostUser = interaction.options.getUser('host');

            if (!gameLink.startsWith('http://') && !gameLink.startsWith('https://')) {
                return await replyUserError(interaction, {
                    type: ErrorTypes.VALIDATION,
                    message: 'Please provide a valid Roblox game URL starting with http:// or https://.'
                });
            }

            // Replace YOUR_CHANNEL_ID with your Discord channel ID
            const logChannel = interaction.guild.channels.cache.get('1574462575561801819');
            if (!logChannel) {
                return await replyUserError(interaction, {
                    type: ErrorTypes.VALIDATION,
                    message: 'Log channel not found. Check the channel ID in eventlog.js.'
                });
            }

            const eventEmbed = new EmbedBuilder()
                .setColor('#2B2D31')
                .setTitle(`📢 Event Started: ${eventType}`)
                .setDescription(description)
                .addFields(
                    { name: 'Game Link', value: `[Click Here to View Game](${gameLink})`, inline: false }
                    { name: 'Event Host', value: `${hostUser}`, inline: true },
                    { name: 'Scheduled Time', value: hostTime, inline: true },
                )
                .setFooter({ text: `Logged by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Posts to your log channel with NO Join Event button
            await logChannel.send({ embeds: [eventEmbed] });
            await interaction.reply({ content: '✅ Event successfully logged!', ephemeral: true });

        } catch (error) {
            logger.error('logevent command error:', error);
            await replyUserError(interaction, {
                type: ErrorTypes.UNKNOWN,
                message: 'An unexpected error occurred while logging the event.'
            }).catch(() => {});
        }
    }
};
