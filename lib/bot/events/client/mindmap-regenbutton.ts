import { Config, MindMap } from "../../../utils/mindMapManager";
import { Database } from "../../../base/Database";
import { ButtonBuilder, ButtonInteraction } from "discord.js";
import { Client } from "../../../base/client";
import { Event } from "../../../utils/Event";

const db = new Database();

export default class extends Event {
    constructor(client: Client) {
        super(client, {
            name: "interactionCreate",
            enabled: true,
            once: false,
        });
    };

    async execute(interaction: ButtonInteraction) {

        if (interaction.isButton() && interaction.customId.startsWith("regenButton")) {

            const mindmapID = interaction.customId.split("_")[1];
            const data = db.get(`user.${interaction.user.id}.${mindmapID}`);
            const mindmap = new MindMap();

            const loadingEmbed = new this.Embed()
                .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Loading... 🖨️" })
                .setDescription(`Please wait... Mindmap Image is currently being generated.`)
                .setColor("Orange")
                .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                .setTimestamp();

            await interaction.reply({ embeds: [loadingEmbed] });

            const formattedData: Config = mindmap.translateJsonToMindMap(data);
            mindmap.setConfig(formattedData);
            const image: Buffer = await mindmap.generateImage();

            const attachment = new this.Attachment(image, { name: 'mindmap.png' });

            const row = new this.Row<ButtonBuilder>()
                .addComponents(
                    new this.Button()
                        .setLabel("Regenerate")
                        .setStyle(this.ButtonStyle.Success)
                        .setCustomId(`regenButton_${mindmapID}`)
                        .setEmoji("🖨️")
                        .setDisabled(false)
                );

            const successEmbed = new this.Embed()
                .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Success 🎉" })
                .setDescription(`✅ Your image successfully generated!`)
                .setImage(`attachment://${attachment.name}`)
                .setColor("Green")
                .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                .setTimestamp();
            await interaction.followUp({ embeds: [successEmbed], files: [attachment], components: [row] });

        };
    };
};