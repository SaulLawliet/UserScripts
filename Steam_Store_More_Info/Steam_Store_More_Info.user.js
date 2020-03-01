// ==UserScript==
// @name         Steam 商店页面增加
// @description  给 Steam 商店中的游戏页面, 添加更多信息, 如: 中文名, steamDb 链接
// @version      0.2
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/Steam_Store_More_Info
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/Steam_Store_More_Info
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/Steam_Store_More_Info/Steam_Store_More_Info.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/Steam_Store_More_Info/Steam_Store_More_Info.user.js
// @match        store.steampowered.com/app/*
// @connect      graphql.xy.huijitrans.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==


(function () {
  'use strict';

  var appId = window.location.href.split("/")[4];

  addSteamDbLink(appId);

  var appName = document.getElementsByClassName("apphub_AppName")[0].innerText;

  // 修复一下appName的格式
  appName = appName.replace(/:/g, ": ")

  // https://game.tgbus.com/search?q=NieR%3A%20Automata%E2%84%A2
  GM_xmlhttpRequest({
    method: "POST",
    url: "https://graphql.xy.huijitrans.com/graphql",
    data: '{"operationName":null,"variables":{"q":"' + appName + '","first":1,"skip":0},"query":"query SearchResults($q: String\u0021, $first: Int\u0021, $skip: Int\u0021) {\\n  esearch(query: $q, first: $first, skip: $skip) {\\n    gameresults {\\n      game {\\n        id\\n        name\\n        names {\\n          content\\n          lang\\n        }\\n        covers {\\n          path\\n        }\\n        summary_text\\n        first_release_date\\n        companies_developers {\\n          ...CompanyInfo\\n        }\\n        platforms {\\n          ...TagInfo\\n        }\\n        genres {\\n          ...TagInfo\\n        }\\n        player_perspectives {\\n          ...TagInfo\\n        }\\n      }\\n      score\\n    }\\n    total\\n  }\\n}\\n\\nfragment TagInfo on collection {\\n  id\\n  name\\n  names {\\n    alias\\n    en_us\\n    formal\\n    ja_jp\\n    old\\n    short\\n    zh_cn\\n  }\\n}\\n\\nfragment CompanyInfo on companies_collect {\\n  id\\n  name\\n  names {\\n    alias\\n    en_us\\n    formal\\n    ja_jp\\n    old\\n    short\\n    zh_cn\\n  }\\n}\\n"}',
    onload: function (result) {
      var json = JSON.parse(result.responseText);
      addChineseName(appName, json.data.esearch.gameresults[0].game.name);
    }
  });


  function addSteamDbLink(appId) {
    var aNode = document.createElement("a");
    aNode.className = "btnv6_blue_hoverfade btn_medium";
    aNode.href = "https://steamdb.info/app/" + appId;
    aNode.innerHTML = "<span>SteamDb</span>";

    document.getElementsByClassName("apphub_OtherSiteInfo")[0].appendChild(aNode);
  }

  function addChineseName(appName, name) {
    var aNode = document.createElement("a");
    aNode.href = "https://game.tgbus.com/search?q=" + appName;
    aNode.innerText = name;

    document.getElementsByClassName("apphub_OtherSiteInfo")[0].prepend(aNode);
  }

})();
