// ==UserScript==
// @name         Melvor Idle: Leather to Green
// @description  Melvor Idle: Leather to Dragonhide Green
// @version      0.1
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/MelvorIdle_Leather_To_Green
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/MelvorIdle_Leather_To_Green
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/MelvorIdle_Leather_To_Green/MelvorIdle_Leather_To_Green.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/MelvorIdle_Leather_To_Green/MelvorIdle_Leather_To_Green.user.js
// @license      MIT
// @match        https://melvoridle.com/*
// ==/UserScript==

((main) => {
    const script = document.createElement("script");
    script.textContent = `try { (${main})(); } catch (e) { console.log(e); }`;
    document.body.appendChild(script).parentNode.removeChild(script);
})(() => {
    function Script() {
        const SCRIPT_NAME = "LeatherToGreen";


        (() => {

            ref_addItemToBank = addItemToBank;

            addItemToBank = (itemID, quantity, found=true, showNotification=true, ignoreBankSpace=false) => {
                const rtn = ref_addItemToBank(itemID, quantity, found, showNotification, ignoreBankSpace);
                if (rtn) {
                    if (itemID === CONSTANTS.item.Leather) {
                        buyQty = quantity;
                        buyShopItem("Materials", 8, true); // dragonhide_green
                    }
                }
                return rtn;
            }

            console.log(`${SCRIPT_NAME} loaded.`);
        })();
    }

    function loadScript() {
        if (typeof isLoaded !== typeof undefined && isLoaded) {
            // Only load script after game has opened
            clearInterval(scriptLoader);

            Script();
        }
    }

    const scriptLoader = setInterval(loadScript, 200);
});
