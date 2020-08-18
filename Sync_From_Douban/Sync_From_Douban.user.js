// ==UserScript==
// @name         在其他网站展示豆瓣的阅读记录
// @description  在其他网站展示豆瓣的阅读记录
// @version      0.2
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/Sync_From_Douban
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/Sync_From_Douban
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/Sync_From_Douban/Sync_From_Douban.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/Sync_From_Douban/Sync_From_Douban.user.js
// @match        www.amazon.cn/*
// @match        read.douban.com/*
// @connect      api.douban.com
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

window.onload = function () {
  "use strict";

  var userId = 137811015; // 豆瓣的用户ID(替换成你的用户ID), 书籍的描述参考: https://book.douban.com/people/137811015/
  var key = "0dad551ec0f84ed02907ff5c42e8ec70";
  var site;

  var host = document.location.host;
  if (host === "www.amazon.cn") {
    site = "amazon";
  } else if (host === "read.douban.com") {
    site = "douban";
  } else {
    return;
  }
  console.log("site: " + site);

  var map = GM_getValue(site, new Map());

  var timestamp = map.timestamp;
  if (timestamp == undefined) {
    timestamp = 0;
  }

  GM_xmlhttpRequest({
    method: "get",
    url: "https://api.douban.com/v2/user/" + userId + "?apiKey=" + key,
    onload: function (result) {
      var user = JSON.parse(result.responseText);
      if (timestamp < user.desc) {
        // 此时需要刷新数据
        GM_xmlhttpRequest({
          method: "get",
          url: "https://api.douban.com/v2/book/user/" + userId + "/collections?apiKey=" + key + "&count=" + 1,
          onload: function (result) {
            map = new Map();
            map.wish = new Array();
            map.reading = new Array();
            map.read = new Array();
            var total = JSON.parse(result.responseText).total;
            console.log("Total: " + total);
            var doneCount = 0;
            var loopCount = Math.round(total / 20) + 1;

            for (var i = 0; i < loopCount; i++) {
              var url = "https://api.douban.com/v2/book/user/" + userId + "/collections?apiKey=" + key + "&start=" + i * 20;
              console.log(url);
              GM_xmlhttpRequest({
                method: "get",
                url: url,
                onload: function (result) {
                  var collections = JSON.parse(result.responseText).collections;
                  collections.forEach(function (collection) {
                    var id = getId(site, collection);
                    if (id != undefined) {
                      map[collection.status].push(id);
                    }
                  });
                  doneCount++;
                }
              });
            }

            var eventId = setInterval(function () {
              if (doneCount >= loopCount) {
                clearInterval(eventId);
                map.timestamp = user.desc;
                GM_setValue(site, map);

                render(site, map);
              }
            }, 1000);
          }
        });
      } else {
        // 尽可能的稍微晚点加载
        sleep(500).then(() => {
          render(site, map);
        })
      }
    }
  });

  // https://flaviocopes.com/javascript-sleep/
  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  function render(site, map) {
    var list, attribute;
    if (site == "amazon") {
      list = document.getElementsByClassName("s-result-list")[0].getElementsByTagName("div");
      attribute = "data-asin";
    } else if (site == "douban") {
      list = document.getElementsByClassName("works-list")[0].getElementsByTagName("li");
      attribute = "data-works-id";
    }

    for (let item of list) {
      var id = item.getAttribute(attribute);
      // 想读
      if (map.wish.includes(id)) {
        item.style = "background-color: lightblue;";
      }
      // 在读
      if (map.reading.includes(id)) {
        item.style = "background-color: darkgray;";
      }
      // 已读
      if (map.read.includes(id)) {
        item.style = "background-color: yellowgreen;";
      }
    }
  }

  function getId(site, collection) {
    if (site == "amazon") {
      for (let shop of JSON.parse(collection.comment)) {
        if (shop.amazon != undefined) {
          return shop.amazon;
        }
      };
    } else if (site == "douban") {
      if (collection.book.ebook_url != undefined) {
        return collection.book.ebook_url.match(/\d+/)[0];
      }
    }
    return undefined;
  }
};
