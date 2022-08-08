// ==UserScript==
// @name         Melvor Idle: Expansion
// @description  Melvor Idle: Expansion some function. Like: masteryXPToPoolOverflow, astrologyPerfectAlways, slayerTaskCostFree, unlimitedOffline etc.
// @version      0.3
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/MelvorIdle_Expansion
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/MelvorIdle_Expansion
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/MelvorIdle_Expansion/MelvorIdle_Expansion.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/MelvorIdle_Expansion/MelvorIdle_Expansion.user.js
// @license      MIT
// @match        https://melvoridle.com/*
// ==/UserScript==

// base on: https://greasyfork.org/en/scripts/435372-melvor-unlimited-offline
((main) => {
    const script = document.createElement('script');
    script.textContent = `try { (${main})(); } catch (e) { console.log(e); }`;
    document.body.appendChild(script).parentNode.removeChild(script);
})(() => {
    setTimeout(() => {
        function patchCode(code, match, replacement) {
            const codeString = code
                .toString()
                .replace(match, replacement)
                .replace(/^function (\w+)/, "window.$1 = function");
            eval(codeString);
        }

        const SCRIPT_NAME = "Expansion";

        // TODO: setting UI.
        const config = {
            astrologyPerfectAlways: true,
            slayerTaskCostFree: true,
            masteryXPToPoolOverflow: true,
            unlimitedOffline: true,
        };

        if (config.astrologyPerfectAlways && Astrology && Astrology.modifierMagnitudeChances) {
            Astrology.modifierMagnitudeChances = [0, 0, 0, 0, 100];
        }

        if (config.slayerTaskCostFree && SlayerTask && SlayerTask.data) {
            SlayerTask.data.forEach((task) => {
                task.cost = 0;
            });
        }

        if (config.masteryXPToPoolOverflow) {
            patchCode(
                addMasteryXPToPool,
                /(MASTERY\[skill\].pool>)/,
                "false&&$1"
            );
        }

        if (config.unlimitedOffline) {
            patchCode(getOfflineTimeDiff, 64800000, "Infinity");
        }

        console.log(`${SCRIPT_NAME} loaded.`);
    }, 100);
});
