// ==UserScript==
// @name         Giveaway.su 标记已有游戏
// @description  Giveaway.su 标记已有游戏
// @version      0.1
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/Giveaway_Su_Sync
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/Giveaway_Su_Sync
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/Giveaway_Su_Sync/Giveaway_Su_Sync.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/Giveaway_Su_Sync/Giveaway_Su_Sync.user.js
// @match        https://giveaway.su/*
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  let steamId = '76561198130053503'; // 替换成自己的

  const pathname = document.location.pathname;
  if (pathname == '/') {
    // 隐藏一下广告
    $('.definetelynotanad').each((i, x) => x.remove());

    getAppidListByApi()
      .then((resp) => {
        console.log('game_count: ' + resp.response.game_count)
        const appidList = resp.response.games.map(x => x.appid)
        $('.giveaway-image img').each((i, img) => {
          if (img.src.indexOf('steamcdn') >= 0) {
            const appid = parseInt(img.src.split('/')[5]);
            if (appidList.includes(appid)) {
              img.style = '-webkit-filter: grayscale(100%);'
              img.parentNode.parentNode.parentNode.style = 'text-decoration: line-through;'
            }
          }
        });
      })
      .catch((error) => {
        console.log(error);
        alert('加载游戏库失败: 请联系开发者.');
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

  function getAppidListByWeb() {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'get',
        url: `http://steamcommunity.com/profiles/${steamId}/games/?tab=all`,
        onload: function (result) {
          result.responseText.split('\n').forEach((line) => {
            if (line.indexOf('var rgGames') >= 0) {
              line = line.replace('var rgGames = ', '');
              line = line.replace('];', ']');
              const games = JSON.parse(line);
              const data = {
                response: {
                  game_count: games.length,
                  games: games,
                }
              };
              resolve(data);
            }
          });
        },
        onerror: reject,
        ontimeout: reject,
      });
    });
  }

})();
