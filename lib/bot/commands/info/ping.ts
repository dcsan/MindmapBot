import { Client, resolveColor } from "discord.js";
import { Command, DefaultOptionParams } from "../../../utils/Command";

export default class extends Command {
  constructor(client: Client) {
    super(client, {
      name: "ping",
      description: "Calculate bot ping",
      enabled: true
    });

    this.set(new this.SlashCommand());
  };

  async execute({ interaction, guild, member, client }: DefaultOptionParams) {
    const api = this.client.ws.ping;
    const bot = Math.round(Date.now() - interaction.createdTimestamp);

    function getStatus(value) {
      if (value >= 150 && value < 300) return ":blue_square:";
      else if (value >= 300 && value < 600) return ":orange_square:";
      else if (value >= 600 && value < 1200) return ":yellow_square:";
      else if (value >= 1200) return ":red_square:";
      else return ":green_square:";
    }

    let api_status = getStatus(api);
    let bot_status = getStatus(bot);

    const embed = new this.Embed({
      title: `${this.client.user?.username} Ping`,
      fields: [
        {
          name: ` WebSocket Ping 🔌`,
          value: `${api_status} \`${api}ms\``,
          inline: true
        },
        {
          name: `API Ping 🚀`,
          value: `${bot_status} \`${bot}ms\``,
          inline: true
        }
      ],
      color: resolveColor("Green"),
    });

    return await interaction.reply({ embeds: [embed] });
  };
};