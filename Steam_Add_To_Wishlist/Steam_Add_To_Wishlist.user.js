// ==UserScript==
// @name         Steam为限制的游戏添加到愿望单
// @description  Steam为限制的游戏添加到愿望单
// @version      0.1
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/Steam_Add_To_Wishlist
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/Steam_Add_To_Wishlist
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/Steam_Add_To_Wishlist/Steam_Add_To_Wishlist.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/Steam_Add_To_Wishlist/Steam_Add_To_Wishlist.user.js
// @match        https://store.steampowered.com/agecheck/app/*
// ==/UserScript==

(function () {
  'use strict';

  var appId = window.location.href.split("/")[5];

  var box = document.getElementById("error_box");
  box.appendChild(document.createElement("br"));
  box.appendChild(document.createElement("br"));


  var childNode = document.createElement("a");
  childNode.innerHTML = "<span>Add to your wishlist</span>";
  childNode.setAttribute("class", "btnv6_blue_hoverfade btn_medium");
  childNode.setAttribute("href", "javascript:AddToWishlist(" + appId + ", 'add_to_wishlist_area', 'add_to_wishlist_area_success', 'add_to_wishlist_area_fail', '1_5_9__407'); alert('Success');")
  box.appendChild(childNode);
})();
