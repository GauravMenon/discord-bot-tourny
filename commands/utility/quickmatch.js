import { Component, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export default{ 
    data: new SlashCommandBuilder()
        .setName('quickmatch')
        .setDescription('Set up a an inhouse quickmatch between friends!')
        .addStringOption(option => 
            option.setName('game')
                .setDescription('What game is being played?')
                .setRequired(true)
                .addChoices(
                    {name: 'Call of Duty', value: 'CallofDuty'},
                    {name: 'League of Legends', value: 'LeagueofLegends'},
                    {name: 'Valorant', value: 'Valorant'},
                ))
        .addStringOption(option => 
            option.setName('teamsize')
                .setDescription('What are the team sizes?')
                .setRequired(true)
                .addChoices(
                    {name: '3v3', value: '3v3'},
                    {name: '4v4', value: '4v4'},
                    {name: '5v5', value: '5v5'},                   
                ))
                
        .addUserOption(option =>
            option.setName('player')
                .setDescription('Who is playing?')
                .setRequired(true)
        ),
    async execute(interaction){

        await interaction.reply({
            content: `Quickmatch made!`
        });
    },
};