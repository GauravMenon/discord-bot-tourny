import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as tourny from './commands/tourny.js'
import * as quickmatch from './commands/quickmatch.js'

config()

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

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