import { LoWUtility } from "../common/low-utility.js";

export class LoWRollDialog extends Dialog {

  /* -------------------------------------------- */
  static async create(actor, rollData) {

    let options = { classes: ["low-roll-dialog"], width: 540, height: 'fit-content', 'z-index': 99999 }
    let html = await renderTemplate('systems/fvtt-legends-of-wulin/templates/dialogs/roll-dialog-generic.hbs', rollData);
    return new LoWRollDialog(actor, rollData, html, options);
  }

  /* -------------------------------------------- */
  constructor(actor, rollData, html, options, close = undefined) {
    let conf = {
      title: "Lake roll",
      content: html,
      buttons: {
        roll: {
          icon: '<i class="fas fa-check"></i>',
          label: "Roll",
          callback: () => { this.roll() }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel", 
          callback: () => { this.close() }
        }
      },
      close: close
    }

    super(conf, options);

    this.actor = actor;
    this.rollData = rollData;
  }

  /* -------------------------------------------- */
  roll() {
    LoWUtility.rollLoW(this.rollData)
  }

  /* -------------------------------------------- */
  async refreshDialog() {
    const content = await renderTemplate("systems/fvtt-legends-of-wulin/templates/dialogs/roll-dialog-generic.hbs", this.rollData)
    this.data.content = content
    this.render(true)
  }

  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);

    var dialog = this;
    function onLoad() {
    }
    $(function () { onLoad(); });

    html.find('#roll-bonus-malus').change((event) => {
      this.rollData.bonusMalus = Number(event.currentTarget.value)
    })
    html.find('#roll-difficulty').change((event) => {
      this.rollData.difficulty = Number(event.currentTarget.value) || 0
    })

  }
}