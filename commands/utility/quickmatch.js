import { UserSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, StringSelectMenuInteraction, Component, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActionRow, time, ComponentType} from "discord.js";

export default{ 
    data: new SlashCommandBuilder()
        .setName('quickmatch')
        .setDescription('Set up a an inhouse quickmatch between friends!')
        .addStringOption(option => 
            option.setName('game')
                .setDescription('What game is being played?')
                .setRequired(true)
                .addChoices(
                    {name: 'Call of Duty', value: 'Call of Duty'},
                    {name: 'League of Legends', value: 'League of Legends'},
                    {name: 'Valorant', value: 'Valorant'},
                )),
        // .addStringOption(option => 
        //     option.setName('teamsize')
        //         .setDescription('What are the team sizes?')
        //         .setRequired(true)
        //         .addChoices(
        //             {name: '3v3', value: '3v3'},
        //             {name: '4v4', value: '4v4'},
        //             {name: '5v5', value: '5v5'},                   
        //         )),
                
        // .addUserOption(option =>
        //     option.setName('player')
        //         .setDescription('Who is playing?')
        //         .setRequired(true)
        // )  //Make sure to re add , to this line if you still use it

    async execute(interaction){
        const target = interaction.options.getUser('target')

        const gameName = interaction.options.getString('game') ?? 'No game chosen';
        const teamsize = interaction.options.getString('teamsize') ?? 'No team size chosen';

        const select = new StringSelectMenuBuilder()
        .setCustomId('teamsize')
        .setPlaceholder('Choose the team sizes!')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('3v3')
                .setDescription('Choose this if you want three players against three')
                .setValue('3v3'),
                
            new StringSelectMenuOptionBuilder()
            .setLabel('4v4')
            .setDescription('Choose this if you want four players against four')
            .setValue('4v4'),
            
            new StringSelectMenuOptionBuilder()
                .setLabel('5v5')
                .setDescription('Choose this if you want five players against five')
                .setValue('5v5'),
        )

        const userSelect3v3 = new UserSelectMenuBuilder()
        .setCustomId('users3v3')
        .setPlaceholder('Select 6 players for this match')
        .setMinValues(6)
        .setMaxValues(6)
        
        const userSelect4v4 = new UserSelectMenuBuilder()
        .setCustomId('users4v4')
        .setPlaceholder('Select 8 players for this match')
        .setMinValues(8)
        .setMaxValues(8)

        const userSelect5v5 = new UserSelectMenuBuilder()
        .setCustomId('users5v5')
        .setPlaceholder('Select 10 players for this match')
        .setMinValues(10)
        .setMaxValues(10)

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)


        const buttonRow = new ActionRowBuilder()
            .addComponents(cancel)

        const row = new ActionRowBuilder()
            .addComponents(select);

        const row3v3 = new ActionRowBuilder()
            .addComponents(userSelect3v3)
        
        const row4v4 = new ActionRowBuilder()
            .addComponents(userSelect4v4)

        const row5v5 = new ActionRowBuilder()
            .addComponents(userSelect5v5)
        
        await interaction.reply({
            content: `The game that was chosen is ${gameName}!`,
        });
        const response = await interaction.followUp({
            content: 'Please choose a team size for your game',
            components: [row, buttonRow],
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

        collector.on('collect', async i => {
            const selection = i.values[0];

            if (selection === 'cancel'){
                await i.update({
                    content: `Command has been cancelled!`,
                    components: []
                })
            }
            else if (selection === '3v3'){
                await i.update({
                    content: `Who are all playing? Please choose the players that are playing`,
                    components: [row3v3, buttonRow],
                })
            } else if (selection === '4v4'){
                await i.update({
                    content: `Who are all playing? Please choose the players that are playing`,
                    components: [row4v4],
                })
            } else if (selection === '5v5'){
                await i.update({
                    content: `Who are all playing? Please choose the players that are playing`,
                    components: [row5v5],
                })
            }
        })
    },
};