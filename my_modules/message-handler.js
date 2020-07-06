const dataManager = require("./data-manager");
const manager = require("./data-manager");
const handler = {
  parseMessage: function (text) {
    const spaceIndex = text.indexOf(" ");
    return {
      command:
        spaceIndex > -1
          ? text.substring(0, spaceIndex).replace(process.env.BOT_PREFIX, "")
          : text.replace(process.env.BOT_PREFIX, ""),
      parameter: spaceIndex > -1 ? text.substring(spaceIndex + 1) : "",
    };
  },

  handleCommand: async function (message) {
    const { command, parameter } = this.parseMessage(message.content);
    let reply;
    switch (command.toLowerCase()) {
      case "search":
        if (!manager.getListAvailability())
          reply =
            "The Database of Games is being Updated right now. Please try after a while!";
        else if (parameter.length == 0)
          reply =
            "Please Enter a Search Term. `" +
            process.env.BOT_PREFIX +
            "search <Game Name>`";
        else reply = dataManager.getApps(parameter);
        break;

      case "set-curr":
        if (parameter.length == 0)
          reply =
            "Available set of Currency Codes are:\n" +
            dataManager.getCurrencyList() +
            "\n\nPlease Enter a Currency Code. `" +
            process.env.BOT_PREFIX +
            "set-curr <Currency Code>`.";
        else {
          const curr = dataManager.getCurrency(parameter);
          if (!curr)
            reply =
              "No Currency found with Code: " +
              parameter +
              ".Please see Available Currency Codes below.\n" +
              dataManager.getCurrencyList();
          else {
            dataManager.setUserCurrency(
              message.author.id,
              message.channel.id,
              parameter.toUpperCase()
            );
            reply = "Your Currency for this Channel is set to: `" + curr + "`";
          }
        }
        break;

      case "details":
        if (!manager.getListAvailability())
          reply =
            "The Database of Games is being Updated right now. Please try after a while!";
        else if (parameter.length == 0)
          reply =
            "Please Enter an App Id. `" +
            process.env.BOT_PREFIX +
            "details <App Id>`";
        else
          reply = await dataManager.getAppData(
            parameter,
            message.author.id,
            message.channel.id
          );
        break;

      case "my-curr":
        const userCurrency = dataManager.getUserCurrency(
          message.author.id,
          message.channel.id
        );
        if (!userCurrency)
          reply =
            "You have not set your Currency for this Channel Yet. It will be Defaulted to `USD`.";
        else
          reply =
            "Your Current Currency for this Channel is: `" +
            dataManager.getCurrency(userCurrency) +
            "`";
        break;

      case "help":
        reply =
          "\n1. `" +
          process.env.BOT_PREFIX +
          "search <Game Name>` - Search for a Game to get its Steam ID.\n2. `" +
          process.env.BOT_PREFIX +
          "set-curr <Currency Code>` - Set your Preferred Currency for this Channel.\n3. `" +
          process.env.BOT_PREFIX +
          "my-curr` - See your currently set Currency for this Channel.\n4. `" +
          process.env.BOT_PREFIX +
          "details <App Id>` - Look at various App Details like Prices, Critic Score, etc.\n5. `" +
          process.env.BOT_PREFIX +
          "help` - Bring up this menu again.";
        break;

      default:
        reply =
          "No such Command: " +
          command +
          ". Type `" +
          process.env.BOT_PREFIX +
          "help` for a list of available commands.";
        break;
    }
    if (typeof reply == "string") message.reply(reply);
    else message.reply({ embed: reply });
  },
};

module.exports = handler;
