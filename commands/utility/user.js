import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user'),
	async execute(interaction) {
		await interaction.reply({content:`This command was run by you ${interaction.user.username}, you joined this server on ${interaction.member.joinedAt}.`, ephemeral:true});
	},
};