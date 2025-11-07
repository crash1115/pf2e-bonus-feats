import { MODULE_ID } from "./settings.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class BonusFeatsConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(object, options) {
        super(object, options);
        const moduleSettings = foundry.utils.duplicate(game.settings.get(MODULE_ID, "customFeatSections")) || [];
        this.featSections = moduleSettings || [];
    }

    static DEFAULT_OPTIONS = {
        id: "pf2e-bonus-feats-edit-feat-sections",
        classes: ["edit-feat-sections", "pf2e-bonus-feats"],
        window: {
            contentClasses: ["standard-form"],
            resizable: true,
            title: "Configure Custom Feat Sections",
        },
        actions: {
            addSection: BonusFeatsConfig.addFeatSections,
            removeSection: BonusFeatsConfig.removeFeatSection,
            saveSections: BonusFeatsConfig.saveFeatSections
        },
    };

    static PARTS = {
        main: {
            root: true,
            template: "modules/pf2e-bonus-feats/templates/feat-config.hbs",
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.featSections = this.featSections;
        return context;
    }

    static async addFeatSections(event) {
        const featTypeOptions = Object.keys(CONFIG.PF2E.featCategories).map(key => ({value:key, label:game.i18n.localize(CONFIG.PF2E.featCategories[key]), selected: false}));
        const slotsHint = "Leaving this blank will not populate level based slots into the section. Otherwise, it expects a comma separated list. Entering the same number more than once will add additional slots at that level. Ex: 1, 1, 5, 7";

        const labelField = new foundry.data.fields.StringField({label: "Section Label", initial: "New Section", required: true}).toFormGroup({},{name:"label"}).outerHTML;      
        
        const typeCheckboxes = foundry.applications.fields.createMultiSelectInput({type: "checkboxes", name: "supported", options: featTypeOptions });
        const supportedField = foundry.applications.fields.createFormGroup({label: "Allowed Feat Types", input: typeCheckboxes}).outerHTML;
                
        const slotsField = new foundry.data.fields.StringField({label: "Grant At Levels", hint: slotsHint}).toFormGroup({},{name:"slots"}).outerHTML;    ;
        let content = labelField + supportedField + slotsField;

        foundry.applications.api.DialogV2.wait({
            id: "pf2e-bonus-feats-add-section-dialog",
            window: {
                title: `Add Section`,
            },
            position: {
                width: 600
            },
            content,
            buttons: [{
                action: "automatic",
                label: "Add",
                icon: "fa-regular fa-plus",
                callback: async (event, button) => {
                    const data = new FormDataExtended(button.form).object;
                    
                    let newSection = {
                        id: "pf2e-bonus-feats-" + foundry.utils.randomID(),
                        label: data.label || "Custom Feat Section",
                        supported: !data.supported ? [] : data.supported,
                        slots: !data.slots ? [] : data.slots.split(/,\s*/).map(Number)
                    }

                    this.featSections.push(newSection);
                    this.render(true);
                },
                default: false
            }],
        });
    }

    static removeFeatSection(event) {
        let sectionIdToRemove = event.target.dataset.sectionId;
        this.featSections = this.featSections.filter( (section) => {
            return section.id !== sectionIdToRemove;
        });
        this.render(true);
    }

    static async saveFeatSections(event) {
        await game.settings.set(MODULE_ID, "customFeatSections", this.featSections); 
        game.settings.sheet.constructor.reloadConfirm();
    }

}