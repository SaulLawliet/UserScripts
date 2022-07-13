// ==UserScript==
// @name         Melvor Idle: Fix Error
// @description  Melvor Idle: Fix Error. Like Translate, Herblore potion's name, etc.
// @version      0.2
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
    const GAME_VERSION = "v1.0.5";
    
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
      // https://melvoridle.com/assets/js/game/account.js
      gameVersion: gameVersion,

      // https://melvoridle.com/assets/js/game/language.js
      langVersion: langVersion,
      updateUIForLanguageChange: updateUIForLanguageChange,
    };

    function sameGameVersion() {
      if (MelvorIdle.gameVersion === GAME_VERSION) {
        return true;
      }

      const storageGameVersion = localStorage.getItem(`${SCRIPT_NAME}_GameVersion`) || 0;
      if (MelvorIdle.gameVersion > storageGameVersion) {
        localStorage.setItem(`${SCRIPT_NAME}_GameVersion`, MelvorIdle.gameVersion);
        alert(`${SCRIPT_NAME}/sameGameVersion: Pause. Server game version is newer than local game version. (Only alert once.)`);
      } else {
        console.warn(`${SCRIPT_NAME}/sameGameVersion: Pause. Server game version is newer than local game version.`);
      }
      return false;
    }

    function sameLangVersion() {
      if (MelvorIdle.langVersion === LANG_VERSION) {
        return true;
      }

      const storageLangVersion = localStorage.getItem(`${SCRIPT_NAME}_LangVersion`) || 0;
      if (MelvorIdle.langVersion > storageLangVersion) {
        localStorage.setItem(`${SCRIPT_NAME}_LangVersion`, MelvorIdle.langVersion);
        alert(`${SCRIPT_NAME}/sameLangVersion: Pause. Server language version is newer than local language version. (Only alert once.)`);
      } else {
        console.warn(`${SCRIPT_NAME}/sameLangVersion: Pause. Server language version is newer than local language version.`);
      }
      return false;
    }

    function fixTranslate() {
      const language = localStorage.getItem("language") || "en";
      if (language in LANG_JSON) {
        Object.keys(LANG_JSON[language]).forEach((x) => {
          Object.assign(loadedLangJson[x], LANG_JSON[language][x]);
        });
        // TODO: need update UI
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
      if (sameGameVersion()) {
        fixHerblore();
      }

      if (sameLangVersion()) {
        fixTranslate();
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
