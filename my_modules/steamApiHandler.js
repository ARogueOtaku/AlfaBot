const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

const util = {
  //Method to Fetch Steam Games List using IStoreService API.
  /*This is Resource Intensive and requires Maintenance.
    Only Use this Method if <getSteamSuggestion> stops working.
  */
  getSteamApplist: async function (limit = 50000, lastappid = undefined) {
    const list = [];
    const fetchURL =
      "https://api.steampowered.com/IStoreService/GetAppList/v1?max_results=" +
      limit +
      "&key=" +
      "2EA50AC8CED1D8934176A8D9EACA8706" +
      (lastappid != undefined ? "&last_appid=" + lastappid : "");
    const response = await fetch(fetchURL);
    const data = await response.json();
    if (data.response && data.response.apps instanceof Array) {
      list.push(...data.response.apps);
      if (data.response.apps.length == limit) {
        const lastAppId =
          data.response.apps[data.response.apps.length - 1].appid;
        const nextList = await this.getSteamApplist(limit, lastAppId);
        list.push(...nextList);
      }
    }
    return list;
  },

  //Method to Fetch Steam Game Details.
  getSteamAppData: async function (appid, currency) {
    const res = await fetch(
      "https://store.steampowered.com/api/appdetails?cc=" +
        currency +
        "&appids=" +
        appid
    );
    const data = await res.json();
    return data;
  },

  getSteamAppReviews: async function (appid) {
    const res = await fetch(
      "https://store.steampowered.com/appreviews/" +
        appid +
        "?json=1&language=all&review_type=all&purchase_type=all&filter=all&num_per_page=0"
    );
    const data = await res.json();
    return data;
  },

  //Method to Get Apps aginst a term based on Steam's Store Suggestion.
  getSteamSuggestion: async function (term, currency) {
    const fetchURL =
      "https://store.steampowered.com/search/suggest?term=" +
      term +
      "&cc=" +
      currency +
      "&f=games";
    const res = await fetch(fetchURL);
    const html = await res.text();
    const document = new JSDOM(html).window.document;
    let rows = document.querySelectorAll("a[data-ds-appid]");
    let apps = [];
    rows.forEach((row) => {
      let name = row.querySelector(".match_name");
      let price = row.querySelector(".match_price");
      apps.push({
        appid: row.getAttribute("data-ds-appid"),
        name: name ? name.textContent || undefined : undefined,
        price: price ? price.textContent || undefined : undefined,
      });
    });
    return apps;
  },

  //Methof to Get the Top 100 Played Games Today
  getPlayerStats: async function () {
    const fetchURL =
      "https://store.steampowered.com/stats/Steam-Game-and-Player-Statistics?l=english";
    const res = await fetch(fetchURL);
    const html = await res.text();
    const document = new JSDOM(html).window.document;
    let rows = document.querySelectorAll("#detailStats .player_count_row");
    let playerCountData = [];
    rows.forEach((row) => {
      let current = row.querySelector("td:nth-child(1) .currentServers");
      let peak = row.querySelector("td:nth-child(2) .currentServers");
      let game = row.querySelector("td:nth-child(4) .gameLink");
      playerCountData.push({
        current: current ? current.textContent || undefined : undefined,
        peak: peak ? peak.textContent || undefined : undefined,
        game: game ? game.textContent || undefined : undefined,
      });
    });
    return playerCountData;
  },
};

module.exports = util;
