import { Client } from "discord.js";
import { Client as Base } from "../../../base/client";
import { Command, DefaultOptionParams } from "../../../utils/Command";

export default class extends Command {
    constructor(client: Client) {
        super(client, {
            name: "info",
            description: "Gives information about the bot.",
            enabled: true
        });

        this.set(new this.SlashCommand());
    };

    async execute({ interaction, guild, member, client }: DefaultOptionParams) {

        const isBuilt = Base.isBuild() ? "Compiled (Built) Version" : "Development Mode";

        const embed = new this.Embed()
            .setAuthor({ name: `Hello ${interaction.user.displayName}! 👋`, iconURL: interaction.user.avatarURL() })
            .setDescription(`
            I'm here to help you organize your projects and ideas! Im is developed by Megalith and designed to simplify your mind mapping tasks.

            Start organizing your thoughts and projects with me! 🌟
            You can check out my commands using \`/help\` command.

            Im also Open source on Github! [MegalithOfficial/Mindmap-bot](https://github.com/MegalithOfficial/Mindmap-bot)
            `)
            .setColor("Green")
            .setFooter({ text: '⏰ ' + new Date().toLocaleString() + ` Running on ${isBuilt}.` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    };
};