// ==UserScript==
// @name         womplay.io 标记完成的游戏
// @description  womplay.io 标记完成的游戏, 已知BUG: 每个页面首次打开的时候均有异常
// @version      0.2
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/Womplay_Mark
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/Womplay_Mark
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/Womplay_Mark/Womplay_Mark.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/Womplay_Mark/Womplay_Mark.user.js
// @match        https://womplay.io/*
// @run-at       document-idle
// @grant        GM_listValues
// @grant        GM_setValue
// @grant        window.onurlchange
// ==/UserScript==

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function profile() {
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

function games() {
  const doneList = GM_listValues();
  for (const e of document.getElementsByClassName('card-game-minified__game-title')) {
    if (doneList.includes(e.innerHTML)) {
      e.style = e.style.cssText + 'background-color: green;';
    }
  }
  console.log('加载游戏成功');
}

async function main() {
  const url = new URL(document.URL);
  if (url.pathname == '/' || url.pathname == '/games') {
    await sleep(1000);
    games();
  } else if (url.pathname == '/profile') {
    await sleep(500);
    profile();
  } else {
    console.log('Not match');
  }
}

(function () {
  'use strict';
  main();

  if (window.onurlchange === null) {
    window.addEventListener('urlchange', (info) => {
      main();
    });
  }
})();
