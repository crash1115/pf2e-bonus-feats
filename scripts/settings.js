export const MODULE_ID = "pf2e-bonus-feats";
import { BonusFeatsConfig } from "./BonusFeatsConfig.js";

export function registerSettings() {
    game.settings.registerMenu(MODULE_ID, "featsConfigEditor", {
        name: "Configure Bonus Feats",
        label: "Configure Bonus Feats",
        icon: "fas fa-wrench",
        type: BonusFeatsConfig,
        restricted: true,
        requiresReload: true,
        hint: "Configure additional feat sections to display on the feats tab of PC sheets. Choose what type of feats can go in each section, and what levels you get them at."
    });

    game.settings.register(MODULE_ID, 'customFeatSections', {
        scope: 'client',
        config: false,
        type: Object,
        default: [],
    }); 
}