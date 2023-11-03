import { ActivityType, PresenceUpdateStatus } from "discord.js";
import { Client } from "../../../base/client";
import { Event } from "../../../utils/Event";

export default class extends Event {
  constructor(client: Client) {
    super(client, {
      name: "ready",
      enabled: true,
      once: false,
    });
  };

  execute() {
    this.client.user?.setPresence({ activities: [{ name: `Mindmap Bot <3 MegalithOfficial` }], status: PresenceUpdateStatus.DoNotDisturb })
  };
};