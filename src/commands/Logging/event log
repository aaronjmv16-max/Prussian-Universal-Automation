const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logevent')
        .setDescription('Log and announce a Roblox event without a join button.')
        // Optional: Restrict command to users who can manage events or messages
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
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
                .setDescription('Time the event will be hosted (e.g., 5:00 PM EST or <t:1735689600:F>)')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('host')
                .setDescription('The user hosting the event')
                .setRequired(true)),

    async execute(interaction) {
        const eventType = interaction.options.getString('type');
        const gameLink = interaction.options.getString('link');
        const description = interaction.options.getString('description');
        const hostTime = interaction.options.getString('time');
        const hostUser = interaction.options.getUser('host');

        // Basic validation to ensure a valid URL is provided
        if (!gameLink.startsWith('http://') && !gameLink.startsWith('https://')) {
            return interaction.reply({
                content: '❌ Please provide a valid Roblox game URL starting with `http://` or `https://`.',
                ephemeral: true
            });
        }

        const eventEmbed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setTitle(`📢 Event Started: ${eventType}`)
            .setDescription(description)
            .addFields(
                { name: 'Game Link', value: `[Click Here to View Game](${gameLink})`, inline: false }
                { name: 'Host', value: `${hostUser}`, inline: true },
                { name: 'Scheduled Time', value: hostTime, inline: true },
            )
            .setFooter({ text: `Logged by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        // Sends the embed with NO components array (no Join Event button)
        await interaction.reply({ embeds: [eventEmbed] });
    }
};
