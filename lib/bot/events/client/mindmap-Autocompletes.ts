import { AutocompleteInteraction } from "discord.js";
import { Client } from "../../../base/client";
import { Event } from "../../../utils/Event";
import { Database } from "../../../base/Database";

const db = new Database();

export default class extends Event {
    constructor(client: Client) {
        super(client, {
            name: "interactionCreate",
            enabled: true,
            once: false,
        });
    };

    async execute(interaction: AutocompleteInteraction) {
        if (interaction.isAutocomplete() && interaction.commandName === "mindmap") {

            switch (interaction.options.getSubcommand()) {

                case "generate-image":
                case "delete-mindmap":
                case "edit-mindmap-name":
                case "add-node": {
                    try {
                        const focusedValue = interaction.options.getFocused();
                        const rawUser = db.get(`user.${interaction.user.id}`);
                        if(!rawUser) return;
    
                        let ids = [];
    
                        for (let id in rawUser) {
                            if (id.startsWith('MM')) {
                                ids.push(id);
                            };
                        };
    
                        const filtered = ids.filter(choice => choice.includes(focusedValue));
                        await interaction.respond(
                            filtered.map(choice => ({ name: `ID: ${choice} | Name: ${rawUser[choice].name}`, value: choice })),
                        );
                        break;
                    } catch (err) {
                        console.log(err);
                        break;
                    };
                };
    
                case "edit-node":
                case "remove-node": {
                    try {
                        const focusedValue = interaction.options.getFocused(true);
    
                        if (focusedValue.name === 'mindmap-id') {
                            const rawUser = db.get(`user.${interaction.user.id}`);
                            if(!rawUser) return;
                            const mindmaps = [];
    
                            for (let mindmapID in rawUser) {
                                if (mindmapID.startsWith('MM')) {
                                    mindmaps.push({ id: mindmapID, name: rawUser[mindmapID].name });
                                };
                            };
    
                            const focusedValue = interaction.options.getFocused();
                            const filtered = mindmaps.filter(mindmap => mindmap.id.startsWith(focusedValue));
    
                            await interaction.respond(
                                filtered.map(mindmap => ({ name: `ID: ${mindmap.id} | Name: ${mindmap.name}`, value: mindmap.id })),
                            );
    
                        } else if (focusedValue.name === 'node-id') {
                            const mindMapId = interaction.options.getString('mindmap-id');
                            const rawUser = db.get(`user.${interaction.user.id}`);
                            if(!rawUser) return;
                            const nodes = [];
    
                            for (let nodeID in rawUser[mindMapId].nodes) {
                                nodes.push({ id: nodeID, text: rawUser[mindMapId].nodes[nodeID].nodetext });
                            };
    
                            const focusedValue = interaction.options.getFocused();
                            const filtered = nodes.filter(node => node.id.startsWith(focusedValue));
    
                            await interaction.respond(
                                filtered.map(node => ({ name: `ID: ${node.id} | Text: ${node.text}`, value: node.id })),
                            );
    
                        };
                        break;
                    } catch (err) {
                        console.log(err);
                        break;
                    }
                };
    
            };
        };
    };
};