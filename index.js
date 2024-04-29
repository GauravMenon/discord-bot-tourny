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

// Dynamically retrieve the command files
const foldersPath = path.join(__dirname, 'commands');
const commandFolder = fs.readdirSync(foldersPath);

for (const folder of commandFolder) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileURL = new URL(`file://${filePath}`);
        import(fileURL).then(commandModule => {
            const command = commandModule.default;
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

//Dynamically retrieve the events files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles){
    const filePath = path.join(eventsPath, file);
    const fileURL = new URL(`file://${filePath}`);
    import(fileURL).then(eventModule => {
        const event = eventModule.default;
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }).catch(error => {
        console.error(`Error loading command from ${filePath}:`, error)
    });
}

//Allows access to the bot with the token
client.login(process.env.TOKEN);