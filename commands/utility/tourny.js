import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName('createtournament')
		.setDescription('Creates the tournament that you want to use'),
	async execute(interaction) {
		await interaction.reply('The tournament has been made! Good luck players!');
	},
};