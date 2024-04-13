import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { error } from 'node:console';

config()

// ES module fix to allow the routing to work
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Adds a .command property to my client so it can access commands in other files
client.commands = new Collection();

// Dynamically retrive the command files
const foldersPath = path.join(__dirname, 'commands');
const commandFolder = fs.readdirSync(foldersPath);

for (const folder of commandFolder) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileURL = new URL(`file://${filePath}`);
        import(fileURL).then(commandModule => {
            const command = commandModule;
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }).catch(error => {
            console.error(`Error loading command from ${filePath}:`, error)
        });
    }
}

client.login(process.env.TOKEN);



// // Create a new client instance
// const client = new Client({
//     intents: [GatewayIntentBits.Guilds],

// });

// // When the client is ready, run this code (only once)
// client.once(Events.ClientReady, readyDiscord);

// // Login to Discord with the client's token
// client.login(process.env.TOKEN);

// client.on(Events.InteractionCreate, handleInteraction)

// function readyDiscord() {
//     console.log('👋 ' + client.user.tag)
// }

// async function handleInteraction(interaction) {
//     if (!interaction.isCommand())
//         return;
//     if (interaction.commandName === 'createtournament') {
//         await tourny.execute(interaction)
//     }
//     if (interaction.commandName === 'quickmatch'){
//         await quickmatch.execute(interaction)
//     }
// }