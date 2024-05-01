import { SlashCommandBuilder } from "discord.js";

export default{ 
    data: new SlashCommandBuilder()
        .setName('quickmatch')
        .setDescription('Set up a quickmatch between friends! Choose what the layout should be [3v3, 4v4 or 5v5]')
        .addStringOption(option => 
            option.setName('numberofplayers')
                .setDescription('the choice of what the team sizes should be')
                .setRequired(true)
                .addChoices(
                    {name: '3v3', value: 'player3v3'},
                    {name: '4v4', value: 'player4v4'},
                    {name: '5v5', value: 'player5v5'},
                )),
    async execute(interaction){
        await interaction.reply('Quickmatch created!');
    },
};