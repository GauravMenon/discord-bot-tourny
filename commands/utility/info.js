import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Provides information a user or server')
        .addSubcommand(subcommand =>
            subcommand.setName('user')
                .setDescription('Get the information of a user')
                .addUserOption(option => option.setName('target').setDescription('The user')))
                
        .addSubcommand(subcommand =>
            subcommand.setName('server')
                .setDescription('Get the information about the server')),
	async execute(interaction) {
        if (interaction.options.getSubcommand() === 'user'){
            const user = interaction.options.getUser('target');
            console.log()

            if (user){
                const discordMember = await interaction.guild.members.fetch(user)
                await interaction.reply({content:`This command was run by you ${interaction.user.username}, to find out information about ${user.username} who joined this server on ${discordMember.joinedAt}.`, ephemeral:true});
            } else {
                await interaction.reply({content:`This command was run by you ${interaction.user.username}, you joined this server on ${interaction.member.joinedAt}.`, ephemeral:true});
            }
        } else if (interaction.options.getSubcommand() === 'server'){
            await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`)
        }
	},
};