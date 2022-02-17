// ==UserScript==
// @name         KeyJoker 标记已有游戏
// @description  KeyJoker 标记已有游戏
// @version      0.2
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
// ==/UserScript==

(function () {
  'use strict';

  let steamId = '76561198130053503'; // 替换成自己的

  const pathname = document.location.pathname;
  console.log(pathname);
  if (pathname == '/' || pathname == '/bulkbuy' || pathname.startsWith("/giveways")) {
    GM_xmlhttpRequest({
      method: 'get',
      url: 'https://steamdb.keylol.com/syncProxy.php?type=own&id=' + steamId,
      onload: function (result) {
        const data = JSON.parse(result.responseText)
        console.log('game_count: ' + data.response.game_count)
        const appidList = data.response.games.map(x => x.appid)

        if (pathname.startsWith("/giveaways")) {
          const appid = parseInt(pathname.split('-').pop())
          if (appidList.includes(appid)) {
            $('.border-bottom')[0].style = "background-color: yellowgreen;";
          }
        } else {
          setInterval(() => {() =>
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
      }
    });
  }

  function getAppidListByApi() {
    // let url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=1470922A6B6E5C001546E51ACA5D987B&include_played_free_games=true&steamid=${steamId}`;
    let url = `https://steamdb.keylol.com/syncProxy.php?type=own&id=${steamId}`;
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'get',
        url: url,
        responseType: 'json',
        onload: function (result) {
          resolve(result.response);
        },
        onerror: reject,
        ontimeout: reject,
      })
    });
  }
})();
