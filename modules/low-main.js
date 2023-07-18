/**
 * LoW system
 * Author: Uberwald
 * Software License: Prop
 */

/* -------------------------------------------- */

/* -------------------------------------------- */
// Import Modules
import { LoWActor } from "./actors/low-actor.js";
import { LoWItemSheet } from "./items/low-item-sheet.js";
import { LoWActorSheet } from "./actors/low-actor-sheet.js";
import { LoWUtility } from "./common/low-utility.js";
import { LoWCombat } from "./app/low-combat.js";
import { LoWItem } from "./items/low-item.js";
import { LoWHotbar } from "./app/low-hotbar.js"
import { LOW_CONFIG } from "./common/low-config.js"

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/************************************************************************************/
Hooks.once("init", async function () {

  console.log(`Initializing LoW RPG`);

  game.system.low = {
    config: LOW_CONFIG,
    LoWHotbar
  }

  /* -------------------------------------------- */
  // preload handlebars templates
  LoWUtility.preloadHandlebarsTemplates();

  /* -------------------------------------------- */
  // Set an initiative formula for the system 
  CONFIG.Combat.initiative = {
    formula: "1d6",
    decimals: 1
  };

  /* -------------------------------------------- */
  game.socket.on("system.fvtt-legends-of-wulin", data => {
    LoWUtility.onSocketMesssage(data)
  });

  /* -------------------------------------------- */
  // Define custom Entity classes
  CONFIG.Combat.documentClass = LoWCombat
  CONFIG.Actor.documentClass = LoWActor
  CONFIG.Item.documentClass = LoWItem

  /* -------------------------------------------- */
  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("fvtt-legends-of-wulin", LoWActorSheet, { types: ["pc"], makeDefault: true });
  //Actors.registerSheet("fvtt-legends-of-wulin", LoWNPCSheet, { types: ["pnj"], makeDefault: false });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("fvtt-legends-of-wulin", LoWItemSheet, { makeDefault: true });

  LoWUtility.init()

});

/* -------------------------------------------- */
function welcomeMessage() {
  if (game.user.isGM) {
    ChatMessage.create({
      user: game.user.id,
      whisper: [game.user.id],
      content: `<div id="welcome-message-ecryme"><span class="rdd-roll-part">
      <strong>Welcom in Legends of Wulin RPG !</strong>` });
  }
}

/* -------------------------------------------- */
// Register world usage statistics
function registerUsageCount(registerKey) {
  if (game.user.isGM) {
    game.settings.register(registerKey, "world-key", {
      name: "Unique world key",
      scope: "world",
      config: false,
      default: "",
      type: String
    });

    let worldKey = game.settings.get(registerKey, "world-key")
    if (worldKey == undefined || worldKey == "") {
      worldKey = randomID(32)
      game.settings.set(registerKey, "world-key", worldKey)
    }
    // Simple API counter
    let regURL = `https://www.uberwald.me/fvtt_appcount/count.php?name="${registerKey}"&worldKey="${worldKey}"&version="${game.release.generation}.${game.release.build}"&system="${game.system.id}"&systemversion="${game.system.version}"`
    //$.ajaxSetup({
    //headers: { 'Access-Control-Allow-Origin': '*' }
    //})
    $.ajax(regURL)
  }
}

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("ready", function () {

  // User warning
  if (!game.user.isGM && game.user.character == undefined) {
    ui.notifications.info("Warning ! No PC connected to the player !");
    ChatMessage.create({
      content: "<b>WARNING</b> Player  " + game.user.name + " is not connected to any PC !",
      user: game.user._id
    });
  }

  registerUsageCount(game.system.id)
  welcomeMessage();
  LoWUtility.ready()

})


/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.on("chatMessage", (html, content, msg) => {
  if (content[0] == '/') {
    let regExp = /(\S+)/g;
    let commands = content.match(regExp);
    if (game.system.ecryme.commands.processChatCommand(commands, content, msg)) {
      return false;
    }
  }
  return true;
});

