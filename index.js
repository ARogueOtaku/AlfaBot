require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const messsageHandler = require("./my_modules/message-handler");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("~help", { type: "LISTENING" });
});

client.on("message", async (message) => {
  const messageContent = message.content;
  if (
    !messageContent.startsWith(process.env.BOT_PREFIX) ||
    message.author.id == client.user.id
  )
    return;
  try {
    await messsageHandler.handleCommand(message);
  } catch (e) {
    message.channel.send(
      "Someone Restricted my Permissions :pleading_face:.\nPlease Grant My Role Manage Message Permissions :innocent:.\nThis helps me keep the chat clean."
    );
  }
});

client.on("guildCreate", (guild) => {
  console.log(
    "Joined Guild: " +
      guild.name +
      " which is owned by " +
      guild.owner.displayName +
      "[" +
      guild.owner.user.tag +
      "]"
  );
});

client.login(process.env.BOT_TOKEN);

//change
