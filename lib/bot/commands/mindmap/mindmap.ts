import { Command, DefaultOptionParams } from "../../../utils/Command";
import { Config, MindMap } from "../../../utils/mindMapManager";
import { Database } from "../../../base/Database";
import { generateID } from "../../../utils/Utils";
import { ActionRowBuilder, ButtonBuilder, Client } from "discord.js";

const db = new Database();

export default class extends Command {
    constructor(client: Client) {
        super(client, {
            name: "mindmap",
            description: "Mind map utility commands.",
            enabled: true
        });

        this.set(new
            this.SlashCommand()
            .addSubcommand(sub =>
                sub
                    .setName("create-map")
                    .setDescription("Create's a Mind map.")
                    .addStringOption(o =>
                        o
                            .setName("name")
                            .setDescription("Name of the Mind map.")
                            .setRequired(true)
                    )
            )
            .addSubcommand(sub =>
                sub
                    .setName("add-node")
                    .setDescription("Adds node to a Mind map.")
                    .addStringOption(o =>
                        o
                            .setName("mindmap-id")
                            .setDescription("Mind map ID.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
                    .addStringOption(o =>
                        o
                            .setName("node-text")
                            .setDescription("Text of Node.")
                            .setRequired(true)
                    )
                    .addStringOption(o =>
                        o
                            .setName("node-color")
                            .setDescription("Color of Node. Write an color name ex. White or use hex codes.")
                            .setRequired(true)
                    )
            )
            .addSubcommand(sub =>
                sub
                    .setName("remove-node")
                    .setDescription("Removes a node from a Mind map.")
                    .addStringOption(o =>
                        o
                            .setName("mindmap-id")
                            .setDescription("Mind map ID.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
                    .addStringOption(o =>
                        o
                            .setName("node-id")
                            .setDescription("ID of Node.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
            )
            .addSubcommand(sub =>
                sub
                    .setName("generate-image")
                    .setDescription("Generates an image of the Mind map.")
                    .addStringOption(o =>
                        o
                            .setName("mindmap-id")
                            .setDescription("Mind map ID.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
            )
            .addSubcommand(sub =>
                sub
                    .setName("delete-mindmap")
                    .setDescription("Deletes a Mind map.")
                    .addStringOption(o =>
                        o
                            .setName("mindmap-id")
                            .setDescription("Mind map ID.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
            )
            .addSubcommand(sub =>
                sub
                    .setName("edit-mindmap-name")
                    .setDescription("Edits the name of a Mind map.")
                    .addStringOption(o =>
                        o
                            .setName("mindmap-id")
                            .setDescription("Mind map ID.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
                    .addStringOption(o =>
                        o
                            .setName("new-name")
                            .setDescription("New name of the Mind map.")
                            .setRequired(true)
                    )
            )
            .addSubcommand(sub =>
                sub
                    .setName("edit-node")
                    .setDescription("Edits a node in a Mind map.")
                    .addStringOption(o =>
                        o
                            .setName("mindmap-id")
                            .setDescription("Mind map ID.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
                    .addStringOption(o =>
                        o
                            .setName("node-id")
                            .setDescription("ID of Node.")
                            .setRequired(true)
                            .setAutocomplete(true)
                    )
                    .addStringOption(o =>
                        o
                            .setName("node-text")
                            .setDescription("Text of Node.")
                    )
                    .addStringOption(o =>
                        o
                            .setName("node-color")
                            .setDescription("Color of Node. Write an color name ex. White or use hex codes.")
                    )
            )
            .addSubcommand(sub =>
                sub
                    .setName("mindmap-list")
                    .setDescription("Show's list of available Mindmaps.")
            )
        );
    };

    async execute({ interaction, guild, member, client }: DefaultOptionParams) {

        switch (interaction.options.getSubcommand()) {

            case "create-map": {
                const mindmapName = interaction.options.getString("name");
                const id = "MM-" + generateID();

                db.set(`user.${interaction.user.id}.${id}`, {
                    id: id,
                    name: mindmapName
                });

                const embed = new this.Embed()
                    .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Success 🎉" })
                    .setDescription(`🚀 Successfully created mindmap with id, \`${id}\``)
                    .setColor("Green")
                    .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                    .setTimestamp();
                interaction.reply({ embeds: [embed] });
                break;
            };

            case "add-node": {
                const mindmapID = interaction.options.getString("mindmap-id");

                if (!db.get(`user.${interaction.user.id}.${mindmapID}`)) {
                    const embed = new this.Embed()
                        .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Error 🚫" })
                        .setDescription(`🔍 Mindmap with id of \`${mindmapID}\` could not be found.`)
                        .setColor("Red")
                        .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                    break;
                }

                const nodetext = interaction.options.getString("node-text");
                const nodecolor = interaction.options.getString("node-color") ?? "white";

                const nodeid = "ND-" + generateID();

                db.set(`user.${interaction.user.id}.${mindmapID}.nodes.${nodeid}`, {
                    id: nodeid,
                    nodetext: nodetext,
                    nodecolor: nodecolor
                })

                const successEmbed = new this.Embed()
                    .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Success 🎉" })
                    .setDescription(`✅ Node with id of \`${nodeid}\` has been successfully added to the mindmap with id of \`${mindmapID}\`.`)
                    .setColor("Green")
                    .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                    .setTimestamp();
                interaction.reply({ embeds: [successEmbed] });
                break;
            };

            case "remove-node": {
                const mindmapID = interaction.options.getString("mindmap-id");

                if (!db.get(`user.${interaction.user.id}.${mindmapID}`)) {
                    const embed = new this.Embed()
                        .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Error 🚫" })
                        .setDescription(`🔍 Mindmap with id of \`${mindmapID}\` could not be found.`)
                        .setColor("Red")
                        .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                    break;
                }

                const nodeID = interaction.options.getString("node-id");

                if (!db.get(`user.${interaction.user.id}.${mindmapID}.nodes.${nodeID}`)) {
                    const embed = new this.Embed()
                        .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Error 🚫" })
                        .setDescription(`🔍 Node with id of \`${nodeID}\` could not be found.`)
                        .setColor("Red")
                        .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                    break;
                }

                db.delete(`user.${interaction.user.id}.${mindmapID}.nodes.${nodeID}`)

                const successEmbed = new this.Embed()
                    .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Success 🎉" })
                    .setDescription(`✅ Node with id of \`${nodeID}\` has been successfully removed to the mindmap with id of \`${mindmapID}\`.`)
                    .setColor("Green")
                    .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                    .setTimestamp();
                interaction.reply({ embeds: [successEmbed] });
                break;

            };

            case "delete-mindmap": {

                const mindmapID = interaction.options.getString("mindmap-id");

                if (!db.get(`user.${interaction.user.id}.${mindmapID}`)) {
                    const embed = new this.Embed()
                        .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Error 🚫" })
                        .setDescription(`🔍 Mindmap with id of \`${mindmapID}\` could not be found.`)
                        .setColor("Red")
                        .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                    break;
                }

                db.delete(`user.${interaction.user.id}.${mindmapID}`)

                const successEmbed = new this.Embed()
                    .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Success 🎉" })
                    .setDescription(`✅ Mindmap with id of \`${mindmapID}\` has been successfully deleted.`)
                    .setColor("Green")
                    .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                    .setTimestamp();
                interaction.reply({ embeds: [successEmbed] });
                break;

            };

            case "edit-mindmap-name": {
                const mindmapID = interaction.options.getString("mindmap-id");

                if (!db.get(`user.${interaction.user.id}.${mindmapID}`)) {
                    const embed = new this.Embed()
                        .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Error 🚫" })
                        .setDescription(`🔍 Mindmap with id of \`${mindmapID}\` could not be found.`)
                        .setColor("Red")
                        .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                    break;
                }

                const newname = interaction.options.getString("new-name");
                db.set(`user.${interaction.user.id}.${mindmapID}.name`, newname)

                const successEmbed = new this.Embed()
                    .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Success 🎉" })
                    .setDescription(`✅ Mindmap with id of \`${mindmapID}\` name successfully changed to \`${newname}\`.`)
                    .setColor("Green")
                    .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                    .setTimestamp();
                interaction.reply({ embeds: [successEmbed] });
                break;

            };

            case "edit-node": {

                const mindmapID = interaction.options.getString("mindmap-id");

                if (!db.get(`user.${interaction.user.id}.${mindmapID}`)) {
                    const embed = new this.Embed()
                        .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Error 🚫" })
                        .setDescription(`🔍 Mindmap with id of \`${mindmapID}\` could not be found.`)
                        .setColor("Red")
                        .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                    break;
                }

                const nodeID = interaction.options.getString("node-id");

                if (!db.get(`user.${interaction.user.id}.${mindmapID}.nodes.${nodeID}`)) {
                    const embed = new this.Embed()
                        .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Error 🚫" })
                        .setDescription(`🔍 Node with id of \`${nodeID}\` could not be found.`)
                        .setColor("Red")
                        .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                    break;
                }

                const data = db.get(`user.${interaction.user.id}.${mindmapID}.nodes.${nodeID}`);
                const newtext = interaction.options.getString("node-text");
                const newcolor = interaction.options.getString("node-color");

                if (!newcolor && !newtext) {
                    const embed = new this.Embed()
                        .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Error 🚫" })
                        .setDescription(`\`Node color\` and \`Node text\` cannot be empty at the same time!\n If you want to delete a node, Please use \`/mindmap remove-node\` command.`)
                        .setColor("Red")
                        .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                    break;
                }

                const changes = [];
                const propertyDesigns = {
                    emojis: {
                        nodetext: "📝 ",
                        nodecolor: "🎨 "
                    },
                    texts: {
                        nodetext: "Node text",
                        nodecolor: "Node color"
                    }
                };

                for (const property of ['nodetext', 'nodecolor']) {
                    const oldVal = data[property];
                    const newVal = property === 'nodetext' ? newtext : newcolor;

                    if (newVal) {
                        if (oldVal !== newVal) {
                            changes.push(`${propertyDesigns.emojis[property]}${propertyDesigns.texts[property]}: \`${oldVal}\` → \`${newVal}\``);
                            db.set(`user.${interaction.user.id}.${mindmapID}.nodes.${nodeID}.${property}`, newVal)
                        };
                    };
                };

                const successEmbed = new this.Embed()
                    .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Success 🎉" })
                    .setDescription(`✅ Settings for Mindmap \`${mindmapID}\`, Node \`${nodeID}\` have been successfully changed\n**Changes**:\n${changes.join("\n")}`)
                    .setColor("Green")
                    .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                    .setTimestamp();

                interaction.reply({ embeds: [successEmbed] });
                break;
            };

            case "generate-image": {

                const mindmap = new MindMap();
                const mindmapID = interaction.options.getString("mindmap-id");
                const data = db.get(`user.${interaction.user.id}.${mindmapID}`);

                if (!data) {
                    const embed = new this.Embed()
                        .setAuthor({ iconURL: interaction.user.avatarURL(), name: "Error 🚫" })
                        .setDescription(`🔍 Mindmap with id of \`${mindmapID}\` could not be found.`)
                        .setColor("Red")
                        .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                        .setTimestamp();
                    interaction.reply({ embeds: [embed] });
                    break;
                }

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
                break;

            };

            case "mindmap-list": {

                const data = db.get(`user.${interaction.user.id}`);

                function findKeysWithPrefix(object, prefix) {
                    const keys = [];
                    if (typeof object !== 'object') {
                        return keys;
                    }

                    for (const key in object) {
                        if (key.startsWith(prefix)) {
                            keys.push({ key, name: object[key].name });
                        }
                        keys.push(...findKeysWithPrefix(object[key], prefix));
                    }
                    return keys;
                }

                const mmKeys = findKeysWithPrefix(data, "MM-");

                let message = `🔍 Looks like you have **${mmKeys.length}** Mind maps:\n`;
                if (mmKeys.length > 0) {
                    message = `It looks like you have ${mmKeys.length} mindmaps:\n`;
                    mmKeys.forEach((entry, index) => {
                        message += `${index + 1}. ID: ${entry.key} | Name: ${entry.name}\n`;
                    });
                } else message = "🧐 Hmm, it looks like you don't have any mindmaps created. \n Let's create a mindmap using `/mindmap create-map`!";

                const embed = new this.Embed()
                    .setAuthor({ iconURL: interaction.user.avatarURL(), name: "List of your Mindmaps 📜" })
                    .setDescription(message)
                    .setColor("Green")
                    .setFooter({ text: '⏰ ' + new Date().toLocaleString() })
                    .setTimestamp();
                interaction.reply({ embeds: [embed] });
                break;
            };

        };

    };
};