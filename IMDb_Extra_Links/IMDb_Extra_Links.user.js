// ==UserScript==
// @name         IMDb电影页面增强
// @description  增强IMDb电影页面，添加豆瓣电影链接和国内正版播放源链接, 以及字幕和torrent
// @version      0.15
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/IMDb_Extra_Links
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/IMDb_Extra_Links
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/IMDb_Extra_Links/IMDb_Extra_Links.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/IMDb_Extra_Links/IMDb_Extra_Links.user.js
// @match        www.imdb.com/title/*
// @connect      api.douban.com
// @connect      subhd.tv
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @require      https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery/3.6.0/jquery.min.js
// ==/UserScript==

GM_addStyle(".extra_list a { color: lightgray; }");

(function () {
  "use strict";

  var imdbID = window.location.href.split("/")[4];
  if (imdbID.startsWith("tt")) {
    getDoubanAPI(`movie/imdb/${imdbID}`).then(function (douban) {
      // console.log(douban);
      var title = douban["alt_title"].split(" ")[0];
      if (title != undefined) {
        var id = douban["alt"].split("/")[4];
        appendBase(imdbID, id, title, douban["rating"]["average"]);
      } else {
        appendBase(imdbID, 0, "无豆瓣数据");
      }
    });
  }

  function appendBase(imdbID, doubanId, title, rating) {
    const ul = document.getElementsByClassName("ipc-inline-list")[1];
    const li1 = document.createElement("li");
    li1.className = "ipc-inline-list__item extra_list";
    li1.innerHTML = title;
    if (doubanId != 0) {
      li1.innerHTML += ' | <a href="https://movie.douban.com/subject/' + doubanId + '" target="_blank">豆瓣电影(' + rating + ')</a>';
      getJSON_GM("http://subhd.tv/searchD/" + doubanId).then(function (sub) {
        // console.log(sub)
        if (sub["success"]) {
          li1.innerHTML += ' | <a href="http://subhd.tv/d/' + sub["con"] + '" target="_blank">Sub HD</a>';
        }
      })
    }
    li1.innerHTML += ' | <a href="https://thepiratebay.org/search.php?q=' + imdbID + '" target="_blank">ThePirateBay</a>';
    li1.innerHTML += ' | <a href="https://www.torrentleech.org/torrents/browse/index/imdbID/' + imdbID + '" target="_blank">TorrentLeech</a>';
    li1.innerHTML += ' | <a href="https://eztvx.to/search/' + imdbID + '" target="_blank">eztv(TV)</a>';
    ul.appendChild(li1);
  }

  // 以下代码复制自：https://github.com/JayXon/MoreMovieRatings
  function getURL_GM(url, headers, data) {
    return new Promise((resolve) =>
      GM.xmlHttpRequest({
        method: data ? "POST" : "GET",
        url: url,
        headers: headers,
        data: data,
        onload: function (response) {
          if (response.status >= 200 && response.status < 400) {
            resolve(response.responseText);
          } else {
            console.error(`Error getting ${url}:`, response.status, response.statusText, response.responseText);
            resolve();
          }
        },
        onerror: function (response) {
          console.error(`Error during GM.xmlHttpRequest to ${url}:`, response.statusText);
          resolve();
        },
      }),
    );
  }

  async function getJSON_GM(url, headers, post_data) {
    const data = await getURL_GM(url, headers, post_data);
    if (data) {
      return JSON.parse(data);
    }
  }

  async function getDoubanAPI(query) {
    return await getJSON_GM(
      `https://api.douban.com/v2/${query}`,
      {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf8",
      },
      "apikey=0ab215a8b1977939201640fa14c66bab",
    );
  }
})();
