import { UserSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, StringSelectMenuInteraction, Component, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActionRow, time, ComponentType} from "discord.js";

export default{ 
    data: new SlashCommandBuilder()
        .setName('quickmatch')
        .setDescription('Set up a inhouse quickmatch between friends!')
        .addStringOption(option => 
            option.setName('game')
                .setDescription('What game is being played?')
                .setRequired(true)
                .addChoices(
                    {name: 'Call of Duty', value: 'Call of Duty'},
                    {name: 'League of Legends', value: 'League of Legends'},
                    {name: 'Valorant', value: 'Valorant'},
                )),

    async execute(interaction){
        const gameName = interaction.options.getString('game') ?? 'No game chosen';

        //Creates a dropdown menu selector that asks you what the team sizes should be
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

        await interaction.reply({
            content: `The game that was chosen is ${gameName}!`,
        });
        
        const response = await interaction.followUp({
            content: 'Please choose a team size for your game',
            components: [row, buttonRow],
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

        // Collects the info on which teamsize was chosen then asks which players are playing asking the user to choose
        // the players in the server
        collector.on('collect', async i => {
            const selection = i.values[0];

            if (selection === 'cancel'){
                await interaction.update({
                    content: `Command has been cancelled!`,
                    components: []
                })
            }
            else if (selection === '3v3'){
                await i.update({
                    content: `Who all are playing? Please choose the players that are playing`,
                    components: [new ActionRowBuilder().addComponents(userSelect3v3), buttonRow],
                })
            } else if (selection === '4v4'){
                await i.update({
                    content: `Who all are playing? Please choose the players that are playing`,
                    components: [new ActionRowBuilder().addComponents(userSelect4v4), buttonRow],
                })
            } else if (selection === '5v5'){
                await i.update({
                    content: `Who all are playing? Please choose the players that are playing`,
                    components: [new ActionRowBuilder().addComponents(userSelect5v5), buttonRow],
                });
            }
        });

        const userCollector = response.createMessageComponentCollector({ componentType: ComponentType.UserSelect, time: 3_600_000});

        userCollector.on('collect', async i => {
            const playerIds = i.values;
            const teamsize = playerIds.length;

            // From the player's ID obtained, converts it into a @player mention in discord
            const playerMentions = playerIds.map(id => `<@${id}>`);

            // Randomize and split players into two teams
            const shuffledPlayers = playerMentions.sort(() => Math.random() - 0.5);
            const team1 = shuffledPlayers.slice(0, teamsize / 2);
            const team2 = shuffledPlayers.slice(teamsize / 2);
            await i.update({
                content: `Teams have been randomized! The Game chosen is ${gameName}\nTeam 1: ${team1.join(', ')}\nTeam 2: ${team2.join(', ')}\nGood luck players and may the best win!`,
                components: []
            });
        })
    },
};