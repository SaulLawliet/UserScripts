// ==UserScript==
// @name         Melvor Idle: Expansion
// @description  Melvor Idle: Expansion some function. Like: astrologyPerfectAlway, slayerTaskCostFree, masteryXPToPoolOverflow, etc.
// @version      0.1
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
            astrologyPerfectAlway: true,
            slayerTaskCostFree: true,
            masteryXPToPoolOverflow: true,
        };

        (() => {
            if (config.astrologyPerfectAlway) {
                Astrology.modifierMagnitudeChances = [0, 0, 0, 0, 100];
            }

            if (config.slayerTaskCostFree) {
                SlayerTask.data.forEach(task => {
                    task.cost = 0;
                });
            }

            if (config.masteryXPToPoolOverflow) {
                addMasteryXPToPool = (skill, xp, offline=false, token=false) => {
                    MASTERY[skill].pool += getMasteryXpToAddToPool(skill, xp, token);
                    // !!! Allow overflow
                    // if (MASTERY[skill].pool > getMasteryPoolTotalXP(skill))
                    //     MASTERY[skill].pool = getMasteryPoolTotalXP(skill);
                    if (!offline) {
                        updateMasteryPoolProgress(skill);
                        updateOpenMasteryXPModal(skill);
                    }
                }
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
