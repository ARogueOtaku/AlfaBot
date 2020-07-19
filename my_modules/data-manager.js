const steamHandler = require("./steamApiHandler");

//List of All Supported Currencies by Steam.
const currencyData = {
  currencies: {
    AE: "United Arab Emirates Dirham",
    AR: "Argentine Peso",
    AU: "Australian Dollars",
    BR: "Brazilian Reals",
    CA: "Canadian Dollars",
    CH: "Swiss Francs",
    CL: "Chilean Peso",
    CN: "Chinese Renminbi (yuan)",
    CO: "Colombian Peso",
    CR: "Costa Rican Colón",
    DE: "European Union Euro",
    GB: "United Kingdom Pound",
    HK: "Hong Kong Dollar",
    IL: "Israeli New Shekel",
    ID: "Indonesian Rupiah",
    IN: "Indian Rupee",
    JP: "Japanese Yen",
    KR: "South Korean Won",
    KW: "Kuwaiti Dinar",
    KZ: "Kazakhstani Tenge",
    MX: "Mexican Peso",
    MY: "Malaysian Ringgit",
    NO: "Norwegian Krone",
    NZ: "New Zealand Dollar",
    PE: "Peruvian Sol",
    PH: "Philippine Peso",
    PL: "Polish Złoty",
    QA: "Qatari Riyal",
    RU: "Russian Rouble",
    SA: "Saudi Riyal",
    SG: "Singapore Dollar",
    TH: "Thai Baht",
    TR: "Turkish Lira",
    TW: "New Taiwan Dollar",
    UA: "Ukrainian Hryvnia",
    US: "United States Dollar",
    UY: "Uruguayan Peso",
    VN: "Vietnamese Dong",
    ZA: "South African Rand",
  },
  currencyUserMapping: {},
};

const manager = {
  //Method to fetch Currency Name for a Currency Code.
  getCurrency: function (curr) {
    return currencyData.currencies[curr.toUpperCase()];
  },

  //Method to set the User's current Preferred Currency.
  setUserCurrency: function (userid, curr) {
    currencyData.currencyUserMapping[userid] = curr;
  },

  //Method to fetch the User's current Preferred Currency.
  getUserCurrency: function (userid) {
    return currencyData.currencyUserMapping[userid];
  },

  //Method to fetch all suppoeted Currencies.
  getCurrencyList: function () {
    let list = "",
      i = 1;
    for (curr in currencyData.currencies)
      list +=
        "\n**" +
        i++ +
        "**. " +
        curr +
        ": " +
        currencyData.currencies[curr] +
        ".";
    return list;
  },

  //Method to format an app's details into a Discord Embed Message.
  formatData: function (data, appid) {
    //Check if Any Data was found for the AppID.
    if (!data[appid] || !data[appid].success) {
      return (
        "No Data Found for AppID: `" +
        appid +
        "`.Consider Searching for the App Id first using `search <Game Name>`."
      );
    }

    let finalData = {},
      actualData = data[appid].data;

    //Set the Color.
    finalData.color = 16777215;

    //Set the Title.
    finalData.title = actualData.name.length > 0 ? actualData.name : "N/A";

    //Set the Description.
    finalData.description = (actualData.detailed_description.length > 0
      ? actualData.detailed_description.substr(0, 2000) + "..."
      : "N/A"
    )
      .replace(/\<.*?>/g, " ")
      .replace(/\n+/g, "\n")
      .replace(/(\r\n)+/g, "\n")
      .replace(/\t+/g, " ")
      .replace(/\s+/g, " ");

    //Set the Image if Available.
    if (actualData.header_image) {
      finalData.image = { url: actualData.header_image };
    }

    //Set the URL to Steam Store.
    finalData.url = "http://store.steampowered.com/app/" + appid;

    //Set the Footer to the Game's Release Date.
    finalData.footer = {
      text:
        "**Release Date** " +
        (actualData.release_date
          ? actualData.release_date.date
            ? actualData.release_date.date
            : "N/A"
          : "N/A"),
    };
    finalData.fields = [];

    //Set the Fields [Devs, Publishers, Metacritic Score, Price Info, Platforms, ]
    finalData.fields.push({
      name: "Developers",
      value: actualData.developers || "N/A",
      inline: true,
    });
    finalData.fields.push({
      name: "Publishers",
      value: actualData.publishers || "N/A",
      inline: true,
    });
    if (actualData.metacritic)
      finalData.fields.push({
        name: "Metacritic Score",
        value: actualData.metacritic.score || "N/A",
        inline: true,
      });
    if (actualData.is_free)
      finalData.fields.push({
        name: "Original Price",
        value: "Free",
        inline: true,
      });
    else if (actualData.price_overview) {
      finalData.fields.push({
        name: "Original Price",
        value: actualData.price_overview.initial_formatted || "N/A",
        inline: true,
      });
      finalData.fields.push({
        name: "Discount",
        value: actualData.price_overview.discount_percent
          ? actualData.price_overview.discount_percent + "%"
          : "N/A",
        inline: true,
      });
      finalData.fields.push({
        name: "Current Price",
        value: actualData.price_overview.final_formatted || "N/A",
        inline: true,
      });
    }
    let platforms = "";
    for (platform in actualData.platforms) {
      if (actualData.platforms[platform]) platforms += ", " + platform;
    }
    finalData.fields.push({
      name: "Platforms",
      value: platforms
        .replace(/, (.)/g, (match) => match.toUpperCase())
        .substring(2),
      inline: true,
    });
    return { embed: finalData };
  },

  //Method to Fetch AppIDs for the searched App Name.
  getApps: async function (searchText, userid) {
    const currency = this.getUserCurrency(userid)
      ? this.getUserCurrency(userid)
      : "US";
    const appsFound = await steamHandler.getSteamSuggestion(
      searchText,
      currency
    );
    return appsFound.length > 0
      ? "Here are the Apps I found:\n" +
          appsFound
            .map(
              (app, i) =>
                "**" +
                (i + 1) +
                ".** " +
                (app.name ? "**" + app.name + "**" : "") +
                (app.price ? ", " + app.price : "") +
                (app.appid ? ",`AppID: " + app.appid + "`" : "")
            )
            .join("\n")
      : "No Apps fond with Text: " + searchText;
  },

  //Method to Get App details from Steam. This data is passed on to <formatData> to form an Embed.
  getAppData: async function (appid, userid) {
    const currency = this.getUserCurrency(userid)
      ? this.getUserCurrency(userid)
      : "US";
    let data;
    try {
      data = await steamHandler.getSteamAppData(appid, currency);
      return this.formatData(data, appid);
    } catch (e) {
      console.log(e);
      return "Steam Did not Send Appropriate Data. Please try Again in a while!";
    }
  },
};

module.exports = manager;
