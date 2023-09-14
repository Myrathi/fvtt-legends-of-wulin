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
    this.updateStyleBonus()
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
  updateStyleBonus() {
    if ( this.rollData.weapons) {
      let weapon = this.rollData.weapons.find(w => w.id == this.rollData.selectedWeapon)
      if (weapon) {
        this.rollData.weaponBonus = weapon.system.stats[this.rollData.styleCombatModifier].bonus
        $('#style-weapon-bonus').html(this.rollData.weaponBonus)
      } else {
        this.rollData.weaponBonus = 0
        $('#style-weapon-bonus').html("0")
      }
    }
    if ( this.rollData.armor && this.rollData.styleCombatModifier) {
      this.rollData.armorBonus = this.rollData.armor.system.stats[this.rollData.styleCombatModifier].bonus
      $('#style-armor-bonus').html(this.rollData.armorBonus)
    }
    if ( this.rollData.styleCombatModifier) {
      this.rollData.styleBonus = this.rollData.style.system.stats[this.rollData.styleCombatModifier].basic + this.rollData.style.system.stats[this.rollData.styleCombatModifier].modified
      $('#style-combat-bonus').html(this.rollData.styleBonus)  
    }
}

  /* -------------------------------------------- */
  updateConditions() {
    let rollData = this.rollData
    rollData.bonusMalusConditions = 0 // Reset at each compute
    if (rollData.weaknessSelected && rollData.weaknessSelected.length > 0) {
      for (let id of rollData.weaknessSelected) {
        let weakness = rollData.weaknesses.find(t => t._id == id)
        weakness.activated = true
        rollData.bonusMalusConditions -= Number(weakness.system.actionmodifier)
      }
    }
    if (rollData.hyperSelected && rollData.hyperSelected.length > 0) {
      for (let id of rollData.hyperSelected) {
        let hyper = rollData.hyperactivities.find(t => t._id == id)
        hyper.activated = true
        rollData.bonusMalusConditions += Number(hyper.system.actionmodifier)
      }
    }
  }
  
  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);

    let dialog = this;
    function onLoad() {
    }
    $(function () { onLoad(); });

    html.find('#roll-bonus-malus').change((event) => {
      this.rollData.bonusMalus = Number(event.currentTarget.value)
    })
    html.find('#roll-difficulty').change((event) => {
      this.rollData.difficulty = Number(event.currentTarget.value) || 0
    })
    html.find('#use-specialty').change((event) => {
      this.rollData.useSpecialty = event.currentTarget.checked
    })
    html.find('#roll-lake-modifier').change((event) => {
      this.rollData.lakeModifier = Number(event.currentTarget.value)
    })
    html.find('#spent-chivalrous').change((event) => {
      this.rollData.spentChivalrous = event.currentTarget.checked
    })
    html.find('#style-combat-modifier').change((event) => {
      this.rollData.styleCombatModifier = event.currentTarget.value
      this.updateStyleBonus()
    })
    html.find('#apply-armor-penalty').change((event) => {
      this.rollData.applyArmorPenalty = event.currentTarget.checked
    })    
    html.find('#roll-weakness').change((event) => {
      this.rollData.weaknessSelected = $('#roll-weakness').val()
      this.updateConditions()
    })
    html.find('#roll-hyperactivity').change((event) => {
      this.rollData.hyperSelected = $('#roll-hyperactivity').val()
      this.updateConditions()
    })
    html.find('#style-weapon').change((event) => {
      this.rollData.selectedWeapon = event.currentTarget.value
      this.updateStyleBonus()
    })    
  }
}