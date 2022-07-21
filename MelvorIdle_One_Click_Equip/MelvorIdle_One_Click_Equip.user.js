// ==UserScript==
// @name         Melvor Idle: One Click Equip
// @description  Quick-Equip button: one-click wear equipment and synergy. Optional check astrology.
// @version      0.2
// @author       Saul Lawliet
// @namespace    https://github.com/SaulLawliet
// @homepage     https://github.com/SaulLawliet/UserScripts/tree/master/MelvorIdle_One_Click_Equip
// @homepageURL  https://github.com/SaulLawliet/UserScripts/tree/master/MelvorIdle_One_Click_Equip
// @downloadURL  https://github.com/SaulLawliet/UserScripts/raw/master/MelvorIdle_One_Click_Equip/MelvorIdle_One_Click_Equip.user.js
// @updateURL    https://github.com/SaulLawliet/UserScripts/raw/master/MelvorIdle_One_Click_Equip/MelvorIdle_One_Click_Equip.user.js
// @license      MIT
// @match        https://melvoridle.com/*
// ==/UserScript==

((main) => {
    const script = document.createElement("script");
    script.textContent = `try { (${main})(); } catch (e) { console.log(e); }`;
    document.body.appendChild(script).parentNode.removeChild(script);
})(() => {
    function Script() {
        const SCRIPT_NAME = "OneClickEquip";

        const NON_COMBAT_SET = 0; // 非战斗套装索引: from 0
        const CHECK_ASTROLOGY = false; // 是否检查星座

        // 空余位置尝试补充
        const SUMMON_EQUIPMENT = [
            CONSTANTS.item.Necromancer_Hat, // 死靈法師帽
            CONSTANTS.item.Necromancer_Robes, // 死靈法師長袍
            CONSTANTS.item.Necromancer_Bottoms, // 死靈法師褲
            CONSTANTS.item.Necromancer_Boots, // 死靈法師靴
            CONSTANTS.item.Bobs_Gloves, // 鮑伯的手套
        ];

        // TODO: 处理冲突时候的优先级
        const LOW_PRIORITY_EQUIPMENT = [
            CONSTANTS.item.Amulet_Of_Incantation, // 咒文護符
        ];

        const SUMMON_ASTROLOGY = {
            standardModifiers: ["increasedSummoningChargePreservation"],
        };

        const astrologyFlow = {};
        // 5
        astrologyFlow[CONSTANTS.skill.Smithing] = {
            skillModifiers: ["increasedChanceToDoubleItemsSkill", "decreasedSkillIntervalPercent"],
        }
        // 15
        astrologyFlow[CONSTANTS.skill.Runecrafting] = {
            skillModifiers: ["increasedChanceToDoubleItemsSkill"],
            standardModifiers: ["increasedChanceForElementalRune"],
        }
        // 19
        astrologyFlow[CONSTANTS.skill.Herblore] = {
            skillModifiers: ["increasedChanceToDoubleItemsSkill", "decreasedSkillIntervalPercent"],
        };
        // 21
        astrologyFlow[CONSTANTS.skill.Summoning] = {
            skillModifiers: ["increasedChanceToDoubleItemsSkill"],
            standardModifiers: ["increasedSummoningChargePreservation"],
        };


        function checkAstrology(skill) {
            const astrology = astrologyFlow[skill];
            if (!astrology) return;

            if (astrology.skillModifiers) {
                astrology.skillModifiers.forEach(skillModifier => {
                    if (game.astrology.passiveBonuses.skillModifiers.get(skillModifier).get(skill) !== 15) {
                        let str = templateLangString('SKILL_NAME', CONSTANTS.skill.Astrology);
                        str += "-" + templateLangString('MENU_TEXT', "SKILL_LOCKED");
                        str += ": " + templateLangString('MODIFIER_DATA', skillModifier, {value: 15, skillName: templateLangString('SKILL_NAME', skill)});
                        notifyPlayer(skill, str, "danger");
                    }
                });
            }

            if (astrology.standardModifiers) {
                let standardModifiers = [];
                if (player.equipment.slots['Summon1'].quantity > 0) {
                    standardModifiers.push(...astrology.standardModifiers, ...SUMMON_ASTROLOGY.standardModifiers);
                } else {
                    standardModifiers = astrology.standardModifiers;
                }
                standardModifiers.forEach(standardModifier => {
                    if (game.astrology.passiveBonuses.standardModifiers.get(standardModifier) !== 15) {
                        let str = templateLangString('SKILL_NAME', CONSTANTS.skill.Astrology);
                        str += "-" + templateLangString('MENU_TEXT', "SKILL_LOCKED");
                        str += ": " + templateLangString('MODIFIER_DATA', standardModifier, {value: 15});
                        notifyPlayer(skill, str, "danger");
                    }
                });
            }
        }

        function arrayRemove(array, value) {
            const index = array.indexOf(value);
            if (index !== -1) {
                array.splice(index, 1);
            }
        }


        function autoWear(skill) {
            // 切换装备索引
            combatManager.player.changeEquipmentSet(NON_COMBAT_SET);

            const equipment = {};
            const passive = [];

            // 构建基础信息
            customMinibarItems[skill].filter((x) => game.stats.itemFindCount(x) > 0).forEach((itemID) => {
                const item = items[itemID];
                const slot = item.validSlots[0];
                if (equipment[slot]) {
                    equipment[slot].push(itemID);
                } else {
                    equipment[slot] = [itemID];
                }
                if (item.occupiesSlots.length > 0) {
                    const occupiesSlot = item.occupiesSlots[0];
                    if (equipment[occupiesSlot]) {
                        equipment[occupiesSlot].push(itemID);
                    } else {
                        equipment[occupiesSlot] = [itemID];
                    }
                }

                if (item.validSlots.includes('Passive')) {
                    passive.push(itemID);
                }
            });

            // 尝试计算被动格
            if (dungeonCompleteCount[CONSTANTS.dungeon.Into_the_Mist] > 0) {
                // 移除不冲突的物品
                Object.values(equipment).forEach((itemIDs) => {
                    if (itemIDs.length == 1 && passive.includes(itemIDs[0])) {
                        arrayRemove(passive, itemIDs[0]);
                    }
                });

                // 2个的时候, 被动格内物品可能是相同位置
                if (passive.length == 2) {
                    Object.values(equipment).forEach((itemIDs) => {
                        if (itemIDs.toString() == passive.toString()) {
                            passive.splice(0, 1);
                            itemIDs.splice(1, 1);
                        }
                    });
                }


                if (passive.length > 0) {
                    if (passive.length == 1) {
                        equipment['Passive'] = [passive[0]];
                    } else {
                        notifyPlayer(skill, `${templateLangString('EQUIP_SLOT', 11)} conflict: ${passive.map((x) => items[x].name).join(' / ')}`, "danger");
                        return;
                    }
                }

                if (equipment['Passive']) {
                    Object.values(equipment).forEach((itemIDs) => {
                        if (itemIDs.length > 1) {
                            arrayRemove(itemIDs, equipment['Passive'][0]);
                        }
                    });
                }
            }

            // 空余装备格子尝试穿戴召唤装备
            SUMMON_EQUIPMENT.forEach((itemID) => {
                if (game.stats.itemFindCount(itemID) > 0) {
                    const slot = items[itemID].validSlots[0];
                    if (!equipment[slot]) {
                        equipment[slot] = [itemID];
                    }
                }
            });

            // 尝试计算 synergy
            if (equipment['Summon1'] && equipment['Summon1'].length == 2) {
                const itemIDs = equipment['Summon1'];
                const synergy = Summoning.synergiesByItemID.get(itemIDs[0]).get(itemIDs[1]);
                if (synergy) {
                    equipment['Summon1'] = [Summoning.marks[synergy.summons[0]].itemID];
                    equipment['Summon2'] = [Summoning.marks[synergy.summons[1]].itemID];
                }
            }


            Object.entries(equipment).forEach(([slot, itemIDs]) => {
                if (itemIDs.length == 1) {
                    const itemID = itemIDs[0];
                    if (items[itemID].occupiesSlots.length == 0 || slot != items[itemID].occupiesSlots[0]) {
                        const itemSlot = player.equipment.slotMap.get(itemID);
                        if (itemSlot) {
                            if (slot != itemSlot) {
                                combatManager.player.unequipItem(NON_COMBAT_SET, itemSlot);
                                combatManager.player.equipItem(itemID, NON_COMBAT_SET, slot, 69696969);
                            }
                        } else {
                            if (getBankQty(itemID) > 0) {
                                combatManager.player.equipItem(itemID, NON_COMBAT_SET, slot, 69696969);
                            } else {
                                notifyPlayer(skill, templateLangString("TOASTS", "ITEM_NOT_IN_BANK", {itemName: items[itemID].name}), "danger");
                            }
                        }
                    }
                } else {
                    notifyPlayer(skill, `conflict: ${itemIDs.map((x) => items[x].name).join(' / ')}`, "danger");
                }
            });

            // 自动脱掉板子
            if (!equipment['Summon1']) {
                if (combatManager.player.equipment.slots['Summon1'].quantity > 0) {
                    combatManager.player.unequipItem(NON_COMBAT_SET, 'Summon1');
                }
                if (combatManager.player.equipment.slots['Summon2'].quantity > 0) {
                    combatManager.player.unequipItem(NON_COMBAT_SET, 'Summon2');
                }
            }
        }


        (() => {
            document.getElementById("minibar-quick-equip").onclick = () => {
                const skill = PAGES[currentPage].skillID;
                if (skill != undefined) {
                    autoWear(skill);
                    if (CHECK_ASTROLOGY) {
                        checkAstrology(skill);
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
