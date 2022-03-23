// ==UserScript==
// @name         KeyJoker 标记已有游戏
// @description  KeyJoker 标记已有游戏
// @version      0.3
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/Key_Joker_Sync
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/Key_Joker_Sync
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/Key_Joker_Sync/Key_Joker_Sync.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/Key_Joker_Sync/Key_Joker_Sync.user.js
// @match        https://www.keyjoker.com/*
// @connect      steamdb.keylol.com
// @connect      api.steampowered.com
// @grant        GM_xmlhttpRequest
// @require      https://cdn.jsdelivr.net/gh/SaulLawliet/UserScripts@8baff43/snippets.js
// ==/UserScript==

(function () {
  'use strict';

  let steamId = '76561198130053503'; // 替换成自己的

  const pathname = document.location.pathname;
  console.log(pathname);
  if (pathname == '/' || pathname == '/bulkbuy' || pathname.startsWith("/giveways")) {
    getAppidListByApi(steamId).then((data) => {
      console.log('game_count: ' + data.response.game_count)
      const appidList = data.response.games.map(x => x.appid)

      if (pathname.startsWith("/giveaways")) {
        const appid = parseInt(pathname.split('-').pop())
        if (appidList.includes(appid)) {
          $('.border-bottom')[0].style = "background-color: yellowgreen;";
        }
      } else {
        setInterval(() => {
          () =>
            $('a').each((index, element) => {
              if (element.href.startsWith("https://www.keyjoker.com/giveaways/")) {
                element.parentNode.parentNode.firstChild.style = "";
                const appid = parseInt(element.href.split('-').pop())
                if (appidList.includes(appid)) {
                  element.parentNode.parentNode.firstChild.style = "background-color: yellowgreen;";
                }
              }
            })
        }, 3000);
      }
    });
  }
})();
