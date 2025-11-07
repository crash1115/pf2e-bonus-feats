import { MODULE_ID, registerSettings } from "./settings.js";

Hooks.on('init', () => {
    registerSettings();
})

Hooks.once("ready", () => {

    const customFeatSections = game.settings.get(MODULE_ID, "customFeatSections");

    if (customFeatSections) {
        // Grab the existing list of custom sections
        const campaignFeatSections = game.settings.get("pf2e", "campaignFeatSections");

        // Remove old sections that no longer exist in our configs
        let updatedCampaignFeatSections = campaignFeatSections.filter( (section) => {
            const sectionSourceIsThisModule = section.id.startsWith("pf2e-bonus-feats-");
            const sectionIsNotInCustomFeats = customFeatSections.findIndex((s) => s.id === section.id) === -1;
            const removeSection = sectionIsNotInCustomFeats && sectionSourceIsThisModule;
            return !removeSection;
        });

        // Add or update our custom sections
        //  Cycle through each section in our config
        //  Check the campaign feat sections list; compare id's to get the index of our section
        //  If our section doesn't exist (index -1), then we add our section
        //  If our section does exist (index > -1), when we replace it with a fresh version from our config to account for updates
        customFeatSections.forEach( (customSection) => {
            const idx = updatedCampaignFeatSections.findIndex((existingSection) => existingSection.id === customSection.id);
            if(idx < 0){
                updatedCampaignFeatSections.push(customSection);
            } else {
                updatedCampaignFeatSections[idx] = customSection; 
            }
        });

        // Update the setting
        game.settings.set("pf2e", "campaignFeatSections", updatedCampaignFeatSections);
    }
});

Handlebars.registerHelper("pf2eBonusFeatsFormatTagLabel", function (value) {
    const locKey = CONFIG.PF2E.featCategories[value];
    const formattedLabel = game.i18n.localize(locKey);
    return formattedLabel;
});