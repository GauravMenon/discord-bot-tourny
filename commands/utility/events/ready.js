import { Events } from "discord.js";

// Event listener that gets called once the client is ready
export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};