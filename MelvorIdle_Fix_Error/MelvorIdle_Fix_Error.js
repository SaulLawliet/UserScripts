// ==UserScript==
// @name         Melvor Idle: Fix Error
// @description  Melvor Idle: Fix Error. Like Translate, Herblore potion's name, etc.
// @version      0.1
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/MelvorIdle_Fix_Error
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/MelvorIdle_Fix_Error
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/MelvorIdle_Fix_Error/MelvorIdle_Fix_Error.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/MelvorIdle_Fix_Error/MelvorIdle_Fix_Error.user.js
// @license      MIT
// @match        https://melvoridle.com/*
// ==/UserScript==

((main) => {
  const script = document.createElement("script");
  script.textContent = `try { (${main})(); } catch (e) { console.log(e); }`;
  document.body.appendChild(script).parentNode.removeChild(script);
})(() => {

  function Script() {
    const SCRIPT_NAME = "FixError";

    const LANG_VERSION = 348;
    const LANG_JSON = {
      "zh-TW": {
        MODIFIER_DATA: {
          // zh-TW: -${value} 秒${skillName}攻擊間隔
          decreasedSkillInterval: "-${value} 秒${skillName}技能間隔",
          // zh-TW: -${value}% ${skillName}攻擊間隔
          decreasedSkillIntervalPercent: "-${value}% ${skillName}技能間隔",
        },
      },
    };

    // Grab Melvor data
    const MelvorIdle = {
      // https://melvoridle.com/assets/js/game/language.js
      langVersion: langVersion,
      updateUIForLanguageChange: updateUIForLanguageChange,
    };

    function checkLangVersion() {
      if (LANG_VERSION >= MelvorIdle.langVersion) {
        return false;
      }

      const storageLangVersion = (localStorage.getItem(SCRIPT_NAME) && JSON.parse(localStorage.getItem(SCRIPT_NAME)).langVersion) || 0;
      if (MelvorIdle.langVersion > storageLangVersion) {
        localStorage.setItem(SCRIPT_NAME, JSON.stringify({
          langVersion: MelvorIdle.langVersion,
        }));
        alert(`${SCRIPT_NAME}/checkLangVersion: Pause. Server language version is newer than local language version. (Only alert once.)`);
      } else {
        console.warn(`${SCRIPT_NAME}/checkLangVersion: Pause. Server language version is newer than local language version.`);
      }
      return true;
    }

    function fixTranslate() {
      if (checkLangVersion()) {
        return;
      }

      const language = localStorage.getItem("language") || "en";
      if (language in LANG_JSON) {
        Object.keys(LANG_JSON[language]).forEach((x) => {
          Object.assign(loadedLangJson[x], LANG_JSON[language][x]);
        });
        // 下面这句貌似没用, 先注释
        // MelvorIdle.updateUIForLanguageChange();
        console.log(`${SCRIPT_NAME}/fixTranslate: [${language}] Overwrite success!`);
      } else {
        console.log(`${SCRIPT_NAME}/fixTranslate: [${language}] skip.`);
      }
    }

    function fixHerblore() {
      // https://melvoridle.com/assets/js/built/herblore.js
      // some of the object did not define the 'name' getter
      let count = 0;
      Herblore.potions.forEach((x) => {
        if (!("get" in Object.getOwnPropertyDescriptor(x, "name"))) {
          count++;
          Object.defineProperties(x, {
            name: {
              get: function () {
                return getLangString("POTION_NAME", `${this.masteryID}`);
              },
            },
          });
        }
      });
      console.log(`${SCRIPT_NAME}/fixHerblore: ${count} potions fixed.`);
    }

    (() => {
      fixTranslate();
      fixHerblore();

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
