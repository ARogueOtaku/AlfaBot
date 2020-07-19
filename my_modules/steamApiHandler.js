const fetch = require("node-fetch");
const htmlparser = require("htmlparser2");

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

  //Get Apps aginst a term based on Steam's Store Suggestion.
  getSteamSuggestion: async function (term, currency) {
    const fetchURL =
      "https://store.steampowered.com/search/suggest?term=" +
      term +
      "&cc=" +
      currency +
      "&f=games";
    const res = await fetch(fetchURL);
    const html = await res.text();
    const dom = htmlparser.parseDOM(html);
    const applist = dom
      .filter((node) => node.attribs["data-ds-appid"])
      .map((node) => {
        let apps = { appid: node.attribs["data-ds-appid"] };
        let appdata = node.children.filter(
          (n) =>
            n.type == "tag" &&
            ["match_name", "match_price"].includes(n.attribs["class"])
        );
        appdata.forEach((n) => {
          apps[n.attribs["class"].replace(/match_/g, "")] = n.children[0]
            ? n.children[0].data || undefined
            : undefined;
        });
        return apps;
      });
    return applist;
  },
};

module.exports = util;
