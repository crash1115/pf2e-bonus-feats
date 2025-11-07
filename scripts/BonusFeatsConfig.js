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
        position: {
            width: 800
        }
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
        const randomId = "pf2e-bonus-feats-" + foundry.utils.randomID();

        let data = {
            fields: {
                id: new foundry.data.fields.StringField({ label: "Section Id", initial:randomId }, { name: "id" }),
                label: new foundry.data.fields.StringField({ label: "Section Label", initial: "New Section" }, { name: "name" }),
                supported: new foundry.data.fields.StringField({ label: "Supported Feat Types", hint:"Leaving this blank will allow any type of feat to go in these slots. Otherwise, it expects a comma separated list. Accepted values can be found in CONFIG.PF2E.featCategories. Ex: ancestry, class, general, skill" }, { name: "supported" }),
                slots: new foundry.data.fields.StringField({ label: "Grant At Levels", hint:"Leaving this blank will not populate level based slots into the section. Otherwise, it expects a comma separated list. Entering the same number more than once will add additional slots at that level. Ex: 1, 1, 5, 7" }, { name: "slots" }),
            }
        };

        let content = await foundry.applications.handlebars.renderTemplate("modules/pf2e-bonus-feats/templates/add-section.hbs", data);
        
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
                    let form = $(button.form);

                    let id = form.find("input[name='id']").val();
                    let label = form.find("input[name='name']").val();
                    let supported = form.find("input[name='supported']").val();
                    let slots = form.find("input[name='slots']").val();

                    let s = { id, label, supported, slots };

                    let formatted = {
                        id: s.id,
                        label: s.label,
                        supported: !s.supported ? [] : s.supported.split(/,\s*/),
                        slots: !s.slots ? [] : s.slots.split(/,\s*/).map(Number)
                    }

                    this.featSections.push(formatted);
                    this.render(true);
                },
                default: true
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