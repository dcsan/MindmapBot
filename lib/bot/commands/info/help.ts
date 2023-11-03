import { Client } from "discord.js";
import { Command, DefaultOptionParams } from "../../../utils/Command";

export default class extends Command {
    private commandObject: Record<any, any> = {};


    constructor(client: Client) {
        super(client, {
            name: "help",
            description: "Feeling lost? you are in right place.",
            enabled: true
        });

        this.set(new this.SlashCommand()
            .addStringOption(option =>
                option
                    .setName('command-name')
                    .setDescription('enter a command name to check it out!')
                    .setAutocomplete(true)
            )
        );
    };

    async execute({ interaction, guild, member, client }: DefaultOptionParams) {
        const commandName = interaction.options.getString("command-name") || "";
        this.exportCommands();
        try {
            if (commandName.length > 0) {
                const isSubcommand = commandName.split(" ")[1] ? true : false
                const commandInfo = isSubcommand ? this.commandObject[commandName.split(" ")[0].replaceAll("/", "")].subcommands[commandName.split(" ")[0] + " " + commandName.split(" ")[1]] : this.commandObject[commandName];

                const infoEmbed = new this.Embed()
                    .setAuthor({ name: `🔍 Info for ${isSubcommand ? "" : "/"}${commandName.split(" ")[0].replaceAll("/", "") + (isSubcommand ? " " + commandName.split(" ")[1] : "")}`, iconURL: interaction.user.avatarURL() })
                    .setDescription(`
              📋 Command Structure: \`${isSubcommand ? "" : "/"}${commandName.split(" ")[0] + (isSubcommand ? " " + commandName.split(" ")[1] : "")} ${commandInfo.options?.length > 0 ? commandInfo.options.join(" ") : ""}\`
              ❗<> = Required / [] = Optional ${isSubcommand ? "" : ""}

              📝 Description: ${commandInfo.description}
              `)
                    .setColor("Green")
                    .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                    .setTimestamp();

                return interaction.reply({ embeds: [infoEmbed] })
            } else {
                let message = "";

                function listCommandDescriptions(commands) {
                    for (const commandName in commands) {
                        console.log(commandName)
                        const command = commands[commandName];
                        const commandInfo = ` - \`/${command.name}\` - ${command.description}\n`;
                        message += commandInfo;
                    }
                    return message;
                }

                const embed = new this.Embed()
                    .setAuthor({ name: "Help Menu", iconURL: interaction.user.avatarURL() })
                    .setDescription(`
                  📚 Welcome to the Help menu of <@${interaction.client.user.id}>!
                  
                  🤖 **Available Commands:**
                  ${listCommandDescriptions(this.commandObject)}
                  ℹ️ You can use \`/help [command-name]\` for more detailed information!
                `)
                    .setColor("Green")
                    .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                    .setTimestamp();

                return interaction.reply({ embeds: [embed] });
            }

        } catch (err) {
            console.log(err)
            interaction.reply({ content: "Oh no! An error Occured, please check console." })
        };
    };

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