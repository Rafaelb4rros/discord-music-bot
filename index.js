import CustomClient from "./Client.js";
import fs from "fs";
import Discord from "discord.js";
import { Player } from "discord-player";
import config from "./config.json";

const client = new CustomClient();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for await (const file of commandFiles) {
  const command = await (await import(`./commands/${file}`)).default;
  client.commands.set(command.name, command);
}

const player = new Player(client);

player.on("error", (queue, error) => {
  console.log(
    `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
  );
});

player.on("connectionError", (queue, error) => {
  console.log(
    `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
  );
});

player.on("trackStart", (queue, track) => {
  queue.metadata.send(
    `▶ | Começando a tocar: **'-' ${track.title} '-'** no canal **'-' ${queue.connection.channel.name} '-'**`
  );
});

player.on("trackAdd", (queue, track) => {
  queue.metadata.send(
    `🎶 | Música **'-' ${track.title} '-'** adicionada a fila!`
  );
});

player.on("botDisconnect", (queue) => {
  queue.metadata.send("❌ | Fui desconectado socorro, limpando fila!");
});

player.on("channelEmpty", (queue) => {
  queue.metadata.send("❌ | Canal vazio, vazando...");
});

player.on("queueEnd", (queue) => {
  queue.metadata.send("✅ | Música finalizada!");
});

client.once("ready", async () => {
  console.log("Ready!");
});

client.on("ready", function () {
  client.user.setActivity(config.activity, { type: config.activityType });
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!client.application?.owner) await client.application?.fetch();

  if (message.content === "!salve") {
    return void message.reply("salve '-'");
  }

  if (
    message.content === "!birl" &&
    message.author.id === client.application?.owner?.id
  ) {
    await message.guild.commands
      .set(client.commands)
      .then(() => {
        message.reply("Deployed");
      })
      .catch((err) => {
        message.reply("Could not deploy commands!");
        console.error(err);
      });
  }
});
client.on("interactionCreate", async (interaction) => {
  const command = client.commands.get(interaction.commandName.toLowerCase());

  try {
    command.execute(interaction, player);
  } catch (err) {
    console.error(err);
    interaction.followUp({
      content: "Error executing command",
    });
  }
});

client.login(config.token);
