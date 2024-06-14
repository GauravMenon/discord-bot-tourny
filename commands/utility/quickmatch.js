import { UserSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


// Function to read and parse the text file
async function readGameData() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, 'game.txt');
    const data = await fs.readFile(filePath, 'utf-8');

    const games = {};
    let currentGame = null;
    let currentSection = null;
    let currentGameMode = null;

    data.split('\n').forEach(line => {
        line = line.trim();
        if (line === '') return;

        if (!line.startsWith('-') && !line.includes(':')) {
            currentGame = line;
            games[currentGame] = { maps: [], game_modes: [] };
        } else if (line === 'maps:') {
            currentSection = 'maps';
            currentGameMode = null;
        } else if (line === 'game_modes:') {
            currentSection = 'game_modes';
            currentGameMode = null;
        } else if (currentSection === 'maps' && line.startsWith('- name:')) {
            const mapName = line.split(':')[1].trim();
            games[currentGame].maps.push({ name: mapName, image: '' });
        } else if (currentSection === 'maps' && line.startsWith('image:')) {
            const mapImage = line.split(':')[1].trim();
            games[currentGame].maps[games[currentGame].maps.length - 1].image = mapImage;
        } else if (currentSection === 'game_modes' && line.startsWith('- name:')) {
            const gameModeName = line.split(':')[1].trim();
            currentGameMode = { name: gameModeName, maps: [] };
            games[currentGame].game_modes.push(currentGameMode);
        } else if (currentSection === 'game_modes' && currentGameMode && line.startsWith('- name:')) {
            const mapName = line.split(':')[1].trim();
            currentGameMode.maps.push({ name: mapName, image: '' });
        } else if (currentSection === 'game_modes' && currentGameMode && line.startsWith('image:')) {
            const mapImage = line.split(':')[1].trim();
            const maps = currentGameMode.maps;
            maps[maps.length - 1].image = mapImage;
        } else if (currentSection === 'game_modes' && line.startsWith('-')) {
            const gameModeName = line.split('- ')[1].trim();
            games[currentGame].game_modes.push({ name: gameModeName, maps: [] });
        }
    });

    console.log(games); // For debugging purposes
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

        console.log(gameInfo.game_modes)
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

        const userSelect1v1 = new UserSelectMenuBuilder()
            .setCustomId('users1v1')
            .setPlaceholder('Select up to 10 players for the pool of players that will 1v1')
            .setMinValues(2)
            .setMaxValues(10);

        const userSelect2v2 = new UserSelectMenuBuilder()
            .setCustomId('users2v2')
            .setPlaceholder('Select 4 players for this match')
            .setMinValues(4)
            .setMaxValues(4);

        const userSelect3v3 = new UserSelectMenuBuilder()
            .setCustomId('users3v3')
            .setPlaceholder('Select 6 players for this match')
            .setMinValues(6)
            .setMaxValues(6);
            
        const userSelect4v4 = new UserSelectMenuBuilder()
            .setCustomId('users4v4')
            .setPlaceholder('Select 8 players for this match')
            .setMinValues(8)
            .setMaxValues(8);

        const userSelect5v5 = new UserSelectMenuBuilder()
            .setCustomId('users5v5')
            .setPlaceholder('Select 10 players for this match')
            .setMinValues(10)
            .setMaxValues(10);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger);

        const buttonRow = new ActionRowBuilder()
            .addComponents(cancel);

        const row = new ActionRowBuilder()
            .addComponents(select);

        await interaction.reply({
            content: `The game that was chosen is ${gameName}! The map is ${randomMapName} and the game mode is ${randomGameModeObj.name}`,
        });
        
        const response = await interaction.followUp({
            content: 'Please choose a team size for your game',
            components: [row, buttonRow],
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

        collector.on('collect', async i => {
            const selection = i.values[0];

            if (selection === 'cancel') {
                await interaction.update({
                    content: `Command has been cancelled!`,
                    components: []
                });
            } else if (selection === '1v1') {
                await i.update({
                    content: `Who all are playing? Please choose the players that are playing`,
                    components: [new ActionRowBuilder().addComponents(userSelect1v1), buttonRow],
                });
            } else if (selection === '2v2') {
                await i.update({
                    content: `Who all are playing? Please choose the players that are playing`,
                    components: [new ActionRowBuilder().addComponents(userSelect2v2), buttonRow],
                });
            } else if (selection === '3v3') {
                await i.update({
                    content: `Who all are playing? Please choose the players that are playing`,
                    components: [new ActionRowBuilder().addComponents(userSelect3v3), buttonRow],
                });
            } else if (selection === '4v4') {
                await i.update({
                    content: `Who all are playing? Please choose the players that are playing`,
                    components: [new ActionRowBuilder().addComponents(userSelect4v4), buttonRow],
                });
            } else if (selection === '5v5') {
                await i.update({
                    content: `Who all are playing? Please choose the players that are playing`,
                    components: [new ActionRowBuilder().addComponents(userSelect5v5), buttonRow],
                });
            }
        });

        const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });

        buttonCollector.on('collect', async i => {
            if (i.customId === 'cancel') {
                await i.update({
                    content: `Command has been cancelled!`,
                    components: []
                });
                collector.stop();
                buttonCollector.stop();
            }
        });

        const userCollector = response.createMessageComponentCollector({ componentType: ComponentType.UserSelect, time: 3_600_000 });

        userCollector.on('collect', async i => {
            const playerIds = i.values;
            const teamsize = playerIds.length;

            const playerMentions = playerIds.map(id => `<@${id}>`);
            const shuffledPlayers = playerMentions.sort(() => Math.random() - 0.5);
            const team1 = shuffledPlayers.slice(0, Math.ceil(teamsize / 2));
            const team2 = shuffledPlayers.slice(Math.ceil(teamsize / 2));

            // Ensure the values are strings
            const team1String = team1.join(', ');
            const team2String = team2.join(', ');
            const mapName = randomMapName;
            const gameModeName = randomGameModeObj.name;
            const mapImage = randomMapImage;

            console.log({
                team1: team1String,
                team2: team2String,
                mapName,
                gameModeName,
                mapImage
            }); // For debugging purposes

            const embed = new EmbedBuilder()
                .setTitle('Inhouse quickmatch')
                .addFields(
                    { name: 'Team 1', value: team1String, inline: true },
                    { name: 'Team 2', value: team2String, inline: true },
                    { name: 'Map', value: mapName, inline: true },
                    { name: 'Game Mode', value: gameModeName, inline: true }
                )
                .setImage(mapImage)
                .setFooter({ text: `Game: ${gameName}` })
                .setColor('#00FF00');

            await i.update({
                content: `Teams have been randomized!`,
                embeds: [embed],
                components: []
            });
        });
    },
};
