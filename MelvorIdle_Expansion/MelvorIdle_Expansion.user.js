// ==UserScript==
// @name         Melvor Idle: Expansion
// @description  Melvor Idle: Expansion some function. Like: astrologyPerfectAlways, slayerTaskCostFree, masteryXPToPoolOverflow, etc.
// @version      0.2
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/MelvorIdle_Expansion
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/MelvorIdle_Expansion
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/MelvorIdle_Expansion/MelvorIdle_Expansion.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/MelvorIdle_Expansion/MelvorIdle_Expansion.user.js
// @license      MIT
// @match        https://melvoridle.com/*
// ==/UserScript==

((main) => {
    const script = document.createElement("script");
    script.textContent = `try { (${main})(); } catch (e) { console.log(e); }`;
    document.body.appendChild(script).parentNode.removeChild(script);
})(() => {
    function Script() {
        const SCRIPT_NAME = "Expansion";

        // TODO: setting UI.
        const config = {
            astrologyPerfectAlways: true,
            slayerTaskCostFree: true,
            masteryXPToPoolOverflow: true,
            unlimitedOffline: true,
        };

        // copy from: https://greasyfork.org/en/scripts/435372-melvor-unlimited-offline
        function patchCode(func, match, replacement) {
            const codeString = func
                .toString()
                .replace(match, replacement)
                .replace(/^function (\w+)/, "window.$1 = function");
            eval(codeString);
        }

        (() => {
            if (config.astrologyPerfectAlways) {
                Astrology.modifierMagnitudeChances = [0, 0, 0, 0, 100];
            }

            if (config.slayerTaskCostFree) {
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
