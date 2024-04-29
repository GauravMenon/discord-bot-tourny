import { SlashCommandBuilder } from "discord.js";

export default{ 
    data: new SlashCommandBuilder()
        .setName('quickmatch')
        .setDescription('Set up a quickmatch between friends! Choose what the layout should be [3v3, 4v4 or 5v5]'),
    async execute(interaction){
        await interaction.reply('Quickmatch created!');
    },
};