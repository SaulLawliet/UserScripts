export function setup({ settings, patch }) {
    const generalSettings = settings.section('General');

    generalSettings.add({
        type: "number",
        name: "equip-set",
        label: "Which Equipment Sets to Equip?",
        hint: "1 through 5(Default: 1)",
        default: 1
    });


    const arrayRemove = (array, value) => {
        const index = array.indexOf(value);
        if (index !== -1) {
            array.splice(index, 1);
        }
    };

    // change from: Player.quickEquipItem(item, skill)
    const quickEquipItem = (item, skill, slot) => {
        let quantity = game.combat.player.manager.bank.getQty(item);
        const templateData = {
            itemName: item.name,
            quantity: `${quantity}`
        };
        if (quantity > 0) {
            if (!equipmentSlotData[item.validSlots[0]].allowQuantity)
                quantity = 1;
            game.combat.player.equipItem(item, game.combat.player.selectedEquipmentSet, slot, quantity);
            if (game.combat.player.equipment.checkForItem(item)) {
                if (quantity > 1) {
                    notifyPlayer(skill, templateLangString('TOASTS', 'ITEM_QTY_EQUIPPED', templateData), 'success');
                } else {
                    notifyPlayer(skill, templateLangString('TOASTS', 'ITEM_EQUIPPED', templateData), 'success');
                }
            } else
                notifyPlayer(skill, templateLangString('TOASTS', 'CANT_EQUIP_ITEM', templateData), 'danger');
        } else if (game.combat.player.equipment.checkForItem(item))
            notifyPlayer(skill, templateLangString('TOASTS', 'ITEM_ALREADY_EQUIPPED', templateData), 'info');
        else
            notifyPlayer(skill, templateLangString('TOASTS', 'ITEM_NOT_IN_BANK', templateData), 'danger');
    }

    const quickEquip = () => {
        const skill = game.minibar.activeSkill;

        if (game.activeAction == game.combat) {
            notifyPlayer(skill, `You are in battle.`, "danger");
            return;
        }

        // 换到第一个装备位
        game.combat.player.changeEquipmentSet(Math.max(1, generalSettings.get('equip-set')) - 1);

        const itemMap = {}; // key: id, value: item
        const equipment = {};
        const passive = [];

        const items = game.minibar.getCustomItemsForSkill(skill);

        items.filter((x) => game.stats.itemFindCount(x) > 0).forEach((item) => {
            const itemID = item.id;
            itemMap[itemID] = item;

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
        if (passive.length > 0 && game.combat.player.isEquipmentSlotUnlocked('Passive')) {
            // 移除不冲突的物品
            Object.values(equipment).forEach((itemIDs) => {
                if (itemIDs.length == 1 && passive.includes(itemIDs[0])) {
                    arrayRemove(passive, itemIDs[0]);
                }
            });

            // 2个的时候, 被动格内物品可能是同装备位的
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
                    notifyPlayer(skill, `${templateLangString('EQUIP_SLOT', 11)} conflict: ${passive.map((x) => itemMap[x].name).join(' / ')}`, "danger");
                    return;
                }
            }

            // 如果被动格只有一个, 删掉这个物品从其他的格子中
            if (equipment['Passive']) {
                Object.values(equipment).forEach((itemIDs) => {
                    if (itemIDs.length > 1) {
                        arrayRemove(itemIDs, equipment['Passive'][0]);
                    }
                });
            }
        }

        // 暂时不考虑召唤
        delete(equipment['Summon1']);

        console.log(equipment);

        Object.entries(equipment).forEach(([slot, itemIDs]) => {
            if (itemIDs.length == 1) {
                const item = itemMap[itemIDs[0]];
                if (item.occupiesSlots.length == 0 || slot != item.occupiesSlots[0]) {
                    const oldSlot = game.combat.player.equipment.slotMap.get(item);
                    if (oldSlot) {
                        if (oldSlot != slot) {
                            // 位置不一样先脱再穿
                            if (game.combat.player.unequipCallback(oldSlot)()) {
                                quickEquipItem(item, skill, slot);
                            }
                        }
                    } else {
                        quickEquipItem(item, skill, slot);
                    }
                }
            } else {
                notifyPlayer(skill, `conflict: ${itemIDs.map((x) => itemMap[x].name).join(' / ')}`, "danger");
            }
        });
    };

    patch(Minibar, 'initialize').after(() => {
        const quickEquipReal = game.minibar.createMinibarItem('minibar-quick-equip-real', `${CDNDIR}assets/media/bank/fez_amulet.png`, '<div class="text-center"><small>Click to Equip All</small></div>', {
            onClick: ()=>quickEquip(),
        });

        const minibarElement = document.getElementById('skill-footer-minibar');
        minibarElement.prepend(quickEquipReal.element);
    });
}
