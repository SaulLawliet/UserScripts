// ==UserScript==
// @name         Steam 商店页面增加
// @description  给 Steam 商店中的游戏页面, 添加更多信息, 如: 中文名, steamDb链接
// @version      0.1
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/Steam_Store_More_Info
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/Steam_Store_More_Info
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/Steam_Store_More_Info/Steam_Store_More_Info.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/Steam_Store_More_Info/Steam_Store_More_Info.user.js
// @match        store.steampowered.com/app/*
// @connect      www.douban.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==


(function () {
  'use strict';

  var appId = window.location.href.split("/")[4];

  addSteamDbLink(appId);

  var element = document.getElementsByClassName("apphub_AppName")[0];

  GM_xmlhttpRequest({
    method: "get",
    url: "https://www.douban.com/j/ilmen/game/search?genres=&platforms=&sort=rating&q=" + element.innerText.replace(/ /g, "+"),
    onload: function (result) {
      var json = JSON.parse(result.responseText);
      if (json.total > 0) {
        element.innerText = json.games[0].title;
      }
    }
  });

  function addSteamDbLink(appId) {
    // var spanNode = document.createElement("span");
    // spanNode.innter
    var aNode = document.createElement("a");
    aNode.className = "btnv6_blue_hoverfade btn_medium";
    aNode.href = "https://steamdb.info/app/" + appId;
    aNode.innerHTML = "<span>SteamDb</span>";

    document.getElementsByClassName("apphub_OtherSiteInfo")[0].appendChild(aNode);
  }

})();
