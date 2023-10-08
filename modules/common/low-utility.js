/* -------------------------------------------- */
import { LoWCommands } from "../app/low-commands.js";

/* -------------------------------------------- */
const __maxImpacts = { superficial: 4, light: 3, serious: 2, major: 1 }
const __nextImpacts = { superficial: "light", light: "serious", serious: "major", major: "major" }
const __effect2Impact= [ "none", "superficial", "superficial", "light", "light", "serious", "serious", "major", "major" ]
const __familyWeapons ={

}
/* -------------------------------------------- */
export class LoWUtility {

  /* -------------------------------------------- */
  static async init() {
    Hooks.on('renderChatLog', (log, html, data) => LoWUtility.chatListeners(html));
    Hooks.on("getChatLogEntryContext", (html, options) => LoWUtility.chatMenuManager(html, options));

    this.rollDataStore = {}
    this.defenderStore = {}

    LoWCommands.init();
  }

  /* -------------------------------------------- */
  static async ready() {

    Handlebars.registerHelper('count', function (list) {
      return list.length;
    })
    Handlebars.registerHelper('includes', function (array, val) {
      return array.includes(val);
    })
    Handlebars.registerHelper('exists', function (field) {
      return field !== undefined && field !== null
    })
    Handlebars.registerHelper('upper', function (text) {
      return text.toUpperCase();
    })
    Handlebars.registerHelper('lower', function (text) {
      return text.toLowerCase()
    })
    Handlebars.registerHelper('upperFirst', function (text) {
      if (typeof text !== 'string') return text
      return text.charAt(0).toUpperCase() + text.slice(1)
    })
    Handlebars.registerHelper('notEmpty', function (list) {
      return list.length > 0;
    })
    Handlebars.registerHelper('mul', function (a, b) {
      return parseInt(a) * parseInt(b);
    })
    Handlebars.registerHelper('add', function (a, b) {
      return parseInt(a) + parseInt(b);
    })
    Handlebars.registerHelper('valueAtIndex', function (arr, idx) {
      return arr[idx];
    })
    Handlebars.registerHelper('for', function (from, to, incr, block) {
      let accum = '';
      for (let i = from; i <= to; i += incr)
        accum += block.fn(i);
      return accum;
    })

  }

  /*-------------------------------------------- */
  static upperFirst(text) {
    if (typeof text !== 'string') return text
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  /* -------------------------------------------- */
  static async loadCompendiumData(compendium) {
    const pack = game.packs.get(compendium)
    return await pack?.getDocuments() ?? []
  }

  /* -------------------------------------------- */
  static async loadCompendium(compendium, filter = item => true) {
    let compendiumData = await LoWUtility.loadCompendiumData(compendium)
    return compendiumData.filter(filter)
  }

  /* -------------------------------------------- */
  static getActorFromRollData(rollData) {
    let actor = game.actors.get(rollData.actorId)
    if (rollData.tokenId) {
      let token = canvas.tokens.placeables.find(t => t.id == rollData.tokenId)
      if (token) {
        actor = token.actor
      }
    }
    return actor
  }
  /* -------------------------------------------- */
  static chatMenuManager(html, options) {
    let canTranscendRoll = []
    for (let i = 1; i <= 10; i++) {
      canTranscendRoll[i] = function (li) {
        let message = game.messages.get(li.attr("data-message-id"))
        let rollData = message.getFlag("world", "rolldata")
        //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>> Menu !!!!", rollData)
        if (rollData.skill && i <= rollData.skill.value && !rollData.transcendUsed && rollData.spec) {
          return true
        }
        return false
      }
      options.push({
        name: game.i18n.localize("ECRY.chat.spectranscend") + i,
        icon: '<i class="fas fa-plus-square"></i>',
        condition: canTranscendRoll[i],
        callback: li => {
          let message = game.messages.get(li.attr("data-message-id"))
          let rollData = message.getFlag("world", "rolldata")
          LoWUtility.transcendFromSpec(rollData, i).catch("Error on Transcend")
        }
      })
    }
  }
  /* -------------------------------------------- */
  static removeDiceAndUpdate(rollData, diceValue, messageId) {
    
    this.removeChatMessageId(messageId) // Delete the previous chat message
    for (let i = 0; i < rollData.diceResults.length; i++) {
      if (rollData.diceResults[i].result == diceValue) {
        rollData.diceResults.splice(i, 1)
        break
      }
    }
    this.processRollResults(rollData) // Update and display again the new roll results
  }

  /* -------------------------------------------- */
  static flowDiceToLake(messageId, diceValue) {
    let message = game.messages.get(messageId)
    if (!message) {
      ui.notifications.error("No message found")
    } else {
      this.removeChatMessageId(messageId) // Delete the previous chat message
      let rollData = message.getFlag("world", "low-rolldata")
      rollData.diceResults.push( {result: diceValue, active: true }) // Add a new dice to the dice results
      this.processRollResults(rollData) // Update and display again the new roll results  
    }
  }

  /* -------------------------------------------- */
  static async chatListeners(html) {

    html.on("click", '.dice-to-river', event => {
      let messageId = LoWUtility.findChatMessageId(event.currentTarget)
      let message = game.messages.get(messageId)
      if (message) {
        let rollData = message.getFlag("world", "low-rolldata")
        const actorId = $(event.currentTarget).data("actor-id")
        const diceValue = Number($(event.currentTarget).data("dice-value"))
        let actor = game.actors.get( actorId)
        if ( actor.addDiceToRiver(diceValue) ) {        
          this.removeDiceAndUpdate( rollData, diceValue, messageId)
        }
      } else {
        ui.notifications.error("Unable to find the message")
      }
    })
  }

  /* -------------------------------------------- */
  static async preloadHandlebarsTemplates() {

    const templatePaths = [
      'systems/fvtt-legends-of-wulin/templates/actors/editor-notes-gm.hbs',
      'systems/fvtt-legends-of-wulin/templates/items/partial-item-nav.hbs',
      'systems/fvtt-legends-of-wulin/templates/items/partial-item-equipment.hbs',
      'systems/fvtt-legends-of-wulin/templates/items/partial-item-description.hbs',
      'systems/fvtt-legends-of-wulin/templates/actors/partial-river-management.hbs',
      'systems/fvtt-legends-of-wulin/templates/dialogs/partial-common-roll-dialog.hbs'
    ]
    return loadTemplates(templatePaths);
  }

  /* -------------------------------------------- */
  static removeChatMessageId(messageId) {
    if (messageId) {
      game.messages.get(messageId)?.delete();
    }
  }

  static findChatMessageId(current) {
    return LoWUtility.getChatMessageId(LoWUtility.findChatMessage(current));
  }

  static getChatMessageId(node) {
    return node?.attributes.getNamedItem('data-message-id')?.value;
  }

  static findChatMessage(current) {
    return LoWUtility.findNodeMatching(current, it => it.classList.contains('chat-message') && it.attributes.getNamedItem('data-message-id'));
  }

  static findNodeMatching(current, predicate) {
    if (current) {
      if (predicate(current)) {
        return current;
      }
      return LoWUtility.findNodeMatching(current.parentElement, predicate);
    }
    return undefined;
  }


  /* -------------------------------------------- */
  static createDirectOptionList(min, max) {
    let options = {};
    for (let i = min; i <= max; i++) {
      options[`${i}`] = `${i}`;
    }
    return options;
  }

  /* -------------------------------------------- */
  static buildListOptions(min, max) {
    let options = ""
    for (let i = min; i <= max; i++) {
      options += `<option value="${i}">${i}</option>`
    }
    return options;
  }

  /* -------------------------------------------- */
  static getTarget() {
    if (game.user.targets) {
      for (let target of game.user.targets) {
        return target
      }
    }
    return undefined
  }

  /* -------------------------------------------- */
  static updateRollData(rollData) {

    let id = rollData.rollId
    let oldRollData = this.rollDataStore[id] || {}
    let newRollData = mergeObject(oldRollData, rollData)
    this.rollDataStore[id] = newRollData
  }

  /* -------------------------------------------- */
  static async onSocketMesssage(msg) {
    console.log("SOCKET MESSAGE", msg.name)
    if (msg.name == "msg-draw-card") {
      if (game.user.isGM && game.system.ecryme.currentTirage) {
        game.system.ecryme.currentTirage.addCard(msg.data.msgId)
      }
    }
  }

  /* -------------------------------------------- */
  static async searchItem(dataItem) {
    let item
    if (dataItem.pack) {
      let id = dataItem.id || dataItem._id
      let items = await this.loadCompendium(dataItem.pack, item => item.id == id)
      item = items[0] || undefined
    } else {
      item = game.items.get(dataItem.id)
    }
    return item
  }

  /* -------------------------------------------- */
  static chatDataSetup(content, modeOverride, forceWhisper, isRoll = false) {
    let chatData = {
      user: game.user.id,
      rollMode: modeOverride || game.settings.get("core", "rollMode"),
      content: content
    };

    if (["gmroll", "blindroll"].includes(chatData.rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatData.rollMode === "blindroll") chatData["blind"] = true;
    else if (chatData.rollMode === "selfroll") chatData["whisper"] = [game.user];

    if (forceWhisper) { // Final force !
      chatData["speaker"] = ChatMessage.getSpeaker();
      chatData["whisper"] = ChatMessage.getWhisperRecipients(forceWhisper);
    }

    return chatData;
  }
  /* -------------------------------------------- */
  static getImpactMax(impactLevel) {
    return __maxImpacts[impactLevel]
  }
  static getNextImpactLevel(impactLevel) {
    return __nextImpacts[impactLevel]
  }
  /* -------------------------------------------- */
  static async showDiceSoNice(roll, rollMode) {
    if (game.modules.get("dice-so-nice")?.active) {
      if (game.dice3d) {
        let whisper = null;
        let blind = false;
        rollMode = rollMode ?? game.settings.get("core", "rollMode");
        switch (rollMode) {
          case "blindroll": //GM only
            whisper = this.getUsers(user => user.isGM);
            blind = true;
            break
          case "gmroll": //GM + rolling player
            whisper = this.getUsers(user => user.isGM);
            break;
          case "roll": //everybody
            whisper = this.getUsers(user => user.active);
            break;
          case "selfroll":
            whisper = [game.user.id];
            break;
        }
        await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
      }
    }
  }

  /* -------------------------------------------- */
  static computeResults(rollData) {
    rollData.isSuccess = false
    if (rollData.difficulty > 0) {
      return
    }
    if (rollData.total >= rollData.difficulty) {
      rollData.isSuccess = true
      rollData.isCritical = (rollData.total - rollData.difficulty) > 10
    }
  }

  /* -------------------------------------------- */
  static performGrouping(rollData) {
    let results = rollData.diceResults
    let groupedResults = []
    for (let i=0; i<=10; i++) {
      groupedResults[i] = {dice: i, count: 0, value: 0}
    }
    // Build the dice groups
    for (let result of results) { // Build the number of similar results
      groupedResults[result.result].count += 1 // Inc number of dice
      groupedResults[result.result].value = (groupedResults[result.result].count*10) + result.result // Compute total dice value
    }
    rollData.groupedResults = groupedResults // keep the groups
    // Then get the best group
    let bestGroup = groupedResults[0] // Dice index 0 is always 0 (ie never a result)
    for (let group of groupedResults) { 
      if (group.value > bestGroup.value) {
        bestGroup = group
      }
    }
    return bestGroup
  }

  /* -------------------------------------------- */
  static async processRollResults(rollData) {
    rollData.bestGroup = this.performGrouping(rollData)
    // Compute the total
    rollData.total = rollData.bestGroup.value
    if (rollData.skill) {
      rollData.total += rollData.skill.system.level // If skill mode, add the level
      if ( rollData.useSpecialty) {
        rollData.total += 5
      }
    }
    rollData.total += rollData.bonusMalus // Add bonus/malus if present
    rollData.total += rollData.styleBonus
    rollData.total += rollData.weaponBonus
    rollData.total += rollData.armorBonus
    rollData.bonusMalusConditions = 0
    for (let c of rollData.conditions) {
      rollData.bonusMalusConditions += (c.activated) ? Number(c.system.actionmodifier) : 0
    }
    rollData.total += rollData.bonusMalusConditions
    if (rollData.armor && rollData.applyArmorPenalty) {
      rollData.total += Number(rollData.armor.system.armorpenalty)
    }
     // Compute success/critical
    this.computeResults(rollData)
    // Display on the chat
    let msg = await this.createChatWithRollMode(rollData.alias, {
      content: await renderTemplate(`systems/fvtt-legends-of-wulin/templates/chat/chat-generic-result.hbs`, rollData)
    })
    await msg.setFlag("world", "low-rolldata", rollData)

    // Store the lates lake roll
    let actor = game.actors.get(rollData.actorId)
    await actor.setFlag("world", "last-roll-message-id", msg.id)
    console.log("Rolldata result", rollData)
  }

  /* -------------------------------------------- */
  static async rollLoW(rollData) {

    let actor = game.actors.get(rollData.actorId)
    
    // Fix difficulty
    if (!rollData.difficulty || rollData.difficulty == "-") {
      rollData.difficulty = 0
    }
    rollData.difficulty = Number(rollData.difficulty)
    
    let nbDice = actor.system.lake.value + rollData.lakeModifier 
    let diceFormula = nbDice + "d10" // Compute Lake roll number of d10
    if ( rollData.spentChivalrous && rollData.lakeModifier > 0) {
      actor.spendChivalrous(rollData.lakeModifier)
    }
    // Performs roll
    let myRoll = new Roll(diceFormula).roll({ async: false })
    await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode"))
    rollData.roll = duplicate(myRoll)  
    rollData.diceResults = duplicate(rollData.roll.terms[0].results) // get results array

    await this.processRollResults(rollData)
  }

  /* -------------------------------------------- */
  static sortArrayObjectsByName(myArray) {
    myArray.sort((a, b) => {
      let fa = a.name.toLowerCase();
      let fb = b.name.toLowerCase();
      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    })
  }

  /* -------------------------------------------- */
  static getUsers(filter) {
    return game.users.filter(filter).map(user => user.id);
  }
  /* -------------------------------------------- */
  static getWhisperRecipients(rollMode, name) {
    switch (rollMode) {
      case "blindroll": return this.getUsers(user => user.isGM);
      case "gmroll": return this.getWhisperRecipientsAndGMs(name);
      case "useronly": return this.getWhisperRecipientsOnly(name);
      case "selfroll": return [game.user.id];
    }
    return undefined;
  }
  /* -------------------------------------------- */
  static getWhisperRecipientsOnly(name) {
    let recep1 = ChatMessage.getWhisperRecipients(name) || [];
    return recep1
  }
  /* -------------------------------------------- */
  static getWhisperRecipientsAndGMs(name) {
    let recep1 = ChatMessage.getWhisperRecipients(name) || [];
    return recep1.concat(ChatMessage.getWhisperRecipients('GM'));
  }

  /* -------------------------------------------- */
  static blindMessageToGM(chatOptions) {
    let chatGM = duplicate(chatOptions);
    chatGM.whisper = this.getUsers(user => user.isGM);
    chatGM.content = "Blinde message of " + game.user.name + "<br>" + chatOptions.content;
    console.log("blindMessageToGM", chatGM);
    game.socket.emit("system.fvtt-legends-of-wulin", { msg: "msg_gm_chat_message", data: chatGM });
  }


  /* -------------------------------------------- */
  static split3Columns(data) {

    let array = [[], [], []];
    if (data == undefined) return array;

    let col = 0;
    for (let key in data) {
      let keyword = data[key];
      keyword.key = key; // Self-reference
      array[col].push(keyword);
      col++;
      if (col == 3) col = 0;
    }
    return array;
  }

  /* -------------------------------------------- */
  static async createChatMessage(name, rollMode, chatOptions) {
    switch (rollMode) {
      case "blindroll": // GM only
        if (!game.user.isGM) {
          this.blindMessageToGM(chatOptions);

          chatOptions.whisper = [game.user.id];
          chatOptions.content = "Message only to the GM";
        }
        else {
          chatOptions.whisper = this.getUsers(user => user.isGM);
        }
        break;
      default:
        chatOptions.whisper = this.getWhisperRecipients(rollMode, name);
        break;
    }
    chatOptions.alias = chatOptions.alias || name;
    return await ChatMessage.create(chatOptions);
  }

  /* -------------------------------------------- */
  static getBasicRollData() {
    let rollData = {
      rollId: randomID(16),
      type: "roll-data",
      bonusMalus: 0,
      rollMode: game.settings.get("core", "rollMode"),
      difficulty: 0,
      useSpecialty: false,
      lakeModifier: 0,
      spentChivalrous: false,
      config: duplicate(game.system.low.config),

    }
    LoWUtility.updateWithTarget(rollData)
    return rollData
  }

  /* -------------------------------------------- */
  static updateWithTarget(rollData) {
    let target = LoWUtility.getTarget()
    if (target) {
      rollData.defenderTokenId = target.id
    }
  }

  /* -------------------------------------------- */
  static async createChatWithRollMode(name, chatOptions) {
    return await this.createChatMessage(name, game.settings.get("core", "rollMode"), chatOptions)
  }

  /* -------------------------------------------- */
  static async confirmDelete(actorSheet, li) {
    let itemId = li.data("item-id");
    let msgTxt = "<p>Are you sure to remove this Item ?";
    let buttons = {
      delete: {
        icon: '<i class="fas fa-check"></i>',
        label: "Yes, remove it",
        callback: () => {
          actorSheet.actor.deleteEmbeddedDocuments("Item", [itemId]);
          li.slideUp(200, () => actorSheet.render(false));
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      }
    }
    msgTxt += "</p>";
    let d = new Dialog({
      title: "Confirm removal",
      content: msgTxt,
      buttons: buttons,
      default: "cancel"
    });
    d.render(true);
  }

}