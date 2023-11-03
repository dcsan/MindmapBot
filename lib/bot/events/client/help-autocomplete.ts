import { Database } from "../../../base/Database";
import { AutocompleteInteraction } from "discord.js";
import { Client } from "../../../base/client";
import { Event } from "../../../utils/Event";

export default class extends Event {
    private commandObject: Record<any, any> = {};

    constructor(client: Client) {
        super(client, {
            name: "interactionCreate",
            enabled: true,
            once: false,
        });
    };

    async execute(interaction: AutocompleteInteraction) {
        if (interaction.isAutocomplete() && interaction.commandName === 'help') {
            try {
                const focusedValue = interaction.options.getFocused();
                const commandName = interaction.options.getString('command-name');
                this.exportCommands()
    
                const allChoices = [];

                if (!commandName) {
                    const mainCommands = Object.keys(this.commandObject);
                    allChoices.push(
                        ...mainCommands.map((mainCommand) => ({
                            name: `/${mainCommand} - Main Command`,
                            value: mainCommand,
                        }))
                    );
    
                    mainCommands.forEach((mainCommand) => {
                        const subcommands = Object.keys(this.commandObject[mainCommand].subcommands);
                        allChoices.push(
                            ...subcommands.map((subcommand) => ({
                                name: `${subcommand} - Subcommand`,
                                value: `${subcommand}`,
                                description: 'Subcommand',
                            }))
                        );
                    });
                } else {
                    const isSubcommand = commandName.includes(' ');
                    if (isSubcommand) {
                        const mainCommand = commandName.split(' ')[0];
                        const subcommands = Object.keys(this.commandObject[mainCommand].subcommands);
                        allChoices.push(
                            ...subcommands.map((subcommand) => ({
                                name: `${subcommand} - Subcommand`,
                                value: `${subcommand}`,
                                description: 'Subcommand',
                            }))
                        );
                    }
                }
    
                const filteredChoices = allChoices.filter((choice) =>
                    choice.name.startsWith(focusedValue)
                );
    
                interaction.respond(
                    filteredChoices
                );
            } catch (err) {
                console.log(err);
            }
        }
    }

    private exportCommands(): void {
        const commandsList = this.commands.map((command) => ({
            name: command.data.name,
            description: command.data.description,
            options: command.data.options
        }));

        const commandObject = this.commandObject;

        for (const command of commandsList) {
            const subcommandsObject = {};
            if (command.options) {
                for (const subcommand of command.options) {
                    if (subcommand.options) {
                        const formattedOptions = subcommand.options.map((option) => {
                            const optionText = option.required ? `<${option.name}>` : `[${option.name}]`;
                            return optionText;
                        });

                        subcommandsObject[`/${command.name} ${subcommand.name}`] = {
                            description: subcommand.description,
                            options: formattedOptions,
                        };
                    } else {
                        subcommandsObject[`/${command.name} ${subcommand.name}`] = {
                            description: subcommand.description,
                            options: null,
                        };
                    }
                }
            }

            commandObject[command.name] = {
                name: command.name,
                description: command.description,
                subcommands: subcommandsObject,
            };
        }
    }
};