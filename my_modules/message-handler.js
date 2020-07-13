const dataManager = require("./data-manager");
const handler = {
  //Method to Parse any Incoming messages that are qualified as a AlfaBot Message.
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

  //Method to handle any incoming AlfaBot Message after Parsing It.
  handleCommand: async function (message) {
    const { command, parameter } = this.parseMessage(message.content);
    let reply;
    switch (command.toLowerCase()) {
      //Search Steam for a specified search term.
      case "search":
        /*if (!dataManager.getListAvailability())
          reply =
            "The Database of Games is being Updated right now. Please try after a while!";*/
        if (parameter.length == 0)
          reply =
            "Please Enter a Search Term. `" +
            process.env.BOT_PREFIX +
            "search <Game Name>`";
        else reply = await dataManager.getApps(parameter, message.author.id);
        break;

      //Set the users' currency
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
              parameter.toUpperCase()
            );
            reply = "Your Currency is set to: `" + curr + "`";
          }
        }
        break;

      //Give Detailed Info on a Steam game.
      case "details":
        /*if (!dataManager.getListAvailability())
          reply =
            "The Database of Games is being Updated right now. Please try after a while!";*/
        if (parameter.length == 0)
          reply =
            "Please Enter an App Id. `" +
            process.env.BOT_PREFIX +
            "details <App Id>`";
        else reply = await dataManager.getAppData(parameter, message.author.id);
        break;

      //See the User's currently set Currency.
      case "my-curr":
        const userCurrency = dataManager.getUserCurrency(message.author.id);
        if (!userCurrency)
          reply =
            "You have not set your Currency Yet. It will be Defaulted to `USD`.";
        else
          reply =
            "Your Current Currency is: `" +
            dataManager.getCurrency(userCurrency) +
            "`";
        break;

      //List out the Commands for the Bot.
      case "help":
        reply =
          "\n1. `" +
          process.env.BOT_PREFIX +
          "search <Game Name>` - Search for a Game to get its Steam ID.\n2. `" +
          process.env.BOT_PREFIX +
          "set-curr <Currency Code>` - Set your Preferred Currency.\n3. `" +
          process.env.BOT_PREFIX +
          "my-curr` - See your currently set Currency.\n4. `" +
          process.env.BOT_PREFIX +
          "details <App Id>` - Look at various App Details like Prices, Critic Score, etc.\n5. `" +
          process.env.BOT_PREFIX +
          "help` - Bring up this menu again.";
        break;

      //Default case when invalid Command.
      default:
        reply =
          "No such Command: " +
          command +
          ". Type `" +
          process.env.BOT_PREFIX +
          "help` for a list of available commands.";
        break;
    }
    message.reply(reply);
  },
};

module.exports = handler;
