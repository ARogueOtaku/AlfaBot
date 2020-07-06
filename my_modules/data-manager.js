const fetch = require("node-fetch");
const Discord = require("discord.js");
const appData = {
  apps: [],
  available: false,
  updatedOn: "Never",
};
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
    EU: "European Union Euro",
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
  getListAvailability: function () {
    return appData.available;
  },

  getCurrency: function (curr) {
    return currencyData.currencies[curr.toUpperCase()];
  },

  setUserCurrency: function (userid, channelid, curr) {
    currencyData.currencyUserMapping[channelid + "|" + userid] = curr;
  },

  getUserCurrency: function (userid, channelid) {
    return currencyData.currencyUserMapping[channelid + "|" + userid];
  },

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

  updateList: async function () {
    console.log("Attempting to Update Applist");
    appData.available = false;
    try {
      const res = await fetch(
        "https://api.steampowered.com/IStoreService/GetAppList/v1?max_results=50000&key=" +
          process.env.STEAM_API_KEY
      );
      const data = await res.json();
      appData.apps =
        data.response.apps instanceof Array ? data.response.apps : appData.apps;
      appData.updatedOn = new Date();
    } catch (err) {
      console.log(err);
    } finally {
      appData.available = true;
      console.log("Applist Updated on:", appData.updatedOn);
      console.log("Updated App Count:", appData.apps.length);
    }
  },

  formatData: function (data, appid) {
    if (!data[appid].success) {
      return (
        "No Data Found for AppID: `" +
        appid +
        "`.Consider Searching for the App Id first using `search <Game Name>`."
      );
    }
    let finalData = {},
      actualData = data[appid].data;
    finalData.color = "white";
    finalData.title = actualData.name.length > 0 ? actualData.name : "N/A";
    finalData.description = (actualData.detailed_description.length > 0
      ? actualData.detailed_description.substr(0, 2000) + "..."
      : "N/A"
    )
      .replace(/\<.*?>/g, " ")
      .replace(/\n+/g, "\n")
      .replace(/(\r\n)+/g, "\n")
      .replace(/\t+/g, " ")
      .replace(/\s+/g, " ");
    finalData.author = { name: "AlfaBot" };
    if (actualData.header_image) {
      finalData.image = { url: actualData.header_image };
    }
    finalData.url = "http://store.steampowered.com/app/" + appid;

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
        value: actualData.price_overview.discount_percent + "%" || "N/A",
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
    return finalData;
  },

  getApps: function (searchText) {
    let appsFound = appData.apps
      .filter(
        (app) =>
          app.name.length <= 100 &&
          app.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .map(
        (app, index) =>
          "**" +
          (index + 1) +
          "**. " +
          app.name +
          " `App ID: " +
          app.appid +
          "`"
      );
    appsFound = appsFound.join("\n");
    return appsFound.length > 0
      ? appsFound.length >= 2000
        ? "Too Many Matches Found. Plese Try Narrowing down yor Search by Entering a few more letters"
        : "I found these Games:\n" + appsFound
      : "No Apps Found with Text: " + searchText;
  },

  getAppData: async function (appid, userid, channelid) {
    const currency = this.getUserCurrency(userid, channelid)
      ? this.getUserCurrency(userid, channelid)
      : "US";
    try {
      const res = await fetch(
        "https://store.steampowered.com/api/appdetails?cc=" +
          currency +
          "&appids=" +
          appid
      );
      let data = await res.json();
      return this.formatData(data, appid);
    } catch (e) {
      return "Could not Communicte with Steam API. Please try Again in a while";
    }
  },
};

manager.updateList();

module.exports = manager;
