import { UserSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

//Reads the data from a textfile of which games and game modes to use for the command
async function readGameData() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, 'game.txt');
    const data = await fs.readFile(filePath, 'utf-8');

    const games = {};
    let currentGame = null;
    let currentGameMode = null;

    data.split('\n').forEach(line => {
        line = line.trim();
        if (line === '') return;

        if (!line.startsWith('-') && !line.includes(':')) { // Finds the line which the game is on
            currentGame = line;
            games[currentGame] = { game_modes: [] };
        } else if (line.startsWith('- name:')) { // Populates the game's gamemodes
            const gameModeName = line.split(':')[1].trim();
            currentGameMode = { name: gameModeName, maps: [] };
            games[currentGame].game_modes.push(currentGameMode);
        } else if (line.startsWith('- mapname:')) { // Populates the game's maps based on gamemode
            const mapName = line.split(':')[1].trim();
            currentGameMode.maps.push({ name: mapName, image: '' });
        } else if (line.startsWith('image:')) { //If an image of the map is there, finds and uses that
            const mapImage = line.substring(line.indexOf(':') + 1).trim();
            const maps = currentGameMode.maps;
            maps[maps.length - 1].image = mapImage;
        }
    });

    return games;
}

export default { 
    data: new SlashCommandBuilder()
        .setName('quickmatch')
        .setDescription('Set up an inhouse quickmatch between friends!')
        .addStringOption(option => 
            option.setName('game')
                .setDescription('What game is being played?')
                .setRequired(true)
                .addChoices(
                    { name: 'Call of Duty', value: 'Call of Duty' },
                    { name: 'League of Legends', value: 'League of Legends' },
                    { name: 'Valorant', value: 'Valorant' }
                )),

    async execute(interaction) {
        const gameName = interaction.options.getString('game') ?? 'No game chosen';
        const gameData = await readGameData();
        const gameInfo = gameData[gameName];
        let lastSelectedMap = null;


        if (!gameInfo) {
            await interaction.reply({
                content: `Game data for ${gameName} not found!`,
                ephemeral: true
            });
            return;
        }

        if (gameInfo.game_modes.length === 0) {
            await interaction.reply({
                content: `No game modes available for ${gameName}!`,
                ephemeral: true
            });
            return;
        }

        // Handles the player selection menu after a game has been chosen
        const handlePlayerSelection = async (interactionOrButton, gameModeName, randomMapName, randomMapImage) => {

            // Creates the menu for the choices of team sizes
            const select = new StringSelectMenuBuilder()
                .setCustomId('teamsize')
                .setPlaceholder('Choose the team sizes!')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setLabel('2v2')
                    .setDescription('Choose this if you want two players against two')
                    .setValue('2v2'),

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
                );

            // Create the buttons for the next message
            const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger);

            const buttonRow = new ActionRowBuilder()
                .addComponents(cancel);

            const row = new ActionRowBuilder()
                .addComponents(select);

            if (interactionOrButton.update) {
                await interactionOrButton.update({
                    content: `The game mode is ${gameModeName}. The map is ${randomMapName}. Please choose a team size for your game:`,
                    components: [row, buttonRow]
                });
            } else {
                await interactionOrButton.reply({
                    content: `The game mode is ${gameModeName}. The map is ${randomMapName}. Please choose a team size for your game:`,
                    components: [row, buttonRow]
                });
            }

            // Collector that retrives the input of size of teams and how to handle it
            const sizeCollector = interactionOrButton.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });

            sizeCollector.on('collect', async sizeInteraction => {
                const selection = sizeInteraction.values[0];

                if (selection === 'cancel') {
                    await sizeInteraction.update({
                        content: `Command has been cancelled!`,
                        components: []
                    });
                } else {
                    // Handle team size selection
                    const teamsize = parseInt(selection.split('v')[0]) * 2;

                    const userSelect = new UserSelectMenuBuilder()
                        .setCustomId('players')
                        .setPlaceholder('Choose the players')
                        .setMinValues(teamsize)
                        .setMaxValues(teamsize);

                    const userRow = new ActionRowBuilder()
                        .addComponents(userSelect);

                    await sizeInteraction.update({
                        content: `Who all are playing? Please choose the players that are playing`,
                        components: [userRow, buttonRow],
                    });

                    // Collector that retrives the players chosen and uses it for the match to be created
                    const userCollector = sizeInteraction.channel.createMessageComponentCollector({ componentType: ComponentType.UserSelect, time: 600_000 });

                    userCollector.on('collect', async userInteraction => {
                        const playerIds = userInteraction.values;

                        const playerMentions = playerIds.map(id => `<@${id}>`);
                        const shuffledPlayers = playerMentions.sort(() => Math.random() - 0.5);
                        const team1 = shuffledPlayers.slice(0, Math.ceil(teamsize / 2));
                        const team2 = shuffledPlayers.slice(Math.ceil(teamsize / 2));

                        // Ensure the values are strings
                        const team1String = team1.join(', ');
                        const team2String = team2.join(', ');
                        const mapName = randomMapName;
                        const gamemodeName = gameModeName;
                        const mapImage = randomMapImage;

                        const newMatchButton = new ButtonBuilder()
                            .setCustomId('newMatch')
                            .setLabel('Create new match')
                            .setStyle(ButtonStyle.Success);
                        
                        const gameModeButtons = gameInfo.game_modes.map(mode => 
                            new ButtonBuilder()
                                .setCustomId(mode.name)
                                .setLabel(mode.name)
                                .setStyle(ButtonStyle.Primary)
                        );
        
                        const buttonRow = new ActionRowBuilder()
                            .addComponents(gameModeButtons);

                        console.log({
                            team1: team1String,
                            team2: team2String,
                            mapName,
                            gamemodeName,
                            mapImage
                        }); // For debugging purposes

                        const embed = new EmbedBuilder()
                            .setTitle(`Gamemode: ${gameModeName}`)
                            .addFields(
                                { name: '\nTeam 1', value: team1String, inline: true },
                                { name: '\nTeam 2', value: team2String, inline: true },
                                { name: '\nMap', value: mapName, inline: true }
                            )
                            .setImage(mapImage)
                            .setFooter({ text: `Game: ${gameName}` })
                            .setColor('#00FF00');

                        await userInteraction.update({
                            content: `Teams have been randomized, Good luck!`,
                            embeds: [embed],
                            components: [buttonRow]
                        });
                    });
            
                    // Creates a new match everytime one of the buttons are pressed after a match for Call of Duty has been made
                    const startNewMatch = async (interaction) => {
                        const selectedGameMode = interaction.customId;
                        const selectedMode = gameInfo.game_modes.find(mode => mode.name === selectedGameMode);
        
                        if (!selectedMode || selectedMode.maps.length === 0) {
                            await i.reply({
                                content: `No maps available for the selected game mode!`,
                                ephemeral: true
                            });
                            return;
                        }
        
                        let randomMapObj;
                        do {
                            randomMapObj = selectedMode.maps[Math.floor(Math.random() * selectedMode.maps.length)];
                        } while (randomMapObj && randomMapObj.name === lastSelectedMap);

                        if (!randomMapObj) {
                            await i.reply({
                                content: `No maps found for the selected game mode!`,
                                ephemeral: true
                            });
                            return;
                        }
        
                        const randomMapName = randomMapObj.name;

                        // Update the last selected map
                        lastSelectedMap = randomMapName;

                        const gameModeButtons = gameInfo.game_modes.map(mode => 
                            new ButtonBuilder()
                                .setCustomId(mode.name)
                                .setLabel(mode.name)
                                .setStyle(ButtonStyle.Primary)
                        );

                        const buttonRow = new ActionRowBuilder()
                            .addComponents(gameModeButtons);

                        await interaction.deferReply()
                        await interaction.editReply({
                            content: `New match: ${selectedGameMode} on ${randomMapName}`,
                            components: [buttonRow]
                        });
                        
                    }
                    const matchCollector = sizeInteraction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 1_200_000 });

                    matchCollector.on('collect', async matchInteraction => {
                        await startNewMatch(matchInteraction)
                    })
            
                }
            });
        };
        if (gameName === 'League of Legends' || gameName === 'Valorant') {
            // Create buttons for game modes
            const gameModeButtons = gameInfo.game_modes.map(mode => 
                new ButtonBuilder()
                    .setCustomId(mode.name)
                    .setLabel(mode.name)
                    .setStyle(ButtonStyle.Primary)
            );

            const row = new ActionRowBuilder().addComponents(gameModeButtons);

            await interaction.reply({
                content: `You have chosen ${gameName}. Please select a game mode:`,
                components: [row]
            });

            const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });

            collector.on('collect', async i => {
                const selectedGameMode = i.customId;
                const selectedMode = gameInfo.game_modes.find(mode => mode.name === selectedGameMode);

                if (!selectedMode || selectedMode.maps.length === 0) {
                    await i.reply({
                        content: `No maps available for the selected game mode!`,
                        ephemeral: true
                    });
                    return;
                }

                const randomMapObj = selectedMode.maps[Math.floor(Math.random() * selectedMode.maps.length)];
                if (!randomMapObj) {
                    await i.reply({
                        content: `No maps found for the selected game mode!`,
                        ephemeral: true
                    });
                    return;
                }

                const randomMapName = randomMapObj.name;
                const randomMapImage = randomMapObj.image;

                await handlePlayerSelection(i, selectedGameMode, randomMapName, randomMapImage);
            });
        } else {
            // Existing logic for Call of Duty or other games without specific mode selection
            const randomGameModeObj = gameInfo.game_modes[Math.floor(Math.random() * gameInfo.game_modes.length)];
            if (!randomGameModeObj || randomGameModeObj.maps.length === 0) {
                await interaction.reply({
                    content: `No maps available for the selected game mode!`,
                    ephemeral: true
                });
                return;
            }

            const randomMapObj = randomGameModeObj.maps[Math.floor(Math.random() * randomGameModeObj.maps.length)];
            if (!randomMapObj) {
                await interaction.reply({
                    content: `No maps found for the selected game mode!`,
                    ephemeral: true
                });
                return;
            }

            const randomMapName = randomMapObj.name;
            const randomMapImage = randomMapObj.image;

            // Update the lastSelectedMap with the last map chosen
            lastSelectedMap = randomMapName;

            await handlePlayerSelection(interaction, randomGameModeObj.name, randomMapName, randomMapImage);
        }
    },
};
