
export const LOW_CONFIG = {

  loreType: {
    destiny: "Destiny",
    involvement: "Involvement",
    fortune: "Fortune",
    secret: "Secret",
    victory: "Victory",
    treasure: "Treasure",
    technique: "Technique",
    status: "Status"
  },
  conditionType: {
    trivial: "Trivial",
    minor: "Minor",
    major: "Major"
  },
  modifierAll5: {
    "-20": "-20",
    "-15": "-15",
    "-10": "-10",
    "-5": "-5",
    "0": "+0",
    "5": "+5",
    "10": "+10",
    "15": "+15",
    "20": "+20",
  },
  modifierPositive5: {
    "0": "+0",
    "5": "+5",
    "10": "+10",
    "15": "+15",
    "20": "+20",
  },
  modifierPositive1: {
    "0": "+0",
    "1": "+1",
    "2": "+2",
    "3": "+3",
    "4": "+4",
    "5": "+5",
  },
  conditionKind: {
    weakness: "Weakness",
    hyperactivity: "Hyperactivity"
  },
  styleType: {
    internal: "Internal",
    external: "External"
  },
  styleCombatModifier: {
    "speed": {label: "Speed", value: "speedbonus"},
    "strike": {label: "Strike", value: "strikebonus"},
    "damage": {label: "Damage", value: "damagebonus"},
    "block": {label: "Block", value: "blockbonus"},
    "footwork": {label: "Footwork", value: "footworkbonus"},
  },
  difficulty: {
    10: "Trivial",
    20: "Moderate",
    30: "Hard",
    40: "Memorable",
    60: "Fantastic",
    80: "Legendary",
    100: "Impossible"
  },
  armorTypes: {
    "light": {name: "Light", soak: 0, mobility: 0, defense: 0, effects: ["", "", "", ""]},
    "medium": {name: "Medium", soak: 0, mobility: 0, defense: 0, effects: ["", "", "", ""]},
    "heavy": {name: "Heavy", soak: 0, mobility: 0, defense: 0, effects: ["", "", "", ""]},
  },
  weaponFamilies: {
    flexible: {
      name: "Flexible", speedbonus: 0, blockbonus: 0, strikebonus: 5, footworkbonus: 0, damagebonus: 0, hasflood: true, effects: ["You can make attacks against targets in adjacent Zones.", "You may Flood one die from the River to make an attack against targets further away, up to the limit that the Sage feels is reasonable.", "", ""] },
      improvised: {
        name: "Improvised", speedbonus: 0, blockbonus: 0, strikebonus: 0, footworkbonus: 0, damagebonus: 0, hasflood: false, effects: ["", "", "", ""] },
      massive: {
        name: "Massive", speedbonus: 0, blockbonus: 0, strikebonus: 0, footworkbonus: 0, damagebonus: 5, hasflood: true, effects: ["If an attack with a Massive weapon is described in such a way that it is best Dodged instead of Blocked, the penalty to Block is -10 instead of -5.", "You may Flood one die from the River while you make the attack to ignore the target’s armor on any resulting Rippling roll.", "", ""] },
      paired: {
        name: "Paired", speedbonus: 0, blockbonus: 0, strikebonus: 5, footworkbonus: 0, damagebonus: 0, hasflood: true, effects: ["If you Block an attack against an opponent in the same Zone by 10 or more, you may Reply against that opponent.", "You can Flood a die or set of dice from the River as the basis for a Secondary Attack.", "", ""] },
      ranged: {
        name: "Ranged", speedbonus: 0, blockbonus: 0, strikebonus: 5, footworkbonus: 0, damagebonus: 0, hasflood: true, effects: ["You can make attacks against targets in adjacent Zones.", "You may Flood one die from the River to make an attack against targets further away, up to the limit that the Sage feels is reasonable.", "", ""] },
      sabers: {
        name: "Sabers", speedbonus: 0, blockbonus: 0, strikebonus: 5, footworkbonus: 0, damagebonus: 5, hasflood: true, effects: ["You may Flood one die from the River to force an immediate Rippling check if the Strike exceeds the defense by 5 or more, instead of 10. You may do this after the defender rolls. (This doesn’t apply to other attack forms, such as Secret Arts or energy attacks.)", "", ""] },
      staff: {
        name: "Staff", speedbonus: 0, blockbonus: 5, strikebonus: 5, footworkbonus: 0, damagebonus: 0, hasflood: true, effects: ["You can Flood a die or set of dice from the River as the basis for a Secondary Attack.", "", "", ""] },
      spears: {
        name: "Spears", speedbonus: 0, blockbonus: 0, strikebonus: 0, footworkbonus: 0, damagebonus: 5, hasflood: true, effects: ["You may Flood one die from the River to  extend an attack into an adjacent zone.", "You may Flood one die from the River while you make a Block. If you do, you may exploit your weapon’s  superior reach. For this defense you Laugh at your opponent and do not Fear him, unless he can claim a similar long reach (such as from using a spear or a ranged weapon).", "", "", ""] },
      special: {
        name: "Special", speedbonus: 0, blockbonus: 0, strikebonus: 0, footworkbonus: 0, damagebonus: 0, hasflood: false, effects: ["", "", "", ""] },
      swords: {
        name: "Swords", speedbonus: 0, blockbonus: 5, strikebonus: 5, footworkbonus: 0, damagebonus: 0, hasflood: true, effects: ["You may Flood one die from the River while you make the attack. If you do and cause a Rippling roll, any Chi Aura used to protect against this damage costs 2 Chi points per die to purchase.", "", "", ""] },
      unarmed: {
        name: "Unarmed", speedbonus: 5, blockbonus: 0, strikebonus: 0, footworkbonus: 5, damagebonus: 0, hasflood: false, effects: ["You can Focus on Breath using only a single die from your initiative roll, instead of needing a set.", "", "", ""] },
    }
  }