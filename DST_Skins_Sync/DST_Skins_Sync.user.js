// ==UserScript==
// @name         dst-skins-checklist 自动同步数据
// @description  为 dst-skins-checklist.github.io 自动拉取玩家数据
// @version      0.3
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
  "use strict";

  var steamId = "76561198130053503";
  console.log("steamId:", steamId);

  // 只考虑不足2000个的情况
  GM_xmlhttpRequest({
    method: "get",
    url: "https://steamcommunity.com/inventory/" + steamId + "/322330/1?count=2000",
    onload: function (result) {
      document.getElementById("jsonNew").value = result.responseText;
      resolveNew();
      exitModal();

      var data = JSON.parse(result.responseText);
      let lastAssetId = data.last_assetid;
      console.log("lastAssetId:", lastAssetId);
      if (lastAssetId !== undefined) {
        GM_xmlhttpRequest({
          method: "get",
          url: "https://steamcommunity.com/inventory/" + steamId + "/322330/1?start_assetid=" + lastAssetId + "&count=2000",
          onload: function (result2) {
            document.getElementById("jsonNew2").value = result2.responseText;
            resolveNew(1);
            exitModal();
            console.log("成功");
          },
        });
      }
    },
  });
})();
