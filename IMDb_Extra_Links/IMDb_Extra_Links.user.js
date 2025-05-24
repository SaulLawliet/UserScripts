// ==UserScript==
// @name         IMDb电影页面增强
// @description  增强IMDb电影页面，添加豆瓣电影链接和国内正版播放源链接, 以及字幕和torrent
// @version      0.13
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/IMDb_Extra_Links
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/IMDb_Extra_Links
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/IMDb_Extra_Links/IMDb_Extra_Links.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/IMDb_Extra_Links/IMDb_Extra_Links.user.js
// @match        www.imdb.com/title/*
// @connect      movie.douban.com
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @require      https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery/3.6.0/jquery.min.js
// ==/UserScript==

GM_addStyle(".extra_list a { color: lightgray; }");

(function () {
  "use strict";

  var imdbID = window.location.href.split("/")[4];
  GM_xmlhttpRequest({
    method: "get",
    url: "https://movie.douban.com/j/subject_suggest?q=" + imdbID,
    onload: function (result) {
      var json = JSON.parse(result.responseText)[0];
      if (json == undefined) {
        appendBase(imdbID, 0, "从豆瓣获取数据失败");
      } else {
        if (json.episode.length > 0) {
          // TV
          GM_xmlhttpRequest({
            method: "get",
            url: json.url,
            onload: function (result) {
              var titleArr = json.title.split(" ");
              if (titleArr.length > 1) {
                $(result.responseText)
                  .find("#season > option")
                  .each(function () {
                    appendBase(imdbID, this.value, titleArr[0] + " 第" + numberToText(this.text) + "季");
                  });
              } else {
                appendBase(imdbID, json.id, json.title);
              }
            },
          });
        } else {
          // Movie
          appendBase(imdbID, json.id, json.title);

          GM_xmlhttpRequest({
            method: "get",
            url: json.url,
            onload: function (result) {
              $(result.responseText)
                .find(".playBtn")
                .each(function () {
                  $("#extra_list").append(" | ").append($(this));
                });
            },
          });
        }
      }
    },
  });

  // 数字转换成汉字
  function numberToText(number) {
    var text = "";
    var ones = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    var ten = parseInt(number / 10);
    if (ten > 1) {
      text += ones[ten];
    }
    if (ten > 0) {
      text += "十";
    }
    text += ones[number % 10];
    return text;
  }

  function appendBase(imdbID, doubanId, title) {
    const ul = document.getElementsByClassName("ipc-inline-list")[1];
    const li1 = document.createElement("li");
    li1.className = "ipc-inline-list__item extra_list";
    li1.innerHTML = title;
    if (doubanId != 0) {
      li1.innerHTML += ' | <a href="https://movie.douban.com/subject/' + doubanId + '" target="_blank">豆瓣电影</a>';
      li1.innerHTML += ' | <a href="http://subhd.com/do0/' + doubanId + '" target="_blank">Sub HD</a>';
    }
    li1.innerHTML += ' | <a href="https://thepiratebay.org/search.php?q=' + imdbID + '" target="_blank">ThePirateBay</a>';
    li1.innerHTML += ' | <a href="https://www.torrentleech.org/torrents/browse/index/imdbID/' + imdbID + '" target="_blank">TorrentLeech</a>';
    li1.innerHTML += ' | <a href="https://eztvx.to/search/' + imdbID + '" target="_blank">eztv(TV)</a>';
    ul.appendChild(li1);
  }
})();
