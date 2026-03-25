// ==UserScript==
// @name         dst-skins-checklist 自动同步数据
// @description  为 dst-skins-checklist.github.io 自动拉取玩家数据
// @version      0.4
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/DST_Skins_Sync
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/DST_Skins_Sync
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/DST_Skins_Sync/DST_Skins_Sync.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/DST_Skins_Sync/DST_Skins_Sync.user.js
// @match        dst-skins-checklist.github.io
// @connect      steamcommunity.com
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  "use strict";

  let btn = document.createElement("button");
  btn.innerHTML = "设置 Steam ID";
  btn.style = "position:fixed;top:20px;right:20px;z-index:9999;font-size:medium;";
  document.body.appendChild(btn);

  btn.onclick = function () {
    let val = window.prompt("你之前的ID是【" + GM_getValue("steamId", "") + "】，请输入：");
    if (val) GM_setValue("steamId", val);
  };

  let steamId = GM_getValue("steamId", null);
  console.log("steamId:", steamId);

  if (steamId != null) {
    GM_xmlhttpRequest({
      method: "get",
      url: "https://steamcommunity.com/inventory/" + steamId + "/322330/1?count=2000",
      onload: function (result) {
        document.getElementById("jsonNew").value = result.responseText;
        resolveNew();
        exitModal();

        let data = JSON.parse(result.responseText);
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
  }
})();
