import { Client, Collection, Intents } from "discord.js";

export default class CustomClient extends Client {
  constructor(cfg) {
    super({
      intents: [
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
      ],
    });

    this.commands = new Collection();
    this.config = cfg;
  }
}
