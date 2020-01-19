// ==UserScript==
// @name         dst-skins-checklist自动同步数据
// @description  为 dst-skins-checklist.github.io 自动拉取玩家数据
// @version      0.2
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/DST_Skins_Sync
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/DST_Skins_Sync
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/DST_Skins_Sync/DST_Skins_Sync.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/DST_Skins_Sync/DST_Skins_Sync.user.js
// @match        dst-skins-checklist.github.io
// @connect      steamcommunity.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  var steamId = "76561198130053503";

  GM_xmlhttpRequest({
    method: "get",
    url: "https://steamcommunity.com/profiles/" + steamId + "/inventory/json/322330/1",
    onload: function (result) {
      document.getElementById("json").value = result.responseText;
      resolve();
      exitModal();
      console.log("成功");
    }
  });
})();
