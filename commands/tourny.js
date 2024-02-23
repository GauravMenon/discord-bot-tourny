import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder().setName('createtournament').setDescription('Creates the tournament that you want to use');

export async function execute(interaction) {
    await interaction.reply('Tournament created.')
}