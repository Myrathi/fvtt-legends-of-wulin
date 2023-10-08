/* -------------------------------------------- */
import { LoWUtility } from "../common/low-utility.js";
import { LoWRollDialog } from "../dialogs/low-roll-dialog.js";

/* -------------------------------------------- */
/* -------------------------------------------- */
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class LoWActor extends Actor {

  /* -------------------------------------------- */
  /**
   * Override the create() function to provide additional SoS functionality.
   *
   * This overrided create() function adds initial items 
   * Namely: Basic skills, money, 
   *
   * @param {Object} data        Barebones actor data which this function adds onto.
   * @param {Object} options     (Unused) Additional options which customize the creation workflow.
   *
   */

  static async create(data, options) {

    // Case of compendium global import
    if (data instanceof Array) {
      return super.create(data, options);
    }
    // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
    if (data.items) {
      let actor = super.create(data, options);
      return actor;
    }
    if (data.type == 'pc') {
      const skills = await LoWUtility.loadCompendium("fvtt-legends-of-wulin.skills");
      data.items = skills.map(i => i.toObject())
    }
    if (data.type == 'npc') {
      // TODO ?
    }

    return super.create(data, options);
  }

  /* -------------------------------------------- */
  async prepareData() {
    super.prepareData()
  }
  /* -------------------------------------------- */
  computeDerivedData() {
  }

  /* -------------------------------------------- */
  _preUpdate(changed, options, user) {

    if (changed.system?.biodata?.rank) {
      let newRiver = (5 - Number(changed.system.biodata.rank)) + 1;
      if (newRiver != this.system.river.value) {
        let dices = [];
        for (let i = 0; i < 5; i++) {
          dices.push({ index: i, active: i < newRiver, value: -1 });
        }
        changed.system.river = { value: newRiver, dices: dices };
        changed.system.lake = { value: newRiver + 5 } // Update Lake also
      }
    }
    super._preUpdate(changed, options, user);
  }

  /* -------------------------------------------- */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.computeDerivedData();
  }

  /* -------------------------------------------- */
  getMoneys() {
    let comp = this.items.filter(item => item.type == 'money');
    LoWUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getSkills() {
    let comp = duplicate(this.items.filter(it => it.type == "skill"))
    LoWUtility.sortArrayObjectsByName(comp)
    return comp
  }
  getExternalStyles() {
    let comp = duplicate(this.items.filter(it => it.type == "style" && it.system.styletype == "external"))
    LoWUtility.sortArrayObjectsByName(comp)
    return comp
  }
  getInternalStyles() {
    let comp = duplicate(this.items.filter(it => it.type == "style" && it.system.styletype == "internal"))
    LoWUtility.sortArrayObjectsByName(comp)
    return comp
  }
  getConditions() {
    let comp = duplicate(this.items.filter(it => it.type == "condition"))
    LoWUtility.sortArrayObjectsByName(comp)
    return comp
  }
  getWeakness() {
    let comp = duplicate(this.items.filter(it => it.type == "condition" && it.system.conditionkind == "weakness"))
    LoWUtility.sortArrayObjectsByName(comp)
    return comp
  }
  getHyperactivity() {
    let comp = duplicate(this.items.filter(it => it.type == "condition" && it.system.conditionkind == "hyperactivity"))
    LoWUtility.sortArrayObjectsByName(comp)
    return comp
  }
  getWeapons() {
    let comp = duplicate(this.items.filter(item => item.type == 'weapon') || [])
    LoWUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getArmors() {
    let comp = duplicate(this.items.filter(item => item.type == 'armor') || [])
    LoWUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getSecretArts() {
    let comp = duplicate(this.items.filter(item => item.type == 'secretart') || [])
    LoWUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getItemById(id) {
    let item = this.items.find(item => item.id == id);
    if (item) {
      item = duplicate(item)
    }
    return item;
  }

  /* -------------------------------------------- */
  async equipItem(itemId) {
    let item = this.items.find(item => item.id == itemId)
    if (item?.system) {
      if (item.type == "armor") {
        let armor = this.items.find(item => item.id != itemId && item.type == "armor" && item.system.equipped)
        if (armor) {
          ui.notifications.warn("You already have an armor equipped!")
          return
        }
      }
      if (item.type == "shield") {
        let shield = this.items.find(item => item.id != itemId && item.type == "shield" && item.system.equipped)
        if (shield) {
          ui.notifications.warn("You already have a shield equipped!")
          return
        }
      }
      let update = { _id: item.id, "system.equipped": !item.system.equipped };
      await this.updateEmbeddedDocuments('Item', [update]); // Updates one EmbeddedEntity
    }
  }
  /* ------------------------------------------- */
  getEquippedWeapons() {
    return this.items.filter(item => item.type == 'weapon' && item.system.equipped)
  }
  /* ------------------------------------------- */
  getEquipments() {
    return this.items.filter(item => item.type == 'equipment')
  }

  /* ------------------------------------------- */
  async buildContainerTree() {
    let equipments = duplicate(this.items.filter(item => item.type == "equipment") || [])
    for (let equip1 of equipments) {
      if (equip1.system.iscontainer) {
        equip1.system.contents = []
        equip1.system.contentsEnc = 0
        for (let equip2 of equipments) {
          if (equip1._id != equip2.id && equip2.system.containerid == equip1.id) {
            equip1.system.contents.push(equip2)
            let q = equip2.system.quantity ?? 1
            equip1.system.contentsEnc += q * equip2.system.weight
          }
        }
      }
    }

    // Compute whole enc
    let enc = 0
    for (let item of equipments) {
      //item.data.idrDice = LoWUtility.getDiceFromLevel(Number(item.data.idr))
      if (item.system.equipped) {
        if (item.system.iscontainer) {
          enc += item.system.contentsEnc
        } else if (item.system.containerid == "") {
          let q = item.system.quantity ?? 1
          enc += q * item.system.weight
        }
      }
    }
    for (let item of this.items) { // Process items/shields/armors
      if ((item.type == "weapon" || item.type == "shield" || item.type == "armor") && item.system.equipped) {
        let q = item.system.quantity ?? 1
        enc += q * item.system.weight
      }
    }

    // Store local values
    this.encCurrent = enc
    this.containersTree = equipments.filter(item => item.system.containerid == "") // Returns the root of equipements without container

  }

  /* -------------------------------------------- */
  async equipGear(equipmentId) {
    let item = this.items.find(item => item.id == equipmentId);
    if (item?.system) {
      let update = { _id: item.id, "system.equipped": !item.system.equipped };
      await this.updateEmbeddedDocuments('Item', [update]); // Updates one EmbeddedEntity
    }
  }

  /* -------------------------------------------- */
  clearInitiative() {
    this.getFlag("world", "initiative", -1)
  }
  /* -------------------------------------------- */
  getInitiativeScore(combatId, combatantId) {
    let init = Math.floor((this.system.attributs.physique.value + this.system.attributs.habilite.value) / 2)
    let subValue = new Roll("1d20").roll({ async: false })
    return init + (subValue.total / 100)
  }

  /* -------------------------------------------- */
  getSubActors() {
    let subActors = [];
    for (let id of this.system.subactors) {
      subActors.push(duplicate(game.actors.get(id)))
    }
    return subActors;
  }
  /* -------------------------------------------- */
  async addSubActor(subActorId) {
    let subActors = duplicate(this.system.subactors);
    subActors.push(subActorId);
    await this.update({ 'system.subactors': subActors });
  }
  /* -------------------------------------------- */
  async delSubActor(subActorId) {
    let newArray = [];
    for (let id of this.system.subactors) {
      if (id != subActorId) {
        newArray.push(id);
      }
    }
    await this.update({ 'system.subactors': newArray });
  }

  /* -------------------------------------------- */
  async deleteAllItemsByType(itemType) {
    let items = this.items.filter(item => item.type == itemType);
    await this.deleteEmbeddedDocuments('Item', items);
  }

  /* -------------------------------------------- */
  async addItemWithoutDuplicate(newItem) {
    let item = this.items.find(item => item.type == newItem.type && item.name.toLowerCase() == newItem.name.toLowerCase())
    if (!item) {
      await this.createEmbeddedDocuments('Item', [newItem]);
    }
  }

  /* -------------------------------------------- */
  async incDecQuantity(objetId, incDec = 0) {
    let objetQ = this.items.get(objetId)
    if (objetQ) {
      let newQ = objetQ.system.quantity + incDec
      if (newQ >= 0) {
        await this.updateEmbeddedDocuments('Item', [{ _id: objetQ.id, 'system.quantity': newQ }]) // pdates one EmbeddedEntity
      }
    }
  }
  /* -------------------------------------------- */
  washRiver() {
    let riverDices = duplicate(this.system.river.dices)
    for (let dice of riverDices) {
      dice.value = -1
      this.update({ 'system.river.dices': riverDices })
    }
  }
  /* -------------------------------------------- */
  addDiceToRiver(diceValue) {
    let riverDices = duplicate(this.system.river.dices)
    for (let dice of riverDices) {
      if (dice.active && dice.value == -1) {
        dice.value = Number(diceValue);
        this.update({ 'system.river.dices': riverDices });
        return true;
      }
    }
    console.log(riverDices)
    ui.notifications.warn("No more room available in your River !");
    return false
  }
  /* -------------------------------------------- */
  flowDice(diceIndex) {
    let msgId = this.getFlag("world", "last-roll-message-id")
    if (msgId) {
      let riverDices = duplicate(this.system.river.dices)
      let diceValue = riverDices[diceIndex].value
      riverDices[diceIndex].value = -1
      this.update({ 'system.river.dices': riverDices })
      LoWUtility.flowDiceToLake(msgId, diceValue)
    } else {
      ui.notifications.warn("No lake roll available !")
    }
  }

  /* -------------------------------------------- */
  spendChivalrous(jossValue) {
    let joss = duplicate(this.system.joss.chivalrous)
    joss.value -= jossValue
    joss.value = (joss.value < 0) ? 0 : joss.value
    this.update({ 'system.joss.chivalrous': joss })
  }

  /* -------------------------------------------- */
  getEquippedArmor() {
    return this.items.find(it => it.type == "armor" && it.system.equipped)
  }
  /* -------------------------------------------- */
  updateItemCheck(dataType, dataId, field, checked) {
    let item = this.items.find(it => it.type == dataType && it.id == dataId)
    if (item) {
      let update = { _id: item.id, [field]: checked };
      this.updateEmbeddedDocuments('Item', [update]); // Updates one EmbeddedEntity
    }
  }
  /* -------------------------------------------- */
  getCommonRollData() {
    let rollData = LoWUtility.getBasicRollData()
    rollData.alias = this.name
    rollData.actorImg = this.img
    rollData.actorId = this.id
    rollData.img = this.img
    rollData.weaponBonus = 0
    rollData.armorBonus = 0
    rollData.styleBonus = 0 
    rollData.conditions = this.getConditions()
    rollData.bonusMalusConditions = 0
    rollData.armor = this.getEquippedArmor()
    rollData.applyArmorPenalty = false
    
    // process auto weakness/hyperactivities
    for(let c of rollData.conditions) {
      c.activated = c.system.autoapply
    }
    return rollData
  }

  /* -------------------------------------------- */
  getCommonSkill(skillId) {
    let skill = this.items.find(i => i.id == skillId)
    let rollData = this.getCommonRollData()

    skill = duplicate(skill)
    rollData.skill = skill
    rollData.img = skill.img

    return rollData
  }

  /* -------------------------------------------- */
  getCommonStyle(styleId) {
    let style = this.items.find(i => i.id == styleId)
    let rollData = this.getCommonRollData()

    style = duplicate(style)
    rollData.style = style
    rollData.img = style.img

    return rollData
  }

  /* -------------------------------------------- */
  rollSkill(skillId) {
    let rollData = this.getCommonSkill(skillId)
    rollData.mode = "skill"
    rollData.title = rollData.skill.name
    this.startRoll(rollData).catch("Error on startRoll")
  }

  /* -------------------------------------------- */
  rollStyle(styleId) {
    let rollData = this.getCommonStyle(styleId)
    rollData.mode = "style"
    rollData.title = rollData.style.name
    rollData.weapons = this.getEquippedWeapons()
    rollData.styleCombatModifier = "speed"
    rollData.weaponBonus = 0
    rollData.styleBonus = rollData.style.system.stats.speed.basic + rollData.style.system.stats.speed.modified
    rollData.armorBonus = rollData.armor?.system.stats.speed.bonus ?? 0
    rollData.selectedWeapon = "none"
    this.startRoll(rollData).catch("Error on startRoll")
  }

  /* -------------------------------------------- */
  rollWeapon(weaponId) {
    let weapon = this.items.get(weaponId)
    if (weapon) {
      weapon = duplicate(weapon)
      let rollData = this.getCommonRollData()
      if (weapon.system.armetype == "mainsnues" || weapon.system.armetype == "epee") {
        rollData.attr = { label: "(Physique+Habilité)/2", value: Math.floor((this.getPhysiqueMalus() + this.system.attributs.physique.value + this.system.attributs.habilite.value) / 2) }
      } else {
        rollData.attr = duplicate(this.system.attributs.habilite)
      }
      rollData.mode = "weapon"
      rollData.weapon = weapon
      rollData.img = weapon.img
      rollData.title = weapon.name
      this.startRoll(rollData).catch("Error on startRoll")
    } else {
      ui.notifications.warn("Impossible de trouver l'arme concernée ")
    }
  }

  /* -------------------------------------------- */
  async startRoll(rollData) {
    let rollDialog = await LoWRollDialog.create(this, rollData)
    rollDialog.render(true)
  }

}
