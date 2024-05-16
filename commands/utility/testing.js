import { UserSelectMenuBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName('testing')
		.setDescription('For testing purposes'),
	async execute(interaction) {

        const select = new StringSelectMenuBuilder()
            .setCustomId('starter')
            .setPlaceholder('Make a selection!')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Bulbasaur')
                    .setDescription('The dual-type Grass/Poison Seed Pokemon')
                    .setValue('bulbasaur'),
                    
                new StringSelectMenuOptionBuilder()
                .setLabel('Charmander')
                .setDescription('The Fire-Type Lizard Pokemon')
                .setValue('charmander'),
                
                new StringSelectMenuOptionBuilder()
                    .setLabel('Squirtle')
                    .setDescription('The Water-type Tiny Turtle Pokemon')
                    .setValue('squirtle'),
            )

        const userSelect = new UserSelectMenuBuilder()
            .setCustomId('users')
            .setPlaceholder('Select multiple users')
            .setMinValues(1)
            .setMaxValues(10)
            
        const row = new ActionRowBuilder()
            .addComponents(userSelect);

		await interaction.reply({
            content: 'Testing...',
            components: [row],
        });
	},
};