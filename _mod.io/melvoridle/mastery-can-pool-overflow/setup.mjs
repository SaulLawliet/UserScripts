export function setup({ patch }) {
    patch(SkillWithMastery, "addMasteryPoolXP").replace(function (o, xp) {
        const oldBonusLevel = this.getMasteryCheckPointLevel(
            this._masteryPoolXP
        );
        this._masteryPoolXP += xp;
        // this._masteryPoolXP = Math.min(this._masteryPoolXP, this.masteryPoolCap);
        this.renderQueue.masteryPool = true;
        const newBonusLevel = this.getMasteryCheckPointLevel(
            this._masteryPoolXP
        );
        if (oldBonusLevel !== newBonusLevel) {
            this.onMasteryPoolBonusChange(oldBonusLevel, newBonusLevel);
        }
    });

    patch(Bank, "claimItemOnClick").replace(function (o, item, quantity) {
        if (item.modifiers.masteryToken != undefined) {
            const skill = item.modifiers.masteryToken[0].skill;
            // If overflow, abort.
            if (skill.masteryPoolXP >= skill.masteryPoolCap) {
                notifyPlayer(skill, "Abort! It's overflow.", "danger");
                return;
            }
        }

        o(item, quantity);
    });
}
