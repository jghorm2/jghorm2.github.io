console.log(document.getElementById("characterLevel").value)
console.log(document.getElementById("characterLevel").innerHTML)
const characterLevel = Math.max(1, Math.min(20, parseInt(document.getElementById("characterLevel").value || "1", 10)));
const dungonLevel = Math.max(1, Math.min(20, parseInt(document.getElementById("dungonLevel").value || "1", 10)));
const lootLevel = characterLevel+dungonLevel
const tier = getTier(lootLevel);


// --- Tab Switching Logic ---
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // hide all panes
    document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.add("hidden"));
    // reset all buttons
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("bg-gray-800"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.add("bg-gray-700"));
    // show chosen
    const tab = btn.getAttribute("data-tab");
    btn.classList.remove("bg-gray-700");
    btn.classList.add("bg-gray-800");
  });
});

// --- Example table renderers ---
function renderRangeTable(arr, targetId) {
  const tbody = document.getElementById(targetId);
  tbody.innerHTML = "";
  arr.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-2 py-1">${e.min ?? ""}-${e.max ?? ""}</td>
      <td class="px-2 py-1">${e.name ?? ""}</td>
      <td class="px-2 py-1">${e.value ?? ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSpellTables(tblObj, targetId) {
  const tbody = document.getElementById(targetId);
  tbody.innerHTML = "";
  for (const [level, spells] of Object.entries(tblObj)) {
    const header = document.createElement("tr");
    header.innerHTML = `<td colspan="2" class="font-semibold text-gray-300 py-2">${level}</td>`;
    tbody.appendChild(header);

    spells.forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-2 py-1">${s.name ?? s}</td>
        <td class="px-2 py-1">${s.value ?? ""}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}


function pickFromTable(table, roll) {
      return table.find(isGearEnchanted => roll >= isGearEnchanted.min && roll <= isGearEnchanted.max) || null;
    }

function rollInAllowedRanges(allowed) {
      let attempts = 0;
      while (attempts++ < 500) {
        const affixRange = rollDice(1, 2000);
        for (const rng of allowed) {
          if (affixRange >= rng.min && affixRange <= rng.max) return affixRange;
        }
      }
      return null; // shouldn't happen with valid ranges
    }

function rollDice(num, sides) {
			let total = 0;
			for (let loopCounter = 0; loopCounter < num; loopCounter++) total += Math.floor(Math.random() * sides) + 1;
		return total;
	}

function getTier(lootLevel) {
			if (lootLevel < 9) return 1;
			if (lootLevel < 17) return 2;
			if (lootLevel < 25) return 3;
			return 4;
    }

function allowedPrefixRanges(isArmor, tier) {
			if (isArmor) {
				if (tier === 1) return [{min:1,max:100},{min:406,max:435}];
				if (tier === 2) return [{min:1,max:241},{min:406,max:549}];
				if (tier === 3) return [{min:1,max:357},{min:406,max:679}];
				if (tier === 4) return [{min:1,max:733}];
			} else {
				if (tier === 1) return [{min:406,max:435},{min:734,max:1011}];
				if (tier === 2) return [{min:406,max:549},{min:734,max:1442}];
				if (tier === 3) return [{min:406,max:679},{min:734,max:1859}];
				if (tier === 4) return [{min:406,max:2000}];
			}
			return [];
		}

function allowedSuffixRanges(isArmor, tier) {
			if (isArmor) {
				if (tier === 1) return [{min:1,max:243},{min:1305,max:1387}];
				if (tier === 2) return [{min:1,max:594},{min:1305,max:1532}];
				if (tier === 3) return [{min:1,max:911},{min:1305,max:1640}];
				if (tier === 4) return [{min:1,max:1640}];
			} else {
				if (tier === 1) return [{min:1302,max:1387},{min:1641,max:1736}];
				if (tier === 2) return [{min:1302,max:1532},{min:1641,max:1880}];
				if (tier === 3) return [{min:1302,max:2000}];
				if (tier === 4) return [{min:1302,max:2000}];
			}
			return [];
		}

function allowedCursePrifixRanges(isArmor, tier) {
			if (isArmor) {
				if (tier === 1) return [{min:1,max:31}];
				if (tier === 2) return [{min:1,max:41},{min:56,max:65}];
				if (tier === 3) return [{min:1,max:75}];
				if (tier === 4) return [{min:1,max:75}];
			} else {
				if (tier === 1) return [{min:76,max:100}];
				if (tier === 2) return [{min:56,max:120}];
				if (tier === 3) return [{min:56,max:120}];
				if (tier === 4) return [{min:56,max:120}];
			}
			return [];
		}

function allowedCurseSuffixRanges(isArmor, tier) {
			if (isArmor) {
				if (tier === 1) return [{min:1,max:54},{min:137,max:149}];
				if (tier === 2) return [{min:1,max:122},{min:137,max:168}];
				if (tier === 3) return [{min:1,max:168}];
				if (tier === 4) return [{min:1,max:168}];
			} else {
				if (tier === 1) return [{min:137,max:144}];
				if (tier === 2) return [{min:137,max:200}];
				if (tier === 3) return [{min:137,max:200}];
				if (tier === 4) return [{min:137,max:200}];
			}
			return [];
		}

function getValidPrefix(isArmor, tier) {
  // Roll normally from allowed ranges
  const affixRange = rollInAllowedRanges(allowedPrefixRanges(isArmor, tier));
  let chosen = affixRange ? pickFromTable(prefixTable, affixRange) : null;

  // 2% chance to replace with a curse prefix
  if (chosen && Math.random() < 0.02) {
    const curseRoll = rollInAllowedRanges(allowedCursePrifixRanges(isArmor, tier));
    chosen = curseRoll ? pickFromTable(prefixCurseTable, curseRoll) : null;
    if (chosen) chosen.isCurse = true;
  }

  return chosen;
}

function getValidSuffix(isArmor, tier) {
  // Roll normally from allowed ranges
  const affixRange = rollInAllowedRanges(allowedSuffixRanges(isArmor, tier));
  let chosen = affixRange ? pickFromTable(suffixTable, affixRange) : null;

  // 2% chance to replace with a curse suffix
  if (chosen && Math.random() < 0.02) {
    const curseRoll = rollInAllowedRanges(allowedCurseSuffixRanges(isArmor, tier));
    chosen = curseRoll ? pickFromTable(suffixCurseTable, curseRoll) : null;
    if (chosen) chosen.isCurse = true;
  }

  return chosen;
}

function rollGold() {

			const dice = rollDice(1, 20);
			const multiplier = 1.01 + Math.random() * (1.35 - 1.01);
			const gold = Math.floor(dice * (characterLevel+dungonLevel) * multiplier);
	return `<strong>${gold}</strong> gold`;
}

function rollPotion(tier) {
      const roll = rollDice(1, (15*tier));
      const entry = potionTable.find(p => roll >= p.min && roll <= p.max);
      return `<span style="color:#cb51bf;"><i><strong>${entry ? entry.name : "Unknown"}</strong></i></span> <br>Item Value: <strong>${entry ? entry.value : "Unknown"}</strong> gp`;
    }

function rollMagicConsumable(tier) {
  let baseRoll = 1 + Math.floor((rollDice(1, 100) - 1) * ((tier * 25)) / 100);
  let tableName;

  if (baseRoll <= 9) tableName = "cantrip";
  else if (baseRoll <= 19) tableName = "level1";
  else if (baseRoll <= 29) tableName = "level2";
  else if (baseRoll <= 39) tableName = "level3";
  else if (baseRoll <= 49) tableName = "level4";
  else if (baseRoll <= 59) tableName = "level5";
  else if (baseRoll <= 69) tableName = "level6";
  else if (baseRoll <= 79) tableName = "level7";
  else if (baseRoll <= 89) tableName = "level8";
  else tableName = "level9";

  let table = spellTables[tableName];
  let spellIndex = rollDice(1, table.length) - 1;
  let spell = table[spellIndex];

  let format = rollDice(1, 20) <= 19 ? "Spell Scroll" : "Spell Book";

  let baseValue = spell.value;
  if (format === "Spell Book") baseValue *= 5;

  return `<span style="color:#2dc9e9;"><i><strong>${format} of ${spell.name}</i></strong></span><br>Item Value: <strong>${baseValue}</strong> gp`;
}

function rollAffixCount() {
  const roll = rollDice(1, 20);
  if (roll <= 4) return 2;
  else if (roll <= 16) return 3;
  else if (roll <= 18) return 4;
  else return 5;
}

function rollMundaneItem(tier, isArmor) {
      let roll = 0, item = null;
      if (isArmor) {
        if (tier === 1) roll = rollDice(1, 162);
        else if (tier === 2) roll = rollDice(1, 452);
        else if (tier === 3) roll = rollDice(1, 842);
        else roll = rollDice(1, 1000);
        item = pickFromTable(armorTable, roll);
      } else {
        if (tier === 1) roll = rollDice(1, 63);
        else if (tier === 2) roll = rollDice(1, 369);
        else if (tier === 3) roll = rollDice(1, 801);
        else roll = rollDice(1, 1200);
        item = pickFromTable(weaponTable, roll);
      }
      return { roll, item };
    }

// Helper: compute value per your rules
function calculateFinalValue(baseValue, affixes, enchanted) {
  const base = Number(baseValue) || 0;

  if (!enchanted) {
    // Mundane: just the base (no +20, no multipliers)
    return Math.floor(base);
  }

  // Enchanted with affixes?
  const numericAffixes = (affixes || []).filter(a => a && typeof a.multiplier === 'number');
  if (numericAffixes.length === 0) {
    // Enchanted but no multipliers: base + 20
    return Math.floor(base + 20);
  }

  // Additive percentile multipliers, applied to (base + 20)
  // effectiveMultiplier = 1 + Σ(multiplier - 1)
  let effectiveMultiplier = 1;
  for (const a of numericAffixes) {
    effectiveMultiplier += (a.multiplier - 1);
  }

  return Math.floor((base + 20) * effectiveMultiplier);
}

function rollGear(tier, { forceType = null, forceEnchant = null } = {}) {
  // Decide armor vs weapon
  let isArmor = (forceType === 'armor') ? true :
                (forceType === 'weapon') ? false :
                (rollDice(1,20) <= 10);

  // Roll a mundane base item from your tables/ranges
  const { item } = rollMundaneItem(tier, isArmor);
  const baseValue = item ? (item.value || 0) : 0;

  // ---------- ENCHANTMENT TYPE ----------
  let enchantChoice = forceEnchant;
  if (!enchantChoice) {
    const isGearEnchanted = rollDice(1, 20);
    if (isGearEnchanted >= 1 && isGearEnchanted <= 8) enchantChoice = 'mundane';
    else if (isGearEnchanted >= 9 && isGearEnchanted <= 13) enchantChoice = 'prefix';
    else if (isGearEnchanted >= 14 && isGearEnchanted <= 18) enchantChoice = 'suffix';
    else enchantChoice = 'both'; // 19–20
  }

  // ---------- RARE ITEM ROLL ----------
  const isRare = (forceEnchant === 'rare') ||
                 (enchantChoice !== 'mundane' && Math.random() < 0.02);

  if (isRare) {
    // Roll 2–5 affixes (prefix/suffix mix, no curses here, no duplicates)
	const affixCount = rollAffixCount();
    const chosenAffixes = [];
    const usedAffixNames = new Set();

    while (chosenAffixes.length < affixCount) {
      const affixType = (rollDice(1, 2) === 1 ? 'prefix' : 'suffix');
      let affix = null;

      if (affixType === 'prefix') {
        const r = rollInAllowedRanges(allowedPrefixRanges(isArmor, tier));
        affix = r ? pickFromTable(prefixTable, r) : null;
      } else {
        const r = rollInAllowedRanges(allowedSuffixRanges(isArmor, tier));
        affix = r ? pickFromTable(suffixTable, r) : null;
      }

      if (affix && !usedAffixNames.has(affix.name)) {
        chosenAffixes.push(affix);
        usedAffixNames.add(affix.name);
      }

      // Safety: stop if we've exhausted the pool
      if (usedAffixNames.size >= (prefixTable.length + suffixTable.length)) break;
    }

    const title = getRareTitle();
    let desc = `<i>"${title}"</i><br>${item ? item.name : "No Item (empty range)"}`;
    const benefits = chosenAffixes.map(a => `• ${a.benefit}`);

    // VALUE: enchanted (true), apply +20 before additive percent multipliers
    const finalValue = calculateFinalValue(baseValue, chosenAffixes, true);

    return `<span style="color:#ffff00;"><strong>${desc}</strong></span><br>${benefits.join("<br>")}<br>Item Value: <strong>${finalValue}</strong> gp`;
  }

  // ---------- NORMAL ENCHANT FLOW ----------
  let prefix = null, suffix = null;

  if (enchantChoice === 'prefix' || enchantChoice === 'both') {
    prefix = getValidPrefix(isArmor, tier); // may 2% flip to curse internally
  }
  if (enchantChoice === 'suffix' || enchantChoice === 'both') {
    suffix = getValidSuffix(isArmor, tier); // may 2% flip to curse internally
  }

  // Build description
  let desc = item ? item.name : "No Item (empty range)";
  if (prefix) desc = `${prefix.name} ${desc}`;
  if (suffix) desc = `${desc} ${suffix.name}`;

  const benefits = [];
  if (prefix) {
    if (prefix.isCurse) {
      benefits.unshift(`Cursed: ${prefix.benefit}`);
    } else {
      benefits.push(`• ${prefix.benefit}`);
    }
  }
  if (suffix) {
    if (suffix.isCurse) {
      benefits.unshift(`Cursed: ${suffix.benefit}`);
    } else {
      benefits.push(`• ${suffix.benefit}`);
    }
  }

  // VALUE: enchanted if not 'mundane'
  const enchanted = (enchantChoice !== 'mundane');
  const affixesForValue = [];
  if (prefix) affixesForValue.push(prefix);
  if (suffix) affixesForValue.push(suffix);

  const finalValue = calculateFinalValue(baseValue, affixesForValue, enchanted);

// ---- Final return ----
if (enchanted) {
  return `<span style="color:#4850b8;"><i><strong>${desc}</strong></i></span>` +
         `${benefits.length ? "<br>" + benefits.join("<br>") : ""}` +
         `<br>Item Value: <strong>${finalValue}</strong> gp`;
} else {
  return `<span style="color:#ffffff;"><i><strong>${desc}</strong></i></span>` +
         `<br>Item Value: <strong>${finalValue}</strong> gp`;
}
}

function getRareTitle() {
  const w1 = rareTitleWords1[rollDice(1, rareTitleWords1.length) - 1];
  const w2 = rareTitleWords2[rollDice(1, rareTitleWords2.length) - 1];
  return `${w1} ${w2}`;
}
// Global variable to store all loot results
let allLootResults = [];

// Enhanced rollLoot function that returns structured data
function rollLoot(characterLevel, dungonLevel) {
  const lootLevel = characterLevel + dungonLevel;
  const tier = getTier(lootLevel);
  const forced = document.getElementById("forcedOutcome").value;

  // Determine outcome
  let outcome = null;
  let lootRoll = rollDice(1, 20);
  let results = []; // Array to hold all results including extra loot

  if (forced === "random") {
    // Outcome ranges:
    // 1–6 Nothing, 7–8 Gold, 9–11 Potion, 12–13 Spell, 14–20 Gear
    if (lootRoll >= 1 && lootRoll <= 6) outcome = "nothing";
    else if (lootRoll >= 7 && lootRoll <= 8) outcome = "gold";
    else if (lootRoll >= 9 && lootRoll <= 11) outcome = "potion";
    else if (lootRoll >= 12 && lootRoll <= 13) outcome = "spell";
    else outcome = "gear";
  } else {
    const forceMenu = parseInt(forced, 10);

    if (forceMenu === 0) outcome = "nothing";
    else if (forceMenu === 1) outcome = "gold";
    else if (forceMenu === 2) outcome = "potion";
    else if (forceMenu === 4) outcome = "spell";
    else if (forceMenu === 3) outcome = "gear";
    else if (forceMenu === 5) {
      const choices = ['prefix', 'suffix', 'both'];
      const randomChoice = choices[rollDice(1, choices.length) - 1];
      return [createLootResult("gear", rollGear(tier, { forceEnchant: randomChoice }), false)];
    }
    // ---------- Weapon ----------
    else if (forceMenu === 23) return [createLootResult("gear", rollGear(tier, { forceType: 'weapon', forceEnchant: 'mundane' }), false)];
    else if (forceMenu === 24) {
      const choices = ['prefix', 'suffix', 'both'];
      const randomChoice = choices[rollDice(1, choices.length) - 1];
      return [createLootResult("gear", rollGear(tier, { forceType: 'weapon', forceEnchant: randomChoice }), false)];
    }
    else if (forceMenu === 20) return [createLootResult("gear", rollGear(tier, { forceType: 'weapon', forceEnchant: 'prefix' }), false)];
    else if (forceMenu === 21) return [createLootResult("gear", rollGear(tier, { forceType: 'weapon', forceEnchant: 'suffix' }), false)];
    else if (forceMenu === 22) return [createLootResult("gear", rollGear(tier, { forceType: 'weapon', forceEnchant: 'both' }), false)];

    // ---------- Armor ----------
    else if (forceMenu === 33) return [createLootResult("gear", rollGear(tier, { forceType: 'armor', forceEnchant: 'mundane' }), false)];
    else if (forceMenu === 34) {
      const choices = ['prefix', 'suffix', 'both'];
      const randomChoice = choices[rollDice(1, choices.length) - 1];
      return [createLootResult("gear", rollGear(tier, { forceType: 'armor', forceEnchant: randomChoice }), false)];
    }
    else if (forceMenu === 30) return [createLootResult("gear", rollGear(tier, { forceType: 'armor', forceEnchant: 'prefix' }), false)];
    else if (forceMenu === 31) return [createLootResult("gear", rollGear(tier, { forceType: 'armor', forceEnchant: 'suffix' }), false)];
    else if (forceMenu === 32) return [createLootResult("gear", rollGear(tier, { forceType: 'armor', forceEnchant: 'both' }), false)];

    // ---------- Rare ----------
    else if (forceMenu === 40) return [createLootResult("gear", rollGear(tier, { forceEnchant: 'rare' }), false)];
    else if (forceMenu === 41) return [createLootResult("gear", rollGear(tier, { forceType: 'weapon', forceEnchant: 'rare' }), false)];
    else if (forceMenu === 42) return [createLootResult("gear", rollGear(tier, { forceType: 'armor', forceEnchant: 'rare' }), false)];

    else outcome = "gear";
  }

  // Generate primary loot
  let primaryResult = "";
  if (outcome === "nothing") {
    primaryResult = `<span style="color:#a0a0a0;">No Loot</span>`;
  } else if (outcome === "gold") {
    primaryResult = rollGold();
  } else if (outcome === "potion") {
    primaryResult = rollPotion(tier);
  } else if (outcome === "spell") {
    primaryResult = rollMagicConsumable(tier);
  } else if (outcome === "gear") {
    primaryResult = rollGear(tier);
  }

  // Add primary result
  results.push(createLootResult(outcome, primaryResult, false));

  // Check for extra loot
  if ((outcome === "gold" || outcome === "potion") && rollDice(1, 20) <= 17) {
    // All possible loot types
    const lootTypes = ["gold", "potion", "spell", "gear"];
    const altOutcome = lootTypes[rollDice(1, lootTypes.length) - 1];

    // Generate extra loot
    let extraResult = "";
    if (altOutcome === "gold") extraResult = rollGold();
    else if (altOutcome === "potion") extraResult = rollPotion(tier);
    else if (altOutcome === "spell") extraResult = rollMagicConsumable(tier);
    else if (altOutcome === "gear") extraResult = rollGear(tier);

    // Add extra result as separate item
    results.push(createLootResult(altOutcome, extraResult, true));
  }

  return results;
}

// Helper function to create structured loot result
function createLootResult(type, html, isExtra) {
  return {
    type: type,
    html: html,
    isExtra: isExtra,
    timestamp: Date.now()
  };
}

// Enhanced runLoot function
function runLoot() {
  const characterLevel = Math.max(1, Math.min(20, parseInt(document.getElementById("characterLevel").value || "1", 10)));
  const dungonLevel = Math.max(1, Math.min(20, parseInt(document.getElementById("dungonLevel").value || "1", 10)));
  const rolls = Math.max(1, parseInt(document.getElementById("rolls").value || "1", 10));

  // Clear previous results
  allLootResults = [];

  // Generate all loot
  for (let i = 0; i < rolls; i++) {
    const rollResults = rollLoot(characterLevel, dungonLevel);
    allLootResults.push(...rollResults);
  }

  // Display results
  displayLootResults();
}

// Function to display loot results with sorting options
function displayLootResults() {
  const resultsContainer = document.getElementById("results");
  
  if (allLootResults.length === 0) {
    resultsContainer.innerHTML = '<div class="text-gray-400">No results to display</div>';
    return;
  }

  // Create filtering controls with dropdown
  const filteringControls = `
    <div class="mb-4 p-3 bg-gray-800 rounded">
      <div class="flex items-center gap-3">
        <label for="loot-filter" class="text-gray-300 font-semibold">Filter by:</label>
        <select id="loot-filter" onchange="sortLootResults(this.value)" class="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 focus:outline-none focus:border-blue-500">
            <option value="all">Show All</option>
          <optgroup label="Common Items">
            <option value="gold">Gold</option>
            <option value="potion">Potions</option>
            <option value="spell">Spell Scrolls/Books</option>
            <option value="mundane-gear">Mundane Gear</option>
          </optgroup>
          <optgroup label="Gear">
            <option value="ll-gear-types">All Gear</option>
            <option value="enchanted-armor">Enchanted Armor</option>
            <option value="enchanted-weapons">Enchanted Weapons</option>
            <option value="rare-gear">Rare Gear</option>
            <option value="magic-gear">Magical Gear</option>
          </optgroup>
            <option value="nothing">No loot</option>
        </select>
        <button onclick="clearAllLoot()" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors font-semibold">Clear All</button>
      </div>
    </div>
  `;

  // Generate results HTML with clear buttons
  const resultsHTML = allLootResults.map((result, index) => {
    const extraLabel = result.isExtra ? '<span class="text-green-400 font-semibold">[EXTRA LOOT] </span>' : '';
    return `
      <div class="p-3 bg-gray-800/70 rounded loot-item relative" data-type="${result.type}" data-extra="${result.isExtra}" data-index="${index}">
        <button onclick="clearLootItem(${index})" class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors" title="Clear this item">×</button>
        <div class="pr-8">${extraLabel}${result.html}</div>
      </div>
    `;
  }).join('');

  resultsContainer.innerHTML = filteringControls + resultsHTML;
}

// Function to sort and filter loot results
function sortLootResults(filterType) {
  const lootItems = document.querySelectorAll('.loot-item');

  lootItems.forEach(item => {
    const itemType = item.getAttribute('data-type');
    const isExtra = item.getAttribute('data-extra') === 'true';
    const itemHTML = item.innerHTML.toLowerCase();
    
    let shouldShow = false;
    
    switch (filterType) {
      case 'all':
        shouldShow = true;
        break;
      case 'nothing':
        shouldShow = itemType === 'nothing';
        break;
      case 'gold':
        shouldShow = itemType === 'gold';
        break;
      case 'potion':
        shouldShow = itemType === 'potion';
        break;
      case 'spell':
        shouldShow = itemType === 'spell';
        break;
      case 'mundane-gear':
        shouldShow = itemType === 'gear' && 
                   (itemHTML.includes('color:#ffffff') || // mundane gear is white
                    (!itemHTML.includes('color:#4850b8') && !itemHTML.includes('color:#ffff00'))); // not blue or yellow
        break;
      case 'enchanted-armor':
        shouldShow = itemType === 'gear' && 
                   itemHTML.includes('color:#4850b8') && // enchanted gear is blue
                   (itemHTML.includes('armor') || itemHTML.includes('helm') || itemHTML.includes('shield') ||
                    itemHTML.includes('gauntlet') || itemHTML.includes('boot') || itemHTML.includes('cloak') ||
                    itemHTML.includes('robe') || itemHTML.includes('vest') || itemHTML.includes('bracers'));
        break;
      case 'enchanted-weapons':
        shouldShow = itemType === 'gear' && 
                   itemHTML.includes('color:#4850b8') && // enchanted gear is blue
                   !itemHTML.includes('color:#ffff00') && // not rare
                   (itemHTML.includes('sword') || itemHTML.includes('axe') || itemHTML.includes('bow') ||
                    itemHTML.includes('staff') || itemHTML.includes('dagger') || itemHTML.includes('mace') ||
                    itemHTML.includes('spear') || itemHTML.includes('hammer') || itemHTML.includes('club') ||
                    itemHTML.includes('crossbow') || itemHTML.includes('javelin') || itemHTML.includes('scimitar') ||
                    itemHTML.includes('rapier') || itemHTML.includes('flail') || itemHTML.includes('halberd') ||
                    itemHTML.includes('glaive') || itemHTML.includes('pike') || itemHTML.includes('trident') ||
                    itemHTML.includes('whip') || itemHTML.includes('sling') || itemHTML.includes('dart'));
        break;
      case 'rare-gear':
        shouldShow = itemType === 'gear' && itemHTML.includes('color:#ffff00'); // rare gear is yellow
        break;
      case 'magic-gear':
        shouldShow = itemType === 'gear' && 
                    (!itemHTML.includes('color:#ffffff') || // mundane gear is white
                    (itemHTML.includes('color:#4850b8') || itemHTML.includes('color:#ffff00'))); //  blue or yellow
        break;
      case 'all-gear-types':
        shouldShow = itemType === 'gear'
        break;        
      default:
        shouldShow = true;
    }
    
    item.style.display = shouldShow ? 'block' : 'none';
  });
}

// Function to clear individual loot item
function clearLootItem(index) {
  // Store the current filter value
  const currentFilter = document.getElementById('loot-filter')?.value || 'all';
  
  // Remove from the results array
  allLootResults.splice(index, 1);
  
  // Re-display results with updated indices
  displayLootResults();
  
  // Restore the filter selection and apply it
  const filterDropdown = document.getElementById('loot-filter');
  if (filterDropdown) {
    filterDropdown.value = currentFilter;
    sortLootResults(currentFilter);
  }
}

// Add this to your existing event listeners
document.getElementById("rollBtn").addEventListener("click", runLoot);

// Function to clear all loot items
function clearAllLoot() {
  // Clear the results array
  allLootResults = [];
  
  // Clear the results container
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = '<div class="text-gray-400">No results to display</div>';
}

function pickFromTable(table, roll) {
			return table.find(item => roll >= item.min && roll <= item.max) || null;
		}

		function rollInAllowedRanges(allowed) {
			let attempts = 0;
			while (attempts++ < 500) {
				const affixRange = rollDice(1, 2000);
				for (const rng of allowed) {
					if (affixRange >= rng.min && affixRange <= rng.max) return affixRange;
				}
			}
			return null;
		}

		function rollDice(num, sides) {
			let total = 0;
			for (let i = 0; i < num; i++) total += Math.floor(Math.random() * sides) + 1;
			return total;
		}

		function getTier(lootLevel) {
			if (lootLevel < 9) return 1;
			if (lootLevel < 17) return 2;
			if (lootLevel < 25) return 3;
			return 4;
		}

// Tab switching functionality
		function showTab(tabName) {
			// Hide all content
			document.querySelectorAll('.tab-content').forEach(content => {
				content.classList.add('hidden');
			});
			
			// Reset all tab buttons
			document.querySelectorAll('.tab-btn').forEach(btn => {
				btn.classList.remove('border-blue-500', 'text-blue-400');
				btn.classList.add('border-transparent', 'text-gray-400');
			});
			
			// Show selected content
			document.getElementById(`content-${tabName}`).classList.remove('hidden');
			
			// Activate selected tab
			const activeTab = document.getElementById(`tab-${tabName}`);
			activeTab.classList.remove('border-transparent', 'text-gray-400');
			activeTab.classList.add('border-blue-500', 'text-blue-400');
		}

		// Populate table functions
		function populateTable(tableData, bodyId, hasMultiplier = false) {
			const tbody = document.getElementById(bodyId);
			tbody.innerHTML = '';
			
			tableData.forEach(item => {
				const row = document.createElement('tr');
				row.className = 'border-b border-gray-700 hover:bg-gray-700';
				
				let html = `
					<td class="p-2">${item.min}-${item.max}</td>
					<td class="p-2 font-semibold">${item.name}</td>
				`;
				
				if (hasMultiplier) {
					html += `
						<td class="p-2 text-sm">${item.benefit}</td>
						<td class="p-2">${item.multiplier}x</td>
					`;
				} else {
					html += `<td class="p-2">${item.value} gp</td>`;
				}
				
				row.innerHTML = html;
				tbody.appendChild(row);
			});
		}

		// Potion and Armor sorting variables
		let potionSortState = {};
		let armorSortState = {};

		function sortPotions(column) {
			// Toggle sort direction for this column
			if (!potionSortState[column]) {
				potionSortState[column] = 'asc';
			} else if (potionSortState[column] === 'asc') {
				potionSortState[column] = 'desc';
			} else {
				potionSortState[column] = 'asc';
			}

			// Reset visual indicators for all columns
			['name', 'healingSurge', 'spellPoints', 'featureRestore', 'actionEcon', 'value'].forEach(col => {
				const indicator = document.getElementById(`sort-potion-${col}`);
				if (col === column) {
					indicator.innerHTML = potionSortState[column] === 'asc' ? '▲' : '▼';
					indicator.classList.remove('opacity-50');
				} else {
					indicator.innerHTML = '▼▲';
					indicator.classList.add('opacity-50');
				}
			});

			// Create a copy and sort
			const sortedPotions = [...potionTable].sort((a, b) => {
				let aVal = a[column];
				let bVal = b[column];

				// Special handling for numerical values
				if (column === 'value' || column === 'healingSurge') {
					if (aVal === 'Full') aVal = 999;
					if (bVal === 'Full') aVal = 999;
					if (aVal === '-') aVal = -1;
					if (bVal === '-') bVal = -1;
					aVal = parseInt(aVal) || 0;
					bVal = parseInt(bVal) || 0;
				} else {
					aVal = aVal.toString().toLowerCase();
					bVal = bVal.toString().toLowerCase();
				}

				if (aVal < bVal) return potionSortState[column] === 'asc' ? -1 : 1;
				if (aVal > bVal) return potionSortState[column] === 'asc' ? 1 : -1;
				return 0;
			});

			populatePotionTableWithData(sortedPotions);
		}

		function sortArmor(column) {
			// Toggle sort direction for this column
			if (!armorSortState[column]) {
				armorSortState[column] = 'asc';
			} else if (armorSortState[column] === 'asc') {
				armorSortState[column] = 'desc';
			} else {
				armorSortState[column] = 'asc';
			}

			// Reset visual indicators for all columns
			['name', 'class', 'armorClass', 'proficiency', 'strReq', 'dexReq', 'dexMax', 'masteryBonus', 'value'].forEach(col => {
				const indicator = document.getElementById(`sort-armor-${col}`);
				if (col === column) {
					indicator.innerHTML = armorSortState[column] === 'asc' ? '▲' : '▼';
					indicator.classList.remove('opacity-50');
				} else {
					indicator.innerHTML = '▼▲';
					indicator.classList.add('opacity-50');
				}
			});

			// Create a copy and sort
			const sortedArmor = [...armorTable].sort((a, b) => {
				let aVal = a[column];
				let bVal = b[column];

				// Special handling for numerical values and AC
				if (column === 'value' || column === 'strReq' || column === 'dexReq' || column === 'dexMax') {
					if (aVal === '-' && bVal !== '-') return armorSortState[column] === 'asc' ? 1 : -1;
					if (bVal === '-' && aVal !== '-') return armorSortState[column] === 'asc' ? -1 : 1;
					if (aVal === '-' && bVal === '-') return 0;
					aVal = parseInt(aVal) || 0;
					bVal = parseInt(bVal) || 0;
				} else if (column === 'armorClass') {
					// Handle AC like "+2", "18", "-"
					if (aVal === '-' && bVal !== '-') return armorSortState[column] === 'asc' ? 1 : -1;
					if (bVal === '-' && aVal !== '-') return armorSortState[column] === 'asc' ? -1 : 1;
					if (aVal === '-' && bVal === '-') return 0;
					aVal = parseInt(aVal.replace('+', '')) || 0;
					bVal = parseInt(bVal.replace('+', '')) || 0;
				} else {
					aVal = aVal.toString().toLowerCase();
					bVal = bVal.toString().toLowerCase();
				}

				if (aVal < bVal) return armorSortState[column] === 'asc' ? -1 : 1;
				if (aVal > bVal) return armorSortState[column] === 'asc' ? 1 : -1;
				return 0;
			});

			populateArmorTableWithData(sortedArmor);
		}

		function populatePotionTable() {
			populatePotionTableWithData(potionTable);
		}

		function populatePotionTableWithData(potions) {
			const tbody = document.getElementById('potions-table-body');
			tbody.innerHTML = '';
			
			potions.forEach(potion => {
				const row = document.createElement('tr');
				row.className = 'border-b border-gray-700 hover:bg-gray-700';
				
				row.innerHTML = `
					<td class="p-2 font-semibold">${potion.name}</td>
					<td class="p-2">${potion.healingSurge}</td>
					<td class="p-2">${potion.spellPoints}</td>
					<td class="p-2">${potion.featureRestore}</td>
					<td class="p-2">${potion.actionEcon}</td>
					<td class="p-2">${potion.value} gp</td>
				`;
				
				tbody.appendChild(row);
			});
		}

		function populateArmorTable() {
			populateArmorTableWithData(armorTable);
		}

		function populateArmorTableWithData(armors) {
			const tbody = document.getElementById('armor-table-body');
			tbody.innerHTML = '';
			
			armors.forEach(armor => {
				const row = document.createElement('tr');
				row.className = 'border-b border-gray-700 hover:bg-gray-700';
				
				row.innerHTML = `
					<td class="p-2 font-semibold">${armor.name}</td>
					<td class="p-2">${armor.class}</td>
					<td class="p-2">${armor.armorClass}</td>
					<td class="p-2">${armor.proficiency}</td>
					<td class="p-2">${armor.strReq}</td>
					<td class="p-2">${armor.dexReq}</td>
					<td class="p-2">${armor.dexMax}</td>
					<td class="p-2">${armor.masteryBonus}</td>
					<td class="p-2">${armor.value} gp</td>
				`;
				
				tbody.appendChild(row);
			});
		}

		// Updated populate table function for affixes (no range/multiplier)
		function populateAffixTable(tableData, bodyId) {
			const tbody = document.getElementById(bodyId);
			tbody.innerHTML = '';
			
			tableData.forEach(item => {
				const row = document.createElement('tr');
				row.className = 'border-b border-gray-700 hover:bg-gray-700';
				
				row.innerHTML = `
					<td class="p-2 font-semibold">${item.name}</td>
					<td class="p-2 text-sm">${item.benefit}</td>
				`;
				
				tbody.appendChild(row);
			});
		}
        let weaponSortState = {};
		function sortWeapons(column) {
			// Toggle sort direction for this column (default to ascending first)
			if (!weaponSortState[column]) {
				weaponSortState[column] = 'asc';
			} else if (weaponSortState[column] === 'asc') {
				weaponSortState[column] = 'desc';
			} else {
				weaponSortState[column] = 'asc';
			}

			// Reset visual indicators for all columns
			['name', 'class', 'damage', 'proficiency', 'strReq', 'dexReq', 'weaponProperties', 'masteryBonus', 'value'].forEach(col => {
				const indicator = document.getElementById(`sort-${col}`);
				if (col === column) {
					indicator.innerHTML = weaponSortState[column] === 'asc' ? '▲' : '▼';
					indicator.classList.remove('opacity-50');
				} else {
					indicator.innerHTML = '▼▲';
					indicator.classList.add('opacity-50');
				}
			});

			// Create a copy of the weapon table and sort it
			const sortedWeapons = [...weaponTable].sort((a, b) => {
				let aVal = a[column];
				let bVal = b[column];

				// Special handling for numerical values
				if (column === 'value') {
					aVal = parseInt(aVal);
					bVal = parseInt(bVal);
				}
				// Handle requirements that might be "-" or numbers
				else if (column === 'strReq' || column === 'dexReq') {
					// Put "-" values at the end for ascending, beginning for descending
					if (aVal === '-' && bVal !== '-') return weaponSortState[column] === 'asc' ? 1 : -1;
					if (bVal === '-' && aVal !== '-') return weaponSortState[column] === 'asc' ? -1 : 1;
					if (aVal === '-' && bVal === '-') return 0;
					aVal = parseInt(aVal);
					bVal = parseInt(bVal);
				}
				// String comparison for other fields
				else {
					aVal = aVal.toString().toLowerCase();
					bVal = bVal.toString().toLowerCase();
				}

				if (aVal < bVal) return weaponSortState[column] === 'asc' ? -1 : 1;
				if (aVal > bVal) return weaponSortState[column] === 'asc' ? 1 : -1;
				return 0;
			});

			// Re-populate the table with sorted data
			populateWeaponTableWithData(sortedWeapons);
		}

		function populateWeaponTable() {
			populateWeaponTableWithData(weaponTable);
		}

		function populateWeaponTableWithData(weapons) {
			const tbody = document.getElementById('weapons-table-body');
			tbody.innerHTML = '';
			
			weapons.forEach(weapon => {
				const row = document.createElement('tr');
				row.className = 'border-b border-gray-700 hover:bg-gray-700';
				
				row.innerHTML = `
					<td class="p-2 font-semibold">${weapon.name}</td>
					<td class="p-2">${weapon.class}</td>
					<td class="p-2">${weapon.damage}</td>
					<td class="p-2">${weapon.proficiency}</td>
					<td class="p-2">${weapon.strReq}</td>
					<td class="p-2">${weapon.dexReq}</td>
					<td class="p-2 text-xs">${weapon.weaponProperties}</td>
					<td class="p-2">${weapon.masteryBonus}</td>
					<td class="p-2">${weapon.value} gp</td>
				`;
				
				tbody.appendChild(row);
			});
		}

		function populateSpellTables() {
			const container = document.getElementById('spell-tables-container');
			container.innerHTML = '';
			
			Object.entries(spellTables).forEach(([level, spells]) => {
				const div = document.createElement('div');
				div.className = 'mb-6';
				
				// Split spells into columns of 10
				const columns = [];
				for (let i = 0; i < spells.length; i += 10) {
					columns.push(spells.slice(i, i + 10));
				}
				
				let columnsHtml = '';
				columns.forEach(columnSpells => {
					columnsHtml += `
						<div class="flex-1 min-w-0 mr-4">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b border-gray-600">
										<th class="text-left p-2">Spell Name</th>
										<th class="text-left p-2">Value</th>
									</tr>
								</thead>
								<tbody>
									${columnSpells.map(spell => `
										<tr class="border-b border-gray-700 hover:bg-gray-700">
											<td class="p-2 font-semibold">${spell.name}</td>
											<td class="p-2">${spell.value} gp</td>
										</tr>
									`).join('')}
								</tbody>
							</table>
						</div>
					`;
				});
				
				div.innerHTML = `
					<h3 class="text-xl font-semibold mb-3 text-cyan-300">${level.charAt(0).toUpperCase() + level.slice(1)} Spells</h3>
					<div class="flex flex-wrap gap-4">
						${columnsHtml}
					</div>
				`;
				container.appendChild(div);
			});
		}

		// Initialize tabs and populate tables
		document.addEventListener('DOMContentLoaded', function() {
			// Add tab click listeners
			document.querySelectorAll('.tab-btn').forEach(btn => {
				btn.addEventListener('click', () => {
					const tabName = btn.id.replace('tab-', '');
					showTab(tabName);
				});
			});

			// Populate all tables
	populatePotionTable();
	populateWeaponTable();
	populateArmorTable();
	populateAffixTable(prefixTable, 'prefixes-table-body');
	populateAffixTable(suffixTable, 'suffixes-table-body');
	populateAffixTable(prefixCurseTable, 'curse-prefixes-table-body');
	populateAffixTable(suffixCurseTable, 'curse-suffixes-table-body');
	populateSpellTables();

			// Show default tab
			showTab('loot');
		});

document.getElementById("rollBtn").addEventListener("click", runLoot);
window.sortLootResults = sortLootResults;
window.clearLootItem = clearLootItem;
window.clearAllLoot = clearAllLoot;

// ---------- Tables ----------
const rareTitleWords1 = [
		"Beast", "Eagle", "Raven", "Viper", "Ghoul", "Skull", "Blood", "Dread", "Doom", "Cruel", "Brimstone",
		"Grim", "Bone", "Death", "Shadow", "Storm", "Rune", "Plague", "Stone", "Wraith", "Spirit", "Demon",
		"Empyrian", "Bramble", "Pain", "Loath", "Glyph", "Imp", "Fiend", "Hailstone", "Gale", "Dire", "Soul",
		"Corpse", "Carrion", "Armageddon", "Havoc", "Bitter", "Entropy", "Chaos", "Order", "Rule","Corruption",
	];
const rareTitleWords2 = [
		"Wand", "Barb", "Dart", "Quarrel", "Flight", "Horn", "Quill", "Branch", "Song", "Cry", "Chant", "Gnarl", "Crest", "Veil", "Impaler",
		"Blow", "Bane", "Breaker", "Crack", "Knell", "Spike", "Skewer", "Scourge", "Wrack", "Needle", "Bolt", "Fletch", "Nock", "Stinger",
		"Mask", "Casque", "Cowl", "Pelt", "Coat", "Suit", "Shroud", "Mantle", "Badge", "Aegis", "Tower", "Wing", "Chain", "Lash", "Guard",
		"Rock", "Ward", "Shield", "Mark", "Hand", "Claw", "Grip", "Hold", "Finger", "Shank", "Tread", "Greave", "Nails", "Brogues", "Jack",
		"Slippers", "Buckle", "Lock", "Winding", "Strap", "Cord", "Circle", "Eye", "Spiral", "Gyre", "Whorl", "Lance", "Mallet","Gnash",
		"Emblem", "Fist", "Clutches", "Grasp", "Touch", "Knuckle", "Spur", "Stalker", "Blazer", "Trample", "Track", "Clasp", "Harness",
		"Scalpel", "Gutter", "Razor", "Edge", "Splitter", "Sever", "Rend", "Slayer", "Spawn", "Star", "Smasher", "Crusher", "Grinder",
		"Goad", "Spire", "Call", "Spell", "Weaver", "Visage", "Circlet", "Hood", "Brow", "Visor", "Hide", "Carapace", "Wrap", "Cloak",
		"Heart", "Necklace", "Beads", "Gorget", "Wood", "Bludgeon", "Loom", "Master", "Hew", "Mar", "Stake", "Pale", "Prod", "Fringe", 
		"Knot", "Loop", "Turn", "Coil", "Band", "Talisman", "Noose", "Collar", "Torc", "Scarab", "Brand", "Cudgel", "Harp", "Barri",
		"Crook", "Shell", "Picket", "Flange", "Scratch", "Fang", "Thirst", "Scythe", "Saw", "Cleaver", "Sunder", "Mangler", "Reaver", 
	];
const potionTable = [
{min:1, max:10, name:"Small Healing Potion", healingSurge:"1", spellPoints:"-", featureRestore:"-", actionEcon:"Bonus Action", value:25}, 
{min:11, max:20, name:"Small Mana Potion", healingSurge:"-", spellPoints:"2d4+2", featureRestore:"2 Short Rest uses", actionEcon:"Bonus Action", value:40}, 
{min:21, max:24, name:"Small Rejuvination Potion", healingSurge:"1", spellPoints:"1d4+1", featureRestore:"1 Short Rest uses", actionEcon:"Action", value:100}, 
{min:25, max:39, name:"Large Healing Potion", healingSurge:"3", spellPoints:"-", featureRestore:"-", actionEcon:"Bonus Action", value:350}, 
{min:40, max:54, name:"Large Mana Potion", healingSurge:"-", spellPoints:"4d4+4", featureRestore:"4 Short Rest uses", actionEcon:"Bonus Action", value:560}, 
{min:55, max:58, name:"Large Rejuvination Potion", healingSurge:"2", spellPoints:"2d4+2", featureRestore:"2 Short Rest uses", actionEcon:"Action", value:980}, 
{min:59, max:60, name:"Full Rejuvination Potion", healingSurge:"All", spellPoints:"All", featureRestore:"All", actionEcon:"Action", value:1200}, 
	];
const spellTables = {
	cantrip: [
{name: "Acid Splash (C)", value: 10},
{name: "Blade Ward (C)", value: 10},
{name: "Booming Blade (C)", value: 10},
{name: "Chill Touch (C)", value: 10},
{name: "Eldritch Blast (C)", value: 10},
{name: "Fire Bolt (C)", value: 10},
{name: "Frostbite (C)", value: 10},
{name: "Green-Flame Blade (C)", value: 10},
{name: "Guidance (C)", value: 10},
{name: "Gust (C)", value: 10},
{name: "Infestation (C)", value: 10},
{name: "Lightning Lure (C)", value: 10},
{name: "Mage Hand (C)", value: 10},
{name: "Magic Stone (C)", value: 10},
{name: "Mind Sliver (C)", value: 10},
{name: "Poison Spray (C)", value: 10},
{name: "Primal Savagery (C)", value: 10},
{name: "Produce Flame (C)", value: 10},
{name: "Ray of Frost (C)", value: 10},
{name: "Sacred Flame (C)", value: 10},
{name: "Shillelagh (C)", value: 10},
{name: "Shocking Grasp (C)", value: 10},
{name: "Spare the Dying (C)", value: 10},
{name: "Sword Burst (C)", value: 10},
{name: "Thorn Whip (C)", value: 10},
{name: "Thunderclap (C)", value: 10},
{name: "Toll the Dead (C)", value: 10},
{name: "True Strike (C)", value: 10},
{name: "Vicious Mockery (C)", value: 10},
{name: "Word of Radiance (C)", value: 10}
  ],
  level1: [
{name: "Armor of Agathys (1)", value: 60},
{name: "Arms of Hadar (1)", value: 60},
{name: "Bane (1)", value: 60},
{name: "Bless (1)", value: 60},
{name: "Burning Hands (1)", value: 60},
{name: "Catapult (1)", value: 60},
{name: "Chaos Bolt (1)", value: 60},
{name: "Chromatic Orb (1)", value: 60},
{name: "Compelled Duel (1)", value: 60},
{name: "Cure Wounds (1)", value: 60},
{name: "Detect Magic (1)", value: 60},
{name: "Detect Poison and Disease (1)", value: 60},
{name: "Dissonant Whispers (1)", value: 60},
{name: "Divine Favor (1)", value: 60},
{name: "Earth Tremor (1)", value: 60},
{name: "Ensnaring Strike (1)", value: 60},
{name: "Entangle (1)", value: 60},
{name: "Expeditious Retreat (1)", value: 60},
{name: "Faerie Fire (1)", value: 60},
{name: "False Life (1)", value: 60},
{name: "Find Familiar (1)", value: 60},
{name: "Fog Cloud (1)", value: 60},
{name: "Frost Fingers (1)", value: 60},
{name: "Gift of Alacrity (1)", value: 60},
{name: "Goodberry (1)", value: 60},
{name: "Grease (1)", value: 60},
{name: "Guiding Bolt (1)", value: 60},
{name: "Hail of Thorns (1)", value: 60},
{name: "Healing Word (1)", value: 60},
{name: "Hellish Rebuke (1)", value: 60},
{name: "Heroism (1)", value: 60},
{name: "Hex (1)", value: 60},
{name: "Hunter's Mark (1)", value: 60},
{name: "Ice Knife (1)", value: 60},
{name: "Inflict Wounds (1)", value: 60},
{name: "Mage Armor (1)", value: 60},
{name: "Magic Missile (1)", value: 60},
{name: "Protection from Evil and Good (1)", value: 60},
{name: "Ray of Sickness (1)", value: 60},
{name: "Sanctuary (1)", value: 60},
{name: "Searing Smite (1)", value: 60},
{name: "Shield (1)", value: 60},
{name: "Shield of Faith (1)", value: 60},
{name: "Sleep (1)", value: 60},
{name: "Tasha's Caustic Brew (1)", value: 60},
{name: "Tasha's Hideous Laughter (1)", value: 60},
{name: "Thunderous Smite (1)", value: 60},
{name: "Thunderwave (1)", value: 60},
{name: "Wrathful Smite (1)", value: 60},
{name: "Zephyr Strike (1)", value: 60}
  ],
  level2: [
{name: "Aganazzar's Scorcher (2)", value: 120},
{name: "Aid (2)", value: 120},
{name: "Barkskin (2)", value: 120},
{name: "Blindness/Deafness (2)", value: 120},
{name: "Blur (2)", value: 120},
{name: "Branding Smite (2)", value: 120},
{name: "Calm Emotions (2)", value: 120},
{name: "Cloud of Daggers (2)", value: 120},
{name: "Cordon of Arrows (2)", value: 120},
{name: "Crown of Madness (2)", value: 120},
{name: "Darkness (2)", value: 120},
{name: "Darkvision (2)", value: 120},
{name: "Dragon's Breath (2)", value: 120},
{name: "Enlarge/Reduce (2)", value: 120},
{name: "Flame Blade (2)", value: 120},
{name: "Flaming Sphere (2)", value: 120},
{name: "Healing Spirit (2)", value: 120},
{name: "Heat Metal (2)", value: 120},
{name: "Hold Person (2)", value: 120},
{name: "Invisibility (2)", value: 120},
{name: "Kinetic Jaunt (2)", value: 120},
{name: "Lesser Restoration (2)", value: 120},
{name: "Magic Weapon (2)", value: 120},
{name: "Melf's Acid Arrow (2)", value: 120},
{name: "Mind Spike (2)", value: 120},
{name: "Mirror Image (2)", value: 120},
{name: "Misty Step (2)", value: 120},
{name: "Phantasmal Force (2)", value: 120},
{name: "Prayer of Healing (2)", value: 120},
{name: "Pyrotechnics (2)", value: 120},
{name: "Ray of Enfeeblement (2)", value: 120},
{name: "Scorching Ray (2)", value: 120},
{name: "Shadow Blade (2)", value: 120},
{name: "Shatter (2)", value: 120},
{name: "Silence (2)", value: 120},
{name: "Spike Growth (2)", value: 120},
{name: "Spiritual Weapon (2)", value: 120},
{name: "Tasha's Mind Whip (2)", value: 120},
{name: "Web (2)", value: 120},
{name: "Wither and Bloom (2)", value: 120}
  ],
  level3: [
{name: "Animate Dead (3)", value: 200},
{name: "Aura of Vitality (3)", value: 200},
{name: "Beacon of Hope (3)", value: 200},
{name: "Blinding Smite (3)", value: 200},
{name: "Blink (3)", value: 200},
{name: "Conjure Barrage (3)", value: 200},
{name: "Counterspell (3)", value: 200},
{name: "Crusader's Mantle (3)", value: 200},
{name: "Daylight (3)", value: 200},
{name: "Dispel Magic (3)", value: 200},
{name: "Elemental Weapon (3)", value: 200},
{name: "Erupting Earth (3)", value: 200},
{name: "Fear (3)", value: 200},
{name: "Fireball (3)", value: 200},
{name: "Flame Arrows (3)", value: 200},
{name: "Fly (3)", value: 200},
{name: "Glyph of Warding (3)", value: 200},
{name: "Haste (3)", value: 200},
{name: "Hunger Of Hadar (3)", value: 200},
{name: "Hypnotic Pattern (3)", value: 200},
{name: "Intellect Fortress (3)", value: 200},
{name: "Life Transference (3)", value: 200},
{name: "Lightning Arrow (3)", value: 200},
{name: "Lightning Bolt (3)", value: 200},
{name: "Major Image (3)", value: 200},
{name: "Mass Healing Word (3)", value: 200},
{name: "Meld into Stone (3)", value: 200},
{name: "Melf's Minute Meteors (3)", value: 200},
{name: "Pulse Wave (3)", value: 200},
{name: "Remove Curse (3)", value: 200},
{name: "Revivify (3)", value: 200},
{name: "Slow (3)", value: 200},
{name: "Spirit Guardians (3)", value: 200},
{name: "Summon Lesser Demons (3)", value: 200},
{name: "Summon Shadowspawn (3)", value: 200},
{name: "Summon Undead (3)", value: 200},
{name: "Thunder Step (3)", value: 200},
{name: "Vampiric Touch (3)", value: 200},
{name: "Wall of Water (3)", value: 200},
{name: "Wind Wall (3)", value: 200}
  ],
  level4: [
{name: "Aura of Life (4)", value: 320},
{name: "Aura of Purity (4)", value: 320},
{name: "Banishment (4)", value: 320},
{name: "Blight (4)", value: 320},
{name: "Confusion (4)", value: 320},
{name: "Conjure Minor Elementals (4)", value: 320},
{name: "Death Ward (4)", value: 320},
{name: "Dimension Door (4)", value: 320},
{name: "Dominate Beast (4)", value: 320},
{name: "Evard's Black Tentacles (4)", value: 320},
{name: "Fire Shield (4)", value: 320},
{name: "Grasping Vine (4)", value: 320},
{name: "Gravity Sinkhole (4)", value: 320},
{name: "Greater Invisibility (4)", value: 320},
{name: "Guardian of Faith (4)", value: 320},
{name: "Guardian of Nature (4)", value: 320},
{name: "Otiluke's Resilient Sphere (4)", value: 320},
{name: "Phantasmal Killer (4)", value: 320},
{name: "Polymorph (4)", value: 320},
{name: "Raulothim's Psychic Lance (4)", value: 320},
{name: "Shadow Of Moil (4)", value: 320},
{name: "Staggering Smite (4)", value: 320},
{name: "Stone Shape (4)", value: 320},
{name: "Stoneskin (4)", value: 320},
{name: "Storm Sphere (4)", value: 320},
{name: "Summon Aberration (4)", value: 320},
{name: "Summon Construct (4)", value: 320},
{name: "Summon Elemental (4)", value: 320},
{name: "Summon Greater Demon (4)", value: 320},
{name: "Wall of Fire (4)", value: 320}
  ],
  level5: [
{name: "Animate Objects (5)", value: 640},
{name: "Banishing Smite (5)", value: 640},
{name: "Bigby's Hand (5)", value: 640},
{name: "Circle of Power (5)", value: 640},
{name: "Cloudkill (5)", value: 640},
{name: "Cone of Cold (5)", value: 640},
{name: "Conjure Elemental (5)", value: 640},
{name: "Conjure Volley (5)", value: 640},
{name: "Contagion (5)", value: 640},
{name: "Danse Macabre (5)", value: 640},
{name: "Dawn (5)", value: 640},
{name: "Destructive Wave (5)", value: 640},
{name: "Dispel Evil and Good (5)", value: 640},
{name: "Far Step (5)", value: 640},
{name: "Flame Strike (5)", value: 640},
{name: "Hold Monster (5)", value: 640},
{name: "Holy Weapon (5)", value: 640},
{name: "Immolation (5)", value: 640},
{name: "Insect Plague (5)", value: 640},
{name: "Negative Energy Flood (5)", value: 640},
{name: "Passwall (5)", value: 640},
{name: "Steel Wind Strike (5)", value: 640},
{name: "Summon Celestial (5)", value: 640},
{name: "Swift Quiver (5)", value: 640},
{name: "Synaptic Static (5)", value: 640},
{name: "Telekinesis (5)", value: 640},
{name: "Temporal Shunt (5)", value: 640},
{name: "Wall of Force (5)", value: 640},
{name: "Wall of Light (5)", value: 640},
{name: "Wall of Stone (5)", value: 640}
  ],
  level6: [
{name: "Blade Barrier (6)", value: 1280},
{name: "Bones of the Earth (6)", value: 1280},
{name: "Chain Lightning (6)", value: 1280},
{name: "Circle of Death (6)", value: 1280},
{name: "Disintegrate (6)", value: 1280},
{name: "Gravity Fissure (6)", value: 1280},
{name: "Harm (6)", value: 1280},
{name: "Heal (6)", value: 1280},
{name: "Investiture of Flame (6)", value: 1280},
{name: "Investiture of Ice (6)", value: 1280},
{name: "Investiture of Stone (6)", value: 1280},
{name: "Mental Prison (6)", value: 1280},
{name: "Scatter (6)", value: 1280},
{name: "Soul Cage (6)", value: 1280},
{name: "Summon Fiend (6)", value: 1280},
{name: "Sunbeam (6)", value: 1280},
{name: "Tasha's Otherworldly Guise (6)", value: 1280},
{name: "True Seeing (6)", value: 1280},
{name: "Wall of Ice (6)", value: 1280},
{name: "Wall of Thorns (6)", value: 1280}
  ],
  level7: [
{name: "Crown of Stars (7)", value: 2560},
{name: "Finger of Death (7)", value: 2560},
{name: "Fire Storm (7)", value: 2560},
{name: "Forcecage (7)", value: 2560},
{name: "Mordenkainen's Sword (7)", value: 2560},
{name: "Power Word: Pain (7)", value: 2560},
{name: "Prismatic Spray (7)", value: 2560},
{name: "Regenerate (7)", value: 2560},
{name: "Reverse Gravity (7)", value: 2560},
{name: "Whirlwind (7)", value: 2560}
  ],
  level8: [
{name: "Abi-Dalzim's Horrid Wilting (8)", value: 5120},
{name: "Animal Shapes (8)", value: 5120},
{name: "Antipathy/Sympathy (8)", value: 5120},
{name: "Dark Star (8)", value: 5120},
{name: "Dominate Monster (8)", value: 5120},
{name: "Earthquake (8)", value: 5120},
{name: "Holy Aura (8)", value: 5120},
{name: "Mind Blank (8)", value: 5120},
{name: "Power Word: Stun (8)", value: 5120},
{name: "Sunburst (8)", value: 5120}
  ],
  level9: [
{name: "Blade of Disaster (9)", value: 10000},
{name: "Foresight (9)", value: 10000},
{name: "Invulnerability (9)", value: 10000},
{name: "Mass Heal (9)", value: 10000},
{name: "Meteor Swarm (9)", value: 10000},
{name: "Prismatic Wall (9)", value: 10000},
{name: "Psychic Scream (9)", value: 10000},
{name: "Ravenous Void (9)", value: 10000},
{name: "Time Stop (9)", value: 10000},
{name: "Wish (9)", value: 10000}
]
}
const weaponTable = [
{min:1, max:4, name:"Club", class:"Club", damage:"1d4 Bludgeoning", proficiency:"Simple Melee", strReq:"-", dexReq:"-", weaponProperties:"Light", masteryBonus:"-", value:2}, 
{min:5, max:9, name:"Dagger", class:"Dagger", damage:"1d4 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"11", weaponProperties:"Finesse, Light, Range (20/60)", masteryBonus:"Wide Critical", value:5}, 
{min:10, max:13, name:"Greatclub", class:"Greatclub", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"13", dexReq:"-", weaponProperties:"Two-handed", masteryBonus:"-", value:5}, 
{min:14, max:17, name:"Handaxe", class:"Handaxe", damage:"1d6 Slashing", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"Light, Range (20/60)", masteryBonus:"-", value:8}, 
{min:18, max:21, name:"Javelin", class:"Javelin", damage:"1d6 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"11", weaponProperties:"Range (30/120)", masteryBonus:"-", value:5}, 
{min:22, max:25, name:"Light Hammer", class:"Light Hammer", damage:"1d4 Bludgeoning", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"Light, Range (20/60)", masteryBonus:"-", value:6}, 
{min:26, max:30, name:"Mace", class:"Mace", damage:"1d6 Bludgeoning", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"-", masteryBonus:"-", value:10}, 
{min:31, max:34, name:"Metal Knuckles", class:"Metal Knuckles", damage:"1d4 Bludgeoning", proficiency:"Simple Melee", strReq:"-", dexReq:"-", weaponProperties:"-", masteryBonus:"-", value:8}, 
{min:35, max:38, name:"Quarterstaff", class:"Quarterstaff", damage:"1d6 Bludgeoning", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"Versatile (1d8)", masteryBonus:"Hinder", value:4}, 
{min:39, max:42, name:"Sickle", class:"Sickle", damage:"1d4 Slashing", proficiency:"Simple Melee", strReq:"-", dexReq:"11", weaponProperties:"Light", masteryBonus:"Bleed", value:6}, 
{min:43, max:46, name:"Spear", class:"Spear", damage:"1d6 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"11", weaponProperties:"Range (20/60), Versatile (1d8)", masteryBonus:"-", value:6}, 
{min:47, max:50, name:"Light Crossbow", class:"Light Crossbow", damage:"1d4 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"11", weaponProperties:"Thrown (20/60)", masteryBonus:"Debilitate", value:25}, 
{min:51, max:54, name:"Dart", class:"Dart", damage:"1d4 Piercing", proficiency:"Simple Ranged", strReq:"9", dexReq:"15", weaponProperties:"Loading, Two-handed, Range (80/320)", masteryBonus:"Aim", value:2}, 
{min:55, max:59, name:"Shortbow", class:"Shortbow", damage:"1d8 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"13", weaponProperties:"Range, Two-handed, (80/320)", masteryBonus:"-", value:35}, 
{min:60, max:63, name:"Sling", class:"Sling", damage:"1d6 Bludgeoning", proficiency:"Simple Ranged", strReq:"-", dexReq:"11", weaponProperties:"Range (30/120)", masteryBonus:"-", value:200}, 
{min:64, max:72, name:"Battleaxe", class:"Battleaxe", damage:"1d8 Slashing", proficiency:"Martial Melee", strReq:"15", dexReq:"-", weaponProperties:"Versatile (1d10)", masteryBonus:"Cleave", value:250}, 
{min:73, max:80, name:"Flail", class:"Flail", damage:"1d8 Bludgeoning", proficiency:"Martial Melee", strReq:"15", dexReq:"-", weaponProperties:"-", masteryBonus:"Brutal", value:300}, 
{min:81, max:88, name:"Glaive", class:"Glaive", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"17", dexReq:"11", weaponProperties:"Heavy, Two-handed, Reach", masteryBonus:"-", value:400}, 
{min:89, max:97, name:"Greataxe", class:"Greataxe", damage:"1d12 Slashing", proficiency:"Martial Melee", strReq:"17", dexReq:"-", weaponProperties:"Heavy, Two-handed,", masteryBonus:"Cleave", value:500}, 
{min:98, max:105, name:"Greatsword", class:"Greatsword", damage:"2d6 Slashing", proficiency:"Martial Melee", strReq:"15", dexReq:"13", weaponProperties:"Heavy, Two-handed", masteryBonus:"Debilitate", value:600}, 
{min:106, max:113, name:"Halberd", class:"Halberd", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"17", dexReq:"11", weaponProperties:"Heavy, Two-handed, Reach", masteryBonus:"-", value:400}, 
{min:114, max:121, name:"Lance", class:"Lance", damage:"1d12 Piercing", proficiency:"Martial Melee", strReq:"17", dexReq:"13", weaponProperties:"Reach", masteryBonus:"Skewer", value:350}, 
{min:122, max:130, name:"Longsword", class:"Longsword", damage:"1d8 Slashing", proficiency:"Martial Melee", strReq:"13", dexReq:"11", weaponProperties:"Versatile (1d10)", masteryBonus:"Debilitate", value:300}, 
{min:131, max:138, name:"Maul", class:"Maul", damage:"2d6 Bludgeoning", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"Heavy, Two-handed", masteryBonus:"Stagger", value:350}, 
{min:139, max:146, name:"Morningstar", class:"Morningstar", damage:"1d8 Bludgeoning", proficiency:"Martial Melee", strReq:"15", dexReq:"-", weaponProperties:"-", masteryBonus:"Bleed", value:325}, 
{min:147, max:154, name:"Pike", class:"Pike", damage:"1d10 Piercing", proficiency:"Martial Melee", strReq:"17", dexReq:"11", weaponProperties:"Heavy, Two-handed, Reach", masteryBonus:"-", value:225}, 
{min:155, max:162, name:"Rapier", class:"Rapier", damage:"1d8 Piercing", proficiency:"Martial Melee", strReq:"-", dexReq:"15", weaponProperties:"Finesse", masteryBonus:"-", value:400}, 
{min:163, max:170, name:"Scimitar", class:"Scimitar", damage:"1d6 Slashing", proficiency:"Martial Melee", strReq:"11", dexReq:"14", weaponProperties:"Finesse, Light,", masteryBonus:"Wide Critical", value:350}, 
{min:171, max:178, name:"Scythe", class:"Scythe", damage:"3d4 Slashing", proficiency:"Martial Melee", strReq:"15", dexReq:"15", weaponProperties:"Heavy, Two-handed", masteryBonus:"Cleave", value:450}, 
{min:179, max:187, name:"Shortsword", class:"Shortsword", damage:"1d6 Slashing", proficiency:"Martial Melee", strReq:"11", dexReq:"-", weaponProperties:"Finesse, Light", masteryBonus:"Bleed", value:300}, 
{min:188, max:195, name:"Trident", class:"Trident", damage:"1d6 Piercing", proficiency:"Martial Melee", strReq:"13", dexReq:"-", weaponProperties:"Range (20/60), Versatile (1d8)", masteryBonus:"Brutal", value:275}, 
{min:196, max:204, name:"Warhammer", class:"Warhammer", damage:"1d8 Bludgeoning", proficiency:"Martial Melee", strReq:"15", dexReq:"-", weaponProperties:"Versatile (1d10)", masteryBonus:"Stagger", value:350}, 
{min:205, max:212, name:"War pick", class:"War pick", damage:"1d8 Piercing", proficiency:"Martial Melee", strReq:"17", dexReq:"-", weaponProperties:"-", masteryBonus:"Sunder", value:250}, 
{min:213, max:220, name:"Whip", class:"Whip", damage:"1d4 Slashing", proficiency:"Martial Melee", strReq:"-", dexReq:"15", weaponProperties:"Finesse, Reach", masteryBonus:"Hinder", value:225}, 
{min:221, max:228, name:"Blowgun", class:"Blowgun", damage:"1d6 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"13", weaponProperties:"Loading, Two-handed, Range (25/100)", masteryBonus:"Aim", value:200}, 
{min:229, max:238, name:"Hand Crossbow", class:"Hand Crossbow", damage:"1d4 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"19", weaponProperties:"Light, Loading, Range (30/120)", masteryBonus:"Wide Critical", value:500}, 
{min:239, max:246, name:"Heavy Crossbow", class:"Heavy Crossbow", damage:"1d6 Piercing", proficiency:"Martial Ranged", strReq:"13", dexReq:"15", weaponProperties:"Heavy, Loading, Two-handed, Range (100/400)", masteryBonus:"Aim", value:600}, 
{min:247, max:256, name:"Longbow", class:"Longbow", damage:"1d4 Piercing", proficiency:"Martial Ranged", strReq:"11", dexReq:"17", weaponProperties:"Heavy, Two-handed, Range (150/600)", masteryBonus:"Stagger", value:750}, 
{min:257, max:263, name:"Cudgel", class:"Club", damage:"1d6 Bludgeoning", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"Light", masteryBonus:"-", value:225}, 
{min:264, max:272, name:"Dirk", class:"Dagger", damage:"2d4 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"12", weaponProperties:"Finesse, Light, Range (20/60)", masteryBonus:"Wide Critical", value:250}, 
{min:273, max:279, name:"Gnarled Club", class:"Greatclub", damage:"1d12 Bludgeoning", proficiency:"Simple Melee", strReq:"14", dexReq:"-", weaponProperties:"Two-handed", masteryBonus:"-", value:230}, 
{min:280, max:286, name:"Hatchet", class:"Handaxe", damage:"1d8 Slashing", proficiency:"Simple Melee", strReq:"12", dexReq:"-", weaponProperties:"Light, Range (20/60)", masteryBonus:"-", value:250}, 
{min:287, max:293, name:"Harpoon", class:"Javelin", damage:"1d8 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"12", weaponProperties:"Range (30/120)", masteryBonus:"-", value:300}, 
{min:294, max:300, name:"Knobkerrie", class:"Light Hammer", damage:"1d6 Bludgeoning", proficiency:"Simple Melee", strReq:"12", dexReq:"-", weaponProperties:"Light, Range (20/60)", masteryBonus:"-", value:225}, 
{min:301, max:309, name:"Mallet", class:"Mace", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"12", dexReq:"-", weaponProperties:"-", masteryBonus:"-", value:225}, 
{min:310, max:316, name:"Claws", class:"Metal Knuckles", damage:"1d6 Bludgeoning", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"-", masteryBonus:"-", value:325}, 
{min:317, max:323, name:"War Staff", class:"Quarterstaff", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"12", dexReq:"-", weaponProperties:"Versatile (1d10)", masteryBonus:"Hinder", value:350}, 
{min:324, max:330, name:"Hand Scythe", class:"Sickle", damage:"1d6 Slashing", proficiency:"Simple Melee", strReq:"-", dexReq:"12", weaponProperties:"Light", masteryBonus:"Bleed", value:275}, 
{min:331, max:339, name:"Mancatcher", class:"Spear", damage:"1d8 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"12", weaponProperties:"Range (20/60), Versatile (1d10)", masteryBonus:"-", value:400}, 
{min:340, max:346, name:"Arbalest", class:"Light Crossbow", damage:"1d6 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"12", weaponProperties:"Thrown (20/60)", masteryBonus:"Debilitate", value:700}, 
{min:347, max:353, name:"Shuriken", class:"Dart", damage:"1d6 Piercing", proficiency:"Simple Ranged", strReq:"10", dexReq:"16", weaponProperties:"Loading, Two-handed, Range (80/320)", masteryBonus:"Aim", value:225}, 
{min:354, max:362, name:"Horse Bow", class:"Shortbow", damage:"1d10 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"14", weaponProperties:"Range, Two-handed, (80/320)", masteryBonus:"-", value:500}, 
{min:363, max:369, name:"Hurler", class:"Sling", damage:"1d8 Bludgeoning", proficiency:"Simple Ranged", strReq:"-", dexReq:"12", weaponProperties:"Range (30/120)", masteryBonus:"-", value:1000}, 
{min:370, max:383, name:"Bearded Axe", class:"Battleaxe", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"16", dexReq:"-", weaponProperties:"Versatile (1d12)", masteryBonus:"Cleave", value:1050}, 
{min:384, max:394, name:"Shredder", class:"Flail", damage:"1d10 Bludgeoning", proficiency:"Martial Melee", strReq:"16", dexReq:"-", weaponProperties:"-", masteryBonus:"Brutal", value:1100}, 
{min:395, max:405, name:"Bardiche", class:"Glaive", damage:"1d12 Slashing", proficiency:"Martial Melee", strReq:"18", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", masteryBonus:"-", value:1200}, 
{min:406, max:419, name:"Executioner", class:"Greataxe", damage:"2d8 Slashing", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"Heavy, Two-handed,", masteryBonus:"Cleave", value:1250}, 
{min:420, max:433, name:"Claymore", class:"Greatsword", damage:"2d8 Slashing", proficiency:"Martial Melee", strReq:"16", dexReq:"14", weaponProperties:"Heavy, Two-handed", masteryBonus:"Debilitate", value:1300}, 
{min:434, max:444, name:"Poleaxe", class:"Halberd", damage:"1d12 Slashing", proficiency:"Martial Melee", strReq:"18", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", masteryBonus:"-", value:1200}, 
{min:445, max:455, name:"Ranseur", class:"Lance", damage:"2d8 Piercing", proficiency:"Martial Melee", strReq:"18", dexReq:"14", weaponProperties:"Reach", masteryBonus:"Skewer", value:1150}, 
{min:456, max:469, name:"Broad Sword", class:"Longsword", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"14", dexReq:"12", weaponProperties:"Versatile (1d12)", masteryBonus:"Debilitate", value:1050}, 
{min:470, max:480, name:"Sledge", class:"Maul", damage:"2d8 Bludgeoning", proficiency:"Martial Melee", strReq:"19", dexReq:"-", weaponProperties:"Heavy, Two-handed", masteryBonus:"Stagger", value:1000}, 
{min:481, max:491, name:"Flanged Mace", class:"Morningstar", damage:"1d10 Bludgeoning", proficiency:"Martial Melee", strReq:"16", dexReq:"-", weaponProperties:"-", masteryBonus:"Bleed", value:1100}, 
{min:492, max:502, name:"Partisan", class:"Pike", damage:"1d12 Piercing", proficiency:"Martial Melee", strReq:"18", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", masteryBonus:"-", value:1150}, 
{min:503, max:513, name:"Spadroon", class:"Rapier", damage:"1d10 Piercing", proficiency:"Martial Melee", strReq:"-", dexReq:"16", weaponProperties:"Finesse", masteryBonus:"-", value:1200}, 
{min:514, max:524, name:"Sabre", class:"Scimitar", damage:"1d8 Slashing", proficiency:"Martial Melee", strReq:"12", dexReq:"15", weaponProperties:"Finesse, Light,", masteryBonus:"Wide Critical", value:1200}, 
{min:525, max:535, name:"Giant Thresher", class:"Scythe", damage:"4d4 Slashing", proficiency:"Martial Melee", strReq:"16", dexReq:"15", weaponProperties:"Heavy, Two-handed", masteryBonus:"Cleave", value:1500}, 
{min:536, max:549, name:"Gladius", class:"Shortsword", damage:"1d8 Slashing", proficiency:"Martial Melee", strReq:"12", dexReq:"-", weaponProperties:"Finesse, Light", masteryBonus:"Bleed", value:1050}, 
{min:550, max:560, name:"Brandistock", class:"Trident", damage:"1d8 Piercing", proficiency:"Martial Melee", strReq:"14", dexReq:"-", weaponProperties:"Range (20/60), Versatile (1d10)", masteryBonus:"Brutal", value:1200}, 
{min:561, max:574, name:"Battle Gavel", class:"Warhammer", damage:"1d10 Bludgeoning", proficiency:"Martial Melee", strReq:"16", dexReq:"-", weaponProperties:"Versatile (1d12)", masteryBonus:"Stagger", value:1100}, 
{min:575, max:585, name:"Crowbill", class:"War pick", damage:"1d10 Piercing", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"-", masteryBonus:"Sunder", value:1150}, 
{min:586, max:596, name:"Flog", class:"Whip", damage:"1d6 Slashing", proficiency:"Martial Melee", strReq:"-", dexReq:"16", weaponProperties:"Finesse, Reach", masteryBonus:"Hinder", value:1000}, 
{min:597, max:607, name:"Sarbacan", class:"Blowgun", damage:"1d8 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"14", weaponProperties:"Loading, Two-handed, Range (25/100)", masteryBonus:"Aim", value:1200}, 
{min:608, max:621, name:"Stake Thrower", class:"Hand Crossbow", damage:"2d4 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"20", weaponProperties:"Light, Loading, Range (30/120)", masteryBonus:"Wide Critical", value:1500}, 
{min:622, max:632, name:"Ballista", class:"Heavy Crossbow", damage:"1d8 Piercing", proficiency:"Martial Ranged", strReq:"14", dexReq:"16", weaponProperties:"Heavy, Loading, Two-handed, Range (100/400)", masteryBonus:"Aim", value:1500}, 
{min:633, max:643, name:"War Bow", class:"Longbow", damage:"1d6 Piercing", proficiency:"Martial Ranged", strReq:"12", dexReq:"18", weaponProperties:"Heavy, Two-handed, Range (150/600)", masteryBonus:"Stagger", value:1400}, 
{min:644, max:653, name:"Truncheon", class:"Club", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"13", dexReq:"-", weaponProperties:"Light", masteryBonus:"-", value:1050}, 
{min:654, max:666, name:"Stiletto", class:"Dagger", damage:"3d4 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"14", weaponProperties:"Finesse, Light, Range (20/60)", masteryBonus:"Wide Critical", value:1100}, 
{min:667, max:676, name:"Tyrant", class:"Greatclub", damage:"2d8 Bludgeoning", proficiency:"Simple Melee", strReq:"16", dexReq:"-", weaponProperties:"Two-handed", masteryBonus:"-", value:1500}, 
{min:677, max:686, name:"Cleaver", class:"Handaxe", damage:"1d10 Slashing", proficiency:"Simple Melee", strReq:"14", dexReq:"-", weaponProperties:"Light, Range (20/60)", masteryBonus:"-", value:1150}, 
{min:687, max:696, name:"Dardo", class:"Javelin", damage:"1d10 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"14", weaponProperties:"Range (30/120)", masteryBonus:"-", value:1100}, 
{min:697, max:706, name:"Hurlbat", class:"Light Hammer", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"14", dexReq:"-", weaponProperties:"Light, Range (20/60)", masteryBonus:"-", value:1150}, 
{min:707, max:719, name:"Scepter", class:"Mace", damage:"1d10 Bludgeoning", proficiency:"Simple Melee", strReq:"14", dexReq:"-", weaponProperties:"-", masteryBonus:"-", value:1250}, 
{min:720, max:729, name:"Kaiser Fist", class:"Metal Knuckles", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"13", dexReq:"-", weaponProperties:"-", masteryBonus:"-", value:1400}, 
{min:730, max:739, name:"Rune Staff", class:"Quarterstaff", damage:"1d10 Bludgeoning", proficiency:"Simple Melee", strReq:"14", dexReq:"-", weaponProperties:"Versatile (1d12)", masteryBonus:"Hinder", value:1500}, 
{min:740, max:749, name:"Thresher", class:"Sickle", damage:"1d8 Slashing", proficiency:"Simple Melee", strReq:"-", dexReq:"14", weaponProperties:"Light", masteryBonus:"Bleed", value:1200}, 
{min:750, max:759, name:"Yari", class:"Spear", damage:"1d10 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"14", weaponProperties:"Range (20/60), Versatile (1d12)", masteryBonus:"-", value:1250}, 
{min:760, max:769, name:"Battle Crossbow", class:"Light Crossbow", damage:"1d8 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"14", weaponProperties:"Thrown (20/60)", masteryBonus:"Debilitate", value:1500}, 
{min:770, max:779, name:"Kunai", class:"Dart", damage:"1d8 Piercing", proficiency:"Simple Ranged", strReq:"12", dexReq:"18", weaponProperties:"Loading, Two-handed, Range (80/320)", masteryBonus:"Aim", value:1000}, 
{min:780, max:791, name:"Composite Bow", class:"Shortbow", damage:"1d12 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"16", weaponProperties:"Range, Two-handed, (80/320)", masteryBonus:"-", value:1500}, 
{min:792, max:801, name:"Hand Trebuchet", class:"Sling", damage:"1d10 Bludgeoning", proficiency:"Simple Ranged", strReq:"-", dexReq:"14", weaponProperties:"Range (30/120)", masteryBonus:"-", value:2500}, 
{min:802, max:821, name:"Tabar", class:"Battleaxe", damage:"1d12 Slashing", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"Versatile (2d6)", masteryBonus:"Cleave", value:2200}, 
{min:822, max:837, name:"Scorpion Flail", class:"Flail", damage:"1d12 Bludgeoning", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"-", masteryBonus:"Brutal", value:2400}, 
{min:838, max:853, name:"Kwan Dao", class:"Glaive", damage:"2d6 Slashing", proficiency:"Martial Melee", strReq:"19", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", masteryBonus:"-", value:2500}, 
{min:854, max:873, name:"Gothic Axe", class:"Greataxe", damage:"3d6 Slashing", proficiency:"Martial Melee", strReq:"20", dexReq:"-", weaponProperties:"Heavy, Two-handed,", masteryBonus:"Cleave", value:2600}, 
{min:874, max:893, name:"Zweihander", class:"Greatsword", damage:"3d6 Slashing", proficiency:"Martial Melee", strReq:"17", dexReq:"14", weaponProperties:"Heavy, Two-handed", masteryBonus:"Debilitate", value:2800}, 
{min:894, max:909, name:"Bec de Corbin", class:"Halberd", damage:"2d6 Slashing", proficiency:"Martial Melee", strReq:"19", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", masteryBonus:"-", value:2600}, 
{min:910, max:925, name:"Spetum", class:"Lance", damage:"3d6 Piercing", proficiency:"Martial Melee", strReq:"19", dexReq:"14", weaponProperties:"Reach", masteryBonus:"Skewer", value:2300}, 
{min:926, max:945, name:"Bastard Sword", class:"Longsword", damage:"1d12 Slashing", proficiency:"Martial Melee", strReq:"15", dexReq:"12", weaponProperties:"Versatile (2d6)", masteryBonus:"Debilitate", value:2500}, 
{min:946, max:961, name:"Driver", class:"Maul", damage:"3d6 Bludgeoning", proficiency:"Martial Melee", strReq:"21", dexReq:"-", weaponProperties:"Heavy, Two-handed", masteryBonus:"Stagger", value:2400}, 
{min:962, max:977, name:"Devil Star", class:"Morningstar", damage:"1d12 Bludgeoning", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"-", masteryBonus:"Bleed", value:2800}, 
{min:978, max:993, name:"Guisarme", class:"Pike", damage:"2d6 Piercing", proficiency:"Martial Melee", strReq:"19", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", masteryBonus:"-", value:2400}, 
{min:994, max:1009, name:"Epee", class:"Rapier", damage:"1d12 Piercing", proficiency:"Martial Melee", strReq:"-", dexReq:"18", weaponProperties:"Finesse", masteryBonus:"-", value:2200}, 
{min:1010, max:1025, name:"Falchion", class:"Scimitar", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"12", dexReq:"16", weaponProperties:"Finesse, Light,", masteryBonus:"Wide Critical", value:2500}, 
{min:1026, max:1041, name:"Grimm", class:"Scythe", damage:"5d4 Slashing", proficiency:"Martial Melee", strReq:"18", dexReq:"15", weaponProperties:"Heavy, Two-handed", masteryBonus:"Cleave", value:2900}, 
{min:1042, max:1060, name:"Tulwar", class:"Shortsword", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"14", dexReq:"-", weaponProperties:"Finesse, Light", masteryBonus:"Bleed", value:2600}, 
{min:1061, max:1076, name:"War Fork", class:"Trident", damage:"1d10 Piercing", proficiency:"Martial Melee", strReq:"16", dexReq:"-", weaponProperties:"Range (20/60), Versatile (1d12)", masteryBonus:"Brutal", value:2500}, 
{min:1077, max:1096, name:"Skullcracker", class:"Warhammer", damage:"1d12 Bludgeoning", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"Versatile (2d6)", masteryBonus:"Stagger", value:2900}, 
{min:1097, max:1112, name:"Mattock", class:"War pick", damage:"1d12 Piercing", proficiency:"Martial Melee", strReq:"20", dexReq:"-", weaponProperties:"-", masteryBonus:"Sunder", value:2200}, 
{min:1113, max:1128, name:"Scourge", class:"Whip", damage:"1d8 Slashing", proficiency:"Martial Melee", strReq:"-", dexReq:"18", weaponProperties:"Finesse, Reach", masteryBonus:"Hinder", value:2100}, 
{min:1129, max:1144, name:"Sumpitan", class:"Blowgun", damage:"1d10 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"16", weaponProperties:"Loading, Two-handed, Range (25/100)", masteryBonus:"Aim", value:2200}, 
{min:1145, max:1164, name:"Bolt Pistol", class:"Hand Crossbow", damage:"3d4 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"22", weaponProperties:"Light, Loading, Range (30/120)", masteryBonus:"Wide Critical", value:2800}, 
{min:1165, max:1180, name:"Colossus Crossbow", class:"Heavy Crossbow", damage:"1d10 Piercing", proficiency:"Martial Ranged", strReq:"14", dexReq:"17", weaponProperties:"Heavy, Loading, Two-handed, Range (100/400)", masteryBonus:"Aim", value:3000}, 
{min:1181, max:1200, name:"Siege Bow", class:"Longbow", damage:"1d8 Piercing", proficiency:"Martial Ranged", strReq:"12", dexReq:"19", weaponProperties:"Heavy, Two-handed, Range (150/600)", masteryBonus:"Stagger", value:3000}
	];
const armorTable = [
{min:1, max:7, name:"Sandals", class:"Feet", armorClass:"-", proficiency:"-", strReq:"-", dexReq:"-", dexMax:"-", masteryBonus:"-", value:1}, 
{min:8, max:14, name:"Shoes", class:"Feet", armorClass:"-", proficiency:"-", strReq:"-", dexReq:"15", dexMax:"-", masteryBonus:"Dashing", value:1}, 
{min:15, max:21, name:"Leather Boots", class:"Feet", armorClass:"-", proficiency:"Light", strReq:"-", dexReq:"11", dexMax:"-", masteryBonus:"1 AP", value:2}, 
{min:22, max:28, name:"Sash", class:"Belt", armorClass:"-", proficiency:"-", strReq:"-", dexReq:"17", dexMax:"-", masteryBonus:"Dashing", value:1}, 
{min:29, max:35, name:"Belt", class:"Belt", armorClass:"-", proficiency:"Light", strReq:"-", dexReq:"13", dexMax:"-", masteryBonus:"1 AP", value:2}, 
{min:36, max:42, name:"Leather Gloves", class:"Gloves", armorClass:"-", proficiency:"-", strReq:"-", dexReq:"-", dexMax:"-", masteryBonus:"-", value:3}, 
{min:43, max:49, name:"Heavy Leather Gloves", class:"Gloves", armorClass:"-", proficiency:"Light", strReq:"-", dexReq:"-", dexMax:"-", masteryBonus:"1 AP", value:5}, 
{min:50, max:56, name:"Leather Cap", class:"Head", armorClass:"-", proficiency:"-", strReq:"-", dexReq:"-", dexMax:"-", masteryBonus:"-", value:5}, 
{min:57, max:63, name:"Skull Helmet", class:"Head", armorClass:"-", proficiency:"Medium", strReq:"13", dexReq:"-", dexMax:"-", masteryBonus:"2 AP", value:9}, 
{min:64, max:72, name:"Buckler", class:"Shield", armorClass:"1", proficiency:"Shield", strReq:"-", dexReq:"13", dexMax:"-", masteryBonus:"2 AP", value:10}, 
{min:73, max:82, name:"Shield", class:"Shield", armorClass:"2", proficiency:"Shield", strReq:"15", dexReq:"-", dexMax:"-", masteryBonus:"-", value:15}, 
{min:83, max:90, name:"Cloak", class:"Torso", armorClass:"-", proficiency:"-", strReq:"-", dexReq:"-", dexMax:"Dex Mod", masteryBonus:"-", value:12}, 
{min:91, max:98, name:"Cape", class:"Torso", armorClass:"-", proficiency:"-", strReq:"-", dexReq:"13", dexMax:"Dex Mod", masteryBonus:"1 AP", value:14}, 
{min:99, max:106, name:"Quilted Armor", class:"Torso", armorClass:"1", proficiency:"-", strReq:"-", dexReq:"14", dexMax:"Dex Mod", masteryBonus:"2 AP", value:18}, 
{min:107, max:114, name:"Gambeson", class:"Torso", armorClass:"1", proficiency:"-", strReq:"-", dexReq:"15", dexMax:"Dex Mod", masteryBonus:"+1 AC", value:20}, 
{min:115, max:122, name:"Padded Armor", class:"Torso", armorClass:"1", proficiency:"Light", strReq:"-", dexReq:"11", dexMax:"Dex Mod", masteryBonus:"1 AP", value:15}, 
{min:123, max:130, name:"Leather Armor", class:"Torso", armorClass:"1", proficiency:"Light", strReq:"-", dexReq:"15", dexMax:"Dex Mod", masteryBonus:"3 AP", value:25}, 
{min:131, max:138, name:"Sudded Leather Armor", class:"Torso", armorClass:"2", proficiency:"Light", strReq:"11", dexReq:"-", dexMax:"Dex Mod", masteryBonus:"1 AP", value:45}, 
{min:139, max:146, name:"Hide Armor", class:"Torso", armorClass:"3", proficiency:"Light", strReq:"12", dexReq:"-", dexMax:"Dex Max 2", masteryBonus:"Dex Max 3", value:15}, 
{min:147, max:154, name:"Chain Shirt", class:"Torso", armorClass:"3", proficiency:"Medium", strReq:"11", dexReq:"-", dexMax:"Dex Max 2", masteryBonus:"1 AP", value:50}, 
{min:155, max:162, name:"Chain Mail", class:"Torso", armorClass:"6", proficiency:"Heavy", strReq:"13", dexReq:"-", dexMax:"-", masteryBonus:"2 AP", value:75}, 
{min:163, max:197, name:"Ring", class:"Jewelrey", armorClass:"-", proficiency:"-", strReq:"(Cha 11)", dexReq:"(Cha 11)", dexMax:"-", masteryBonus:"1 AP", value:750}, 
{min:198, max:232, name:"Amulet", class:"Jewelrey", armorClass:"-", proficiency:"-", strReq:"(Int 11)", dexReq:"(Int 11)", dexMax:"-", masteryBonus:"2 AP", value:900}, 
{min:233, max:243, name:"Heavy Leather Boots", class:"Feet", armorClass:"-", proficiency:"Medium", strReq:"-", dexReq:"15", dexMax:"-", masteryBonus:"Dashing", value:170}, 
{min:244, max:254, name:"Chain Boots", class:"Feet", armorClass:"-", proficiency:"Medium", strReq:"14", dexReq:"-", dexMax:"-", masteryBonus:"2 AP", value:190}, 
{min:255, max:265, name:"Heavy Leather Belt", class:"Belt", armorClass:"-", proficiency:"Medium", strReq:"-", dexReq:"13", dexMax:"-", masteryBonus:"2 AP", value:210}, 
{min:266, max:276, name:"Vambrace", class:"Gloves", armorClass:"-", proficiency:"Light", strReq:"-", dexReq:"13", dexMax:"-", masteryBonus:"2 AP", value:230}, 
{min:277, max:287, name:"Chain Gloves", class:"Gloves", armorClass:"-", proficiency:"Medium", strReq:"-", dexReq:"15", dexMax:"-", masteryBonus:"3 AP", value:260}, 
{min:288, max:298, name:"Bone Mask", class:"Head", armorClass:"-", proficiency:"Light", strReq:"12", dexReq:"-", dexMax:"-", masteryBonus:"1 AP", value:300}, 
{min:299, max:309, name:"Crown", class:"Head", armorClass:"-", proficiency:"Light", strReq:"-", dexReq:"-", dexMax:"-", masteryBonus:"1 AP", value:450}, 
{min:310, max:320, name:"Full Helm", class:"Head", armorClass:"-", proficiency:"Medium", strReq:"14", dexReq:"-", dexMax:"-", masteryBonus:"Fortified", value:380}, 
{min:321, max:332, name:"Kite Shield", class:"Shield", armorClass:"2", proficiency:"Light, Shield", strReq:"11", dexReq:"13", dexMax:"-", masteryBonus:"3 AP", value:410}, 
{min:333, max:344, name:"Large Shield", class:"Shield", armorClass:"2", proficiency:"Medium, Shield", strReq:"15", dexReq:"-", dexMax:"-", masteryBonus:"5 AP", value:430}, 
{min:345, max:356, name:"Hardened Leather Armor", class:"Torso", armorClass:"1", proficiency:"Light", strReq:"13", dexReq:"-", dexMax:"Dex Mod", masteryBonus:"4 AP", value:350}, 
{min:357, max:368, name:"Serpentskin Armor", class:"Torso", armorClass:"2", proficiency:"Light", strReq:"13", dexReq:"-", dexMax:"Dex Mod", masteryBonus:"2 AP", value:500}, 
{min:369, max:380, name:"Breast Plate", class:"Torso", armorClass:"4", proficiency:"Medium", strReq:"14", dexReq:"-", dexMax:"Dex Max 2", masteryBonus:"3 AP", value:450}, 
{min:381, max:392, name:"Cuirass", class:"Torso", armorClass:"4", proficiency:"Medium", strReq:"15", dexReq:"-", dexMax:"Dex Max 2", masteryBonus:"Dex Max 3", value:580}, 
{min:393, max:404, name:"Field Plate", class:"Torso", armorClass:"6", proficiency:"Medium", strReq:"16", dexReq:"-", dexMax:"Dex Max 2", masteryBonus:"Dex Max 3", value:750}, 
{min:405, max:416, name:"Scale Mail", class:"Torso", armorClass:"4", proficiency:"Medium", strReq:"14", dexReq:"-", dexMax:"Dex Max 2", masteryBonus:"2 AP", value:650}, 
{min:417, max:428, name:"Ring Mail", class:"Torso", armorClass:"4", proficiency:"Heavy", strReq:"12", dexReq:"-", dexMax:"-", masteryBonus:"Dex Max 2", value:700}, 
{min:429, max:440, name:"Wyrmhide Armor", class:"Torso", armorClass:"6", proficiency:"Heavy", strReq:"16", dexReq:"-", dexMax:"-", masteryBonus:"Dex Max 3", value:740}, 
{min:441, max:452, name:"Splint Mail", class:"Torso", armorClass:"7", proficiency:"Heavy", strReq:"15", dexReq:"-", dexMax:"-", masteryBonus:"3 AP", value:800}, 
{min:453, max:472, name:"Light Plate Boots", class:"Feet", armorClass:"-", proficiency:"Medium", strReq:"15", dexReq:"-", dexMax:"-", masteryBonus:"Anchored", value:1000}, 
{min:473, max:492, name:"Greaves", class:"Feet", armorClass:"-", proficiency:"Heavy", strReq:"17", dexReq:"-", dexMax:"-", masteryBonus:"3 AP", value:1050}, 
{min:493, max:512, name:"Mithril Coil", class:"Belt", armorClass:"-", proficiency:"Medium", strReq:"15", dexReq:"-", dexMax:"-", masteryBonus:"3 AP", value:1100}, 
{min:513, max:532, name:"Plated Belt", class:"Belt", armorClass:"1", proficiency:"Heavy", strReq:"17", dexReq:"-", dexMax:"-", masteryBonus:"-", value:1150}, 
{min:533, max:552, name:"Light Plate Gloves", class:"Gloves", armorClass:"-", proficiency:"Medium", strReq:"14", dexReq:"-", dexMax:"-", masteryBonus:"Reinforced", value:1200}, 
{min:553, max:572, name:"Diadem", class:"Head", armorClass:"-", proficiency:"-", strReq:"-", dexReq:"-", dexMax:"-", masteryBonus:"2 AP", value:1300}, 
{min:573, max:592, name:"Circlet", class:"Head", armorClass:"-", proficiency:"-", strReq:"-", dexReq:"-", dexMax:"-", masteryBonus:"2 AP", value:1400}, 
{min:593, max:612, name:"Great Helm", class:"Head", armorClass:"-", proficiency:"Heavy", strReq:"17", dexReq:"-", dexMax:"-", masteryBonus:"Reinforced", value:1500}, 
{min:613, max:632, name:"Tower Shield", class:"Shield", armorClass:"2", proficiency:"Heavy, Shield", strReq:"17", dexReq:"-", dexMax:"-", masteryBonus:"+1 AC", value:1600}, 
{min:633, max:653, name:"Shroud", class:"Torso", armorClass:"-", proficiency:"-", strReq:"-", dexReq:"17", dexMax:"Dex Mod", masteryBonus:"4 AP", value:1700}, 
{min:654, max:674, name:"Grand Robe", class:"Torso", armorClass:"1", proficiency:"-", strReq:"-", dexReq:"15", dexMax:"Dex Mod", masteryBonus:"3 AP", value:1800}, 
{min:675, max:695, name:"Light Plate", class:"Torso", armorClass:"4", proficiency:"Medium", strReq:"13", dexReq:"-", dexMax:"Dex Max 2", masteryBonus:"3 AP", value:1900}, 
{min:696, max:716, name:"Half Plate", class:"Torso", armorClass:"5", proficiency:"Medium", strReq:"15", dexReq:"-", dexMax:"Dex Max 2", masteryBonus:"2 AP", value:2000}, 
{min:717, max:737, name:"Demonhide Armor", class:"Torso", armorClass:"3", proficiency:"Medium", strReq:"12", dexReq:"-", dexMax:"Dex Max 2", masteryBonus:"3 AP", value:2200}, 
{min:738, max:758, name:"Archon Plate", class:"Torso", armorClass:"5", proficiency:"Medium", strReq:"17", dexReq:"-", dexMax:"Dex Max 2", masteryBonus:"5 AP", value:2400}, 
{min:759, max:779, name:"Mesh Armor", class:"Torso", armorClass:"5", proficiency:"Heavy", strReq:"15", dexReq:"-", dexMax:"-", masteryBonus:"Dex Max 2", value:2500}, 
{min:780, max:800, name:"Tigulated Mail", class:"Torso", armorClass:"5", proficiency:"Heavy", strReq:"14", dexReq:"-", dexMax:"-", masteryBonus:"3 AP", value:2600}, 
{min:801, max:821, name:"Full Plate Mail", class:"Torso", armorClass:"8", proficiency:"Heavy", strReq:"17", dexReq:"-", dexMax:"-", masteryBonus:"3 AP", value:2800}, 
{min:822, max:842, name:"Ancient Plate", class:"Torso", armorClass:"7", proficiency:"Heavy", strReq:"16", dexReq:"-", dexMax:"-", masteryBonus:"4 AP", value:3000}, 
{min:843, max:867, name:"Plate Gauntlets", class:"Gloves", armorClass:"1", proficiency:"Heavy", strReq:"16", dexReq:"-", dexMax:"-", masteryBonus:"Fortified", value:4000}, 
{min:868, max:892, name:"Armet", class:"Head", armorClass:"1", proficiency:"Heavy", strReq:"15", dexReq:"-", dexMax:"-", masteryBonus:"-", value:4500}, 
{min:893, max:917, name:"Gothic Shield", class:"Shield", armorClass:"3", proficiency:"Heavy, Shield", strReq:"19", dexReq:"-", dexMax:"-", masteryBonus:"Anchored", value:5000}, 
{min:918, max:942, name:"Aegis", class:"Shield", armorClass:"3", proficiency:"Heavy, Shield", strReq:"21", dexReq:"-", dexMax:"-", masteryBonus:"Braced", value:6000}, 
{min:943, max:971, name:"Gothic Plate", class:"Torso", armorClass:"9", proficiency:"Heavy", strReq:"21", dexReq:"-", dexMax:"-", masteryBonus:"+1 AC", value:7000}, 
{min:972, max:1000, name:"Templar Plate", class:"Torso", armorClass:"8", proficiency:"Heavy", strReq:"19", dexReq:"-", dexMax:"-", masteryBonus:"5 AP", value:8000}, 
	];
const prefixTable = [
{min:1, max:4, name:"Obsidian", benefit:"When you take Bludgeoning damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:5, max:8, name:"Ebony", benefit:"When you take Piercing damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:9, max:12, name:"Jet", benefit:"When you take Slashing damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:13, max:16, name:"Jade", benefit:"When you take Acid damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:17, max:20, name:"Sapphire", benefit:"When you take Cold damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:21, max:24, name:"Ruby", benefit:"When you take Fire damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:25, max:28, name:"Kalkite", benefit:"When you take Force damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:29, max:32, name:"Topaz", benefit:"When you take Lightning damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:33, max:36, name:"Ivory", benefit:"When you take Necrotic damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:37, max:40, name:"Emerald", benefit:"When you take Poison damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:41, max:44, name:"Amethyst", benefit:"When you take Psychic damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:45, max:48, name:"Pearl", benefit:"When you take Radiant damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:49, max:52, name:"Amber", benefit:"When you take Thunder damage, you can reduce it by 1d8, to a minimum of 1.", multiplier: 2},
{min:53, max:64, name:"Saintly", benefit:"When a non-living enemy attacks you, increase your AC by 1.", multiplier: 2},
{min:65, max:74, name:"Sinful", benefit:"When a living enemy attacks you, increase your AC by 1.", multiplier: 2},
{min:75, max:84, name:"Entrenched", benefit:"Your AC against ranged attacks is increased by 1.", multiplier: 2},
{min:85, max:92, name:"Sly", benefit:"When you take damage from a weapon attack or spell, you regain 1d4-1 Spell Points.", multiplier: 2},
{min:93, max:100, name:"Calculating", benefit:"When you take damage from a weapon attack or spell, you regain 1d6-1 Spell Points.", multiplier: 2},
{min:101, max:118, name:"Glorious", benefit:"You gain a +1 bonus to your AC.", multiplier: 4},
{min:119, max:132, name:"Valiant", benefit:"You gain a bonus to your AC equal to the number of enemies adjacent to you.", multiplier: 4},
{min:133, max:146, name:"Blessed", benefit:"You gain a bonus to your AC equal to the number of allies adjacent to you.", multiplier: 4},
{min:147, max:150, name:"Durasteel", benefit:"You gain resistance to Bludgeoning damage.", multiplier: 4},
{min:151, max:154, name:"Khaydarin", benefit:"You gain resistance to Piercing damage.", multiplier: 4},
{min:155, max:158, name:"Duralumin", benefit:"You gain resistance to Slashing damage.", multiplier: 4},
{min:159, max:161, name:"Black", benefit:"You gain resistance to Acid damage.", multiplier: 4},
{min:162, max:165, name:"White", benefit:"You gain resistance to Cold damage.", multiplier: 4},
{min:166, max:169, name:"Red", benefit:"You gain resistance to Fire damage.", multiplier: 4},
{min:170, max:173, name:"Kyber", benefit:"You gain resistance to Force damage.", multiplier: 4},
{min:174, max:177, name:"Blue", benefit:"You gain resistance to Lightning damage.", multiplier: 4},
{min:178, max:181, name:"Onyx", benefit:"You gain resistance to Necrotic damage.", multiplier: 4},
{min:182, max:185, name:"Green", benefit:"You gain resistance to Poison damage.", multiplier: 4},
{min:186, max:188, name:"Gemmed", benefit:"You gain resistance to Psychic damage.", multiplier: 4},
{min:189, max:191, name:"Astral", benefit:"You gain resistance to Radiant damage.", multiplier: 4},
{min:192, max:194, name:"Purple", benefit:"You gain resistance to Thunder damage.", multiplier: 4},
{min:195, max:203, name:"Holy", benefit:"When a non-living enemy attacks you, increase your AC by 2.", multiplier: 4},
{min:204, max:212, name:"Wicked", benefit:"When a living enemy attacks you, increase your AC by 2.", multiplier: 4},
{min:213, max:221, name:"Buttressed", benefit:"Your AC against ranged attacks is increased by 2.", multiplier: 4},
{min:222, max:231, name:"Unseen", benefit:"While wearing this item, you are invisible to creatures more than 30 feet away from you. When you make an attack or cast a spell, you become visible until the end of the turn.", multiplier: 4},
{min:232, max:241, name:"Stalking", benefit:"While wearing this item, you can choose to become invisible at the start of your turn. When you perform any action, bonus action, or reaction, you become visible again.", multiplier: 4},
{min:242, max:261, name:"Exalted", benefit:"You gain a +2 bonus to your AC.", multiplier: 7},
{min:262, max:277, name:"Godly", benefit:"When a non-living enemy attacks you, increase your AC by 3.", multiplier: 7},
{min:278, max:293, name:"Desecrated", benefit:"When a living enemy attacks you, increase your AC by 3.", multiplier: 7},
{min:294, max:309, name:"Bastioned", benefit:"Your AC against ranged attacks is increased by 3.", multiplier: 7},
{min:310, max:325, name:"Vulpine", benefit:"When you take damage from a weapon attack or spell, you regain 1d4+1 Spell Points.", multiplier: 7},
{min:326, max:341, name:"Corvine", benefit:"When you take damage from a weapon attack or spell, you regain 1d6+1 Spell Points.", multiplier: 7},
{min:342, max:357, name:"Hidden", benefit:"While wearing this item, you are invisible to creatures more than 20 feet away from you. When you make an attack or cast a spell, you become visible until the end of the turn.", multiplier: 7},
{min:358, max:383, name:"Triumphant", benefit:"You gain a +3 bonus to your AC.", multiplier: 10},
{min:384, max:405, name:"Veiled", benefit:"While wearing this item, you are invisible to creatures more than 10 feet away from you. When you make an attack or cast a spell, you become visible until the end of the turn.", multiplier: 10},
{min:406, max:421, name:"Newt's", benefit:"You gain 2 spell points that are regained after a long rest.", multiplier: 2},
{min:422, max:435, name:"Lizard's", benefit:"You gain 3 spell points that are regained after a long rest.", multiplier: 2},
{min:436, max:455, name:"Snake's", benefit:"You gain 5 spell points that are regained after a long rest.", multiplier: 4},
{min:456, max:473, name:"Crocodile's", benefit:"You gain 6 spell points that are regained after a long rest.", multiplier: 4},
{min:474, max:489, name:"Serpent's", benefit:"You gain 7 spell points that are regained after a long rest.", multiplier: 4},
{min:490, max:509, name:"Granite", benefit:"When you get this item, choose a class feature that recharges after a short rest. Increase the number of times you can use that feature by 2. You can change the feature after a long rest.", multiplier: 4},
{min:510, max:525, name:"Pyrite", benefit:"When you get this item, choose a class feature that recharges after a short rest. Increase the number of times you can use that feature by 3. You can change the feature after a long rest.", multiplier: 4},
{min:526, max:549, name:"Cobalt", benefit:"When you get this item, choose a class feature that recharges after a Long rest. Increase the number of times you can use that feature by 1. You can change the feature after a long rest.", multiplier: 4},
{min:550, max:573, name:"Viper's", benefit:"You gain 9 spell points that are regained after a long rest.", multiplier: 7},
{min:574, max:595, name:"Basilisk's", benefit:"You gain 10 spell points that are regained after a long rest.", multiplier: 7},
{min:596, max:619, name:"Opal", benefit:"When you get this item, choose a class feature that recharges after a Long rest. Increase the number of times you can use that feature by 2. You can change the feature after a long rest.", multiplier: 7},
{min:620, max:641, name:"Azure", benefit:"When you get this item, choose 2 class features that recharge after a short rest. Increase the number of times you can use that feature by 1. You can change these features after a long rest.", multiplier: 7},
{min:642, max:661, name:"Lapis", benefit:"When you get this item, choose 2 class features that recharge after a short rest. Increase the number of times you can use that feature by 2. You can change these features after a long rest.", multiplier: 7},
{min:662, max:679, name:"Diamond", benefit:"When you get this item, choose 2 class features that recharge after a long rest. Increase the number of times you can use that feature by 1. You can change these features after a long rest.", multiplier: 7},
{min:680, max:707, name:"Wyrm's", benefit:"You gain 11 spell points that are regained after a long rest.", multiplier: 10},
{min:708, max:733, name:"Hydra's", benefit:"You gain 13 spell points that are regained after a long rest.", multiplier: 10},
{min:734, max:745, name:"Bronze", benefit:"You gain a +1 to attack rolls.", multiplier: 2},
{min:746, max:757, name:"Iron", benefit:"You gain a +1 to damage rolls.", multiplier: 2},
{min:758, max:770, name:"+1", benefit:"You gain a +1 to attack and damage rolls.", multiplier: 2},
{min:771, max:780, name:"Pewter", benefit:"You gain a +2 to attack rolls.", multiplier: 2},
{min:781, max:790, name:"Steel", benefit:"You gain a +2 to damage rolls.", multiplier: 2},
{min:791, max:803, name:"Deadly", benefit:"On a d20 weapon attack roll of 20, you can add one additional weapon damage die.", multiplier: 2},
{min:804, max:814, name:"Vicious", benefit:"On a d20 weapon attack roll of 19-20, you can add one additional weapon damage die.", multiplier: 2},
{min:815, max:823, name:"Savage", benefit:"On a d20 weapon attack roll of 18-20, you can add one additional weapon damage die.", multiplier: 2},
{min:824, max:830, name:"Vitriolic", benefit:"This weapon additionally deals 1d6 extra Acid damage.", multiplier: 2},
{min:831, max:837, name:"Frozen", benefit:"This weapon additionally deals 1d6 extra Cold damage.", multiplier: 2},
{min:838, max:844, name:"Flaming", benefit:"This weapon additionally deals 1d6 extra Fire damage.", multiplier: 2},
{min:845, max:851, name:"Forceful", benefit:"This weapon additionally deals 1d6 extra Force damage.", multiplier: 2},
{min:852, max:858, name:"Shocking", benefit:"This weapon additionally deals 1d6 extra Lightning damage.", multiplier: 2},
{min:859, max:865, name:"Decaying", benefit:"This weapon additionally deals 1d6 extra Necrotic damage.", multiplier: 2},
{min:866, max:872, name:"Poisoned", benefit:"This weapon additionally deals 1d6 extra Poison damage.", multiplier: 2},
{min:873, max:879, name:"Tormenting", benefit:"This weapon additionally deals 1d6 extra Psychic damage.", multiplier: 2},
{min:880, max:886, name:"Radiant", benefit:"This weapon additionally deals 1d6 extra Radiant damage.", multiplier: 2},
{min:887, max:893, name:"Booming", benefit:"This weapon additionally deals 1d6 extra Thunder damage.", multiplier: 2},
{min:894, max:905, name:"Jagged", benefit:"When you deal critical damage, you can add 1d6 when determining the extra damage.", multiplier: 2},
{min:906, max:914, name:"Viridian", benefit:"When you hit a creature with this weapon, its AC is reduced by 1, constitution save ends. This effect does not stack.", multiplier: 2},
{min:915, max:923, name:"Crimson", benefit:"When you hit a creature with this weapon, its attack bonus is reduced by 1, constitution save ends. This effect does not stack.", multiplier: 2},
{min:924, max:935, name:"Crusader's", benefit:"You gain 1 bonus damage for every creature adjacent to you.", multiplier: 2},
{min:936, max:947, name:"Berserker's", benefit:"You gain 1 bonus damage for every creature adjacent to the target.", multiplier: 2},
{min:948, max:959, name:"Exploding", benefit:"When rolling damage for attacks made with this weapon, when a die rolls maximum, you may roll that die again for bonus damage. This effect can occur multiple times.", multiplier: 2},
{min:960, max:973, name:"Erupting", benefit:"When rolling damage for attacks made with this weapon, when a die rolls maximum, you may roll that die again. The additional damage is fire damage. This effect can occur multiple times.", multiplier: 2},
{min:974, max:987, name:"Rupturing", benefit:"When rolling damage for attacks made with this weapon, when a die rolls maximum, you may roll that die again. The additional damage is force damage. This effect can occur multiple times.", multiplier: 2},
{min:988, max:1001, name:"Detonating", benefit:"When rolling damage for attacks made with this weapon, when a die rolls maximum, you may roll that die again. The additional damage is thunder damage.  This effect can occur multiple times.", multiplier: 2},
{min:1002, max:1011, name:"Howling", benefit:"When you hit a creature with a melee attack, they must make a DC 14 Wisdom saving throw. On a failure, the creature must use its next available action or reaction to move their speed away from you.", multiplier: 2},
{min:1012, max:1030, name:"+2", benefit:"You gain a +2 to attack and damage rolls.", multiplier: 4},
{min:1031, max:1049, name:"Gold", benefit:"You gain a +3 to attack rolls.", multiplier: 4},
{min:1050, max:1068, name:"Platinum", benefit:"You gain a +3 to damage rolls.", multiplier: 4},
{min:1069, max:1085, name:"Adamantine", benefit:"Your critical hit range is increased by 1.", multiplier: 4},
{min:1086, max:1100, name:"Ruthless", benefit:"On a d20 weapon attack roll of 17-20, you can add one additional weapon damage die.", multiplier: 4},
{min:1101, max:1115, name:"Merciless", benefit:"On a d20 weapon attack roll of 16-20, you can add one additional weapon damage die.", multiplier: 4},
{min:1116, max:1132, name:"Corrosive", benefit:"This weapon additionally deals 1d8 extra Acid damage.", multiplier: 4},
{min:1133, max:1149, name:"Arctic", benefit:"This weapon additionally deals 1d8 extra Cold damage.", multiplier: 4},
{min:1150, max:1166, name:"Ashen", benefit:"This weapon additionally deals 1d8 extra Fire damage.", multiplier: 4},
{min:1167, max:1183, name:"Potent", benefit:"This weapon additionally deals 1d8 extra Force damage.", multiplier: 4},
{min:1184, max:1200, name:"Electric", benefit:"This weapon additionally deals 1d8 extra Lightning damage.", multiplier: 4},
{min:1201, max:1217, name:"Rotting", benefit:"This weapon additionally deals 1d8 extra Necrotic damage.", multiplier: 4},
{min:1218, max:1234, name:"Venomous", benefit:"This weapon additionally deals 1d8 extra Poison damage.", multiplier: 4},
{min:1235, max:1251, name:"Traumatic", benefit:"This weapon additionally deals 1d8 extra Psychic damage.", multiplier: 4},
{min:1252, max:1268, name:"Luminous", benefit:"This weapon additionally deals 1d8 extra Radiant damage.", multiplier: 4},
{min:1269, max:1285, name:"Crashing", benefit:"This weapon additionally deals 1d8 extra Thunder damage.", multiplier: 4},
{min:1286, max:1304, name:"Heavy", benefit:"When you deal critical damage, you can add 1d10 when determining the extra damage.", multiplier: 4},
{min:1305, max:1323, name:"Brutal", benefit:"When you deal critical damage, you can add 2d6 when determining the extra damage.", multiplier: 4},
{min:1324, max:1340, name:"Beryl", benefit:"When you hit a creature with this weapon, its AC is reduced by 2, constitution save ends. This effect does not stack.", multiplier: 4},
{min:1341, max:1357, name:"Scarlet", benefit:"When you hit a creature with this weapon, its attack bonus is reduced by 2, constitution save ends. This effect does not stack.", multiplier: 4},
{min:1358, max:1376, name:"Wailing", benefit:"When you hit a creature with a melee attack, they must make a DC 16 Wisdom saving throw. On a failure, the creature must use its next available action or reaction to move their speed away from you.", multiplier: 4},
{min:1377, max:1393, name:"Dreadful", benefit:"After hitting a creature with this weapon, the target is frightened of you until the end of its next turn.", multiplier: 4},
{min:1394, max:1412, name:"Blighted", benefit:"After hitting a creature with this weapon, the target is poisoned until the end of its next turn.", multiplier: 4},
{min:1413, max:1427, name:"Exhausting", benefit:"After hitting a creature with this weapon, the target is under the effect of the Slow spell  until the end of its next turn.", multiplier: 4},
{min:1428, max:1442, name:"Chaotic", benefit:"After hitting a creature with this weapon, the target uses its action at the start of its turn to make a melee attack against a randomly determined creature within its reach. If there is no creature within its reach, the target can act normally.", multiplier: 4},
{min:1443, max:1466, name:"+3", benefit:"You gain a +3 to attack and damage rolls.", multiplier: 7},
{min:1467, max:1492, name:"Mithril", benefit:"Your critical hit range is increased by 2.", multiplier: 7},
{min:1493, max:1510, name:"Caustic", benefit:"This weapon additionally deals 1d10 extra Acid damage.", multiplier: 7},
{min:1511, max:1528, name:"Glacial", benefit:"This weapon additionally deals 1d10 extra Cold damage.", multiplier: 7},
{min:1529, max:1546, name:"Blazing", benefit:"This weapon additionally deals 1d10 extra Fire damage.", multiplier: 7},
{min:1547, max:1564, name:"Mystic", benefit:"This weapon additionally deals 1d10 extra Force damage.", multiplier: 7},
{min:1565, max:1582, name:"Stormy", benefit:"This weapon additionally deals 1d10 extra Lightning damage.", multiplier: 7},
{min:1583, max:1600, name:"Deathly", benefit:"This weapon additionally deals 1d10 extra Necrotic damage.", multiplier: 7},
{min:1601, max:1618, name:"Toxic", benefit:"This weapon additionally deals 1d10 extra Poison damage.", multiplier: 7},
{min:1619, max:1636, name:"Harrowing", benefit:"This weapon additionally deals 1d10 extra Psychic damage.", multiplier: 7},
{min:1637, max:1654, name:"Hallowed", benefit:"This weapon additionally deals 1d10 extra Radiant damage.", multiplier: 7},
{min:1655, max:1672, name:"Roaring", benefit:"This weapon additionally deals 1d10 extra Thunder damage.", multiplier: 7},
{min:1673, max:1695, name:"Massive", benefit:"When you deal critical damage, you can add 2d10 when determining the extra damage.", multiplier: 7},
{min:1696, max:1722, name:"Templar's", benefit:"You gain 2 bonus damage for every creature adjacent to you.", multiplier: 7},
{min:1723, max:1749, name:"Fanatic's", benefit:"You gain 2 bonus damage for every creature adjacent to the target.", multiplier: 7},
{min:1750, max:1770, name:"Obscurring", benefit:"After hitting a creature with this weapon, the target is blinded until the end of its next turn.", multiplier: 7},
{min:1771, max:1792, name:"Nightmare", benefit:"After hitting a creature with this weapon, the target is frightened of you, save ends.", multiplier: 7},
{min:1793, max:1816, name:"Pestilent", benefit:"After hitting a creature with this weapon, the target is poisoned, save ends.", multiplier: 7},
{min:1817, max:1838, name:"Discordant", benefit:"After hitting a creature with this weapon, the target uses its action to make a melee attack against a randomly determined creature within its reach. If there is no creature within its reach, the target does nothing that turn.", multiplier: 7},
{min:1839, max:1859, name:"Phasing", benefit:"After hitting a creature with this weapon,  the target shifts to the ethereal plane until the end of its next turn.", multiplier: 7},
{min:1860, max:1892, name:"Orichalcum", benefit:"Your critical hit range is increased by 3.", multiplier: 10},
{min:1893, max:1919, name:"Crippling", benefit:"After hitting a creature with this weapon, the target is incapacitated until the end of its next turn.", multiplier: 10},
{min:1920, max:1946, name:"Blinding", benefit:"After hitting a creature with this weapon, the target is blinded, save ends.", multiplier: 10},
{min:1947, max:1973, name:"Subjugating", benefit:"After hitting a creature with this weapon, the target is incapacitated, save ends.", multiplier: 10},
{min:1974, max:2000, name:"Overwhelming", benefit:"After hitting a creature with this weapon, the target is under the effect of the Slow spell  save ends.", multiplier: 10},
   ];
const suffixTable = [
{min:1, max:11, name:"of Brawn", benefit:"You gain a +1 bonus to your Strength ability score.", multiplier: 2},
{min:12, max:22, name:"of Nimbleness", benefit:"You gain a +1 bonus to your Dexterity ability score.", multiplier: 2},
{min:23, max:33, name:"of Stamina", benefit:"You gain a +1 bonus to your Constitution ability score.", multiplier: 2},
{min:34, max:44, name:"of Wit", benefit:"You gain a +1 bonus to your Intelligence ability score.", multiplier: 2},
{min:45, max:55, name:"of Reason", benefit:"You gain a +1 bonus to your Wisdom ability score.", multiplier: 2},
{min:56, max:66, name:"of Appeal", benefit:"You gain a +1 bonus to your Charisma ability score.", multiplier: 2},
{min:67, max:72, name:"of the Boar", benefit:"You gain a +1 bonus to your Strength saving throws.", multiplier: 2},
{min:73, max:78, name:"of the Ram", benefit:"You gain a +1 bonus to your Dexterity saving throws.", multiplier: 2},
{min:79, max:84, name:"of the Cat", benefit:"You gain a +1 bonus to your Constitution saving throws.", multiplier: 2},
{min:85, max:90, name:"of the Raccoon ", benefit:"You gain a +1 bonus to your Intelligence saving throws.", multiplier: 2},
{min:91, max:96, name:"of the Beetle", benefit:"You gain a +1 bonus to your Wisdom saving throws.", multiplier: 2},
{min:97, max:102, name:"of the Badger", benefit:"You gain a +1 bonus to your Charisma saving throws.", multiplier: 2},
{min:103, max:108, name:"of the Rat", benefit:"You gain a +1 bonus to your Death saving throws.", multiplier: 2},
{min:109, max:112, name:"of the Wolf", benefit:"You gain a +2 bonus to your Charisma saving throws.", multiplier: 2},
{min:113, max:116, name:"of the Owl", benefit:"You gain a +2 bonus to your Strength saving throws.", multiplier: 2},
{min:117, max:120, name:"of the Tortoise", benefit:"You gain a +2 bonus to your Dexterity saving throws.", multiplier: 2},
{min:121, max:124, name:"of the Dove", benefit:"You gain a +2 bonus to your Constitution saving throws.", multiplier: 2},
{min:125, max:128, name:"of the Swan", benefit:"You gain a +2 bonus to your Intelligence saving throws.", multiplier: 2},
{min:129, max:132, name:"of the Hyena", benefit:"You gain a +2 bonus to your Wisdom saving throws.", multiplier: 2},
{min:133, max:136, name:"of the Possum", benefit:"You gain a +2 bonus to your Death saving throws.", multiplier: 2},
{min:137, max:154, name:"of the Warrior", benefit:"You gain 1 additional Armor Point. ", multiplier: 2},
{min:155, max:168, name:"of the Soldier", benefit:"You gain 3 additional Armor Points. ", multiplier: 2},
{min:169, max:181, name:"of the Sparrow", benefit:"You maximum hit point value is increased by 2.  ", multiplier: 2},
{min:182, max:192, name:"of the Kestrel", benefit:"You maximum hit point value is increased by 5.  ", multiplier: 2},
{min:193, max:198, name:"of the Adept", benefit:"You gain 1 hit dice that is the same size as your highest level class. ", multiplier: 2},
{min:199, max:207, name:"of Veins", benefit:"When a potion or spell allows you to regain health, regain an additional 1d6+3 hit points.", multiplier: 2},
{min:208, max:213, name:"of the Moon", benefit:"You gain a number of extra spell points, equal to your level divided by 2, rounded down. ", multiplier: 2},
{min:214, max:219, name:"of the Giant", benefit:"You gain a number of armor points, equal to your level divided by 2, rounded down. ", multiplier: 2},
{min:220, max:222, name:"of Glowing", benefit:"While wearing this item, light sources you carry shed 5 feet more bright and dim light. ", multiplier: 2},
{min:223, max:225, name:"of Gleaming", benefit:"While wearing this item, light sources you carry shed 10 feet more bright and dim light. ", multiplier: 2},
{min:226, max:231, name:"of Brambles", benefit:"When you take damage from a melee attack, the attacker takes 1d4 piercing damage. ", multiplier: 2},
{min:232, max:237, name:"of Rapport", benefit:"While wearing this item, any allies within 5 feet of you have a +1 bonus to saving throws.", multiplier: 2},
{min:238, max:243, name:"of Mana Shield", benefit:"When you would take damage from any source, you can expend  up to 2 spell points and reduce the damage by  1d12 for each point spent.", multiplier: 2},
{min:244, max:255, name:"of Strength", benefit:"You gain a +2 bonus to your Strength ability score.", multiplier: 4},
{min:256, max:267, name:"of Dexterity", benefit:"You gain a +2 bonus to your Dexterity ability score.", multiplier: 4},
{min:268, max:279, name:"of Constitution", benefit:"You gain a +2 bonus to your Constitution ability score.", multiplier: 4},
{min:280, max:291, name:"of Intelligence", benefit:"You gain a +2 bonus to your Intelligence ability score.", multiplier: 4},
{min:292, max:303, name:"of Wisdom", benefit:"You gain a +2 bonus to your Wisdom ability score.", multiplier: 4},
{min:304, max:315, name:"of Charisma", benefit:"You gain a +2 bonus to your Charisma ability score.", multiplier: 4},
{min:316, max:321, name:"of the Paladin", benefit:"You gain a +1 bonus to your Strength and Charisma ability scores.", multiplier: 4},
{min:322, max:327, name:"of the Cleric", benefit:"You gain a +1 bonus to your Strength and Wisdom ability scores.", multiplier: 4},
{min:328, max:333, name:"of the Warlock", benefit:"You gain a +1 bonus to your Dexterity and Charisma ability scores.", multiplier: 4},
{min:334, max:339, name:"of the Rogue", benefit:"You gain a +1 bonus to your Dexterity and Intelligence ability scores.", multiplier: 4},
{min:340, max:345, name:"of the Monk", benefit:"You gain a +1 bonus to your Dexterity and Wisdom ability scores.", multiplier: 4},
{min:346, max:351, name:"of the Psion", benefit:"You gain a +1 bonus to your Intelligence and Wisdom ability scores.", multiplier: 4},
{min:352, max:356, name:"of the Gorilla", benefit:"You gain a +3 bonus to your Strength saving throws.", multiplier: 4},
{min:357, max:361, name:"of the Hawk", benefit:"You gain a +3 bonus to your Dexterity saving throws.", multiplier: 4},
{min:362, max:366, name:"of the Ox", benefit:"You gain a +3 bonus to your Constitution saving throws.", multiplier: 4},
{min:367, max:371, name:"of the Raven", benefit:"You gain a +3 bonus to your Intelligence saving throws.", multiplier: 4},
{min:372, max:376, name:"of the Stag", benefit:"You gain a +3 bonus to your Wisdom saving throws.", multiplier: 4},
{min:377, max:381, name:"of the Peacock", benefit:"You gain a +3 bonus to your Charisma saving throws.", multiplier: 4},
{min:382, max:387, name:"of the Vulture", benefit:"You gain a +3 bonus to your Death saving throws.", multiplier: 4},
{min:388, max:401, name:"of the Knight", benefit:"You gain 5 additional Armor Points.", multiplier: 4},
{min:402, max:414, name:"of Falcon", benefit:"You maximum hit point value is increased by 8.", multiplier: 4},
{min:415, max:425, name:"of Eagle", benefit:"You maximum hit point value is increased by 10.", multiplier: 4},
{min:426, max:434, name:"of the Veteran", benefit:"You gain 2 hit dice that are the same size as your highest level class.", multiplier: 4},
{min:435, max:444, name:"of Health", benefit:"While you are bloodied and still have hit points, you regain 1d4hit points at the start of your turn.", multiplier: 4},
{min:445, max:453, name:"of Life", benefit:"You gain a bonus to your maximum hit point value, equal to your level.", multiplier: 4},
{min:454, max:461, name:"of Blood", benefit:"When a potion or spell allows you to regain health, regain an additional 1d6+6 hit points.", multiplier: 4},
{min:462, max:468, name:"of Heart", benefit:"When a potion or spell allows you to regain health, regain an additional 1d6+9 hit points.", multiplier: 4},
{min:469, max:475, name:"of Shining", benefit:"While wearing this item, light sources you carry shed 15 feet more bright and dim light. ", multiplier: 4},
{min:476, max:485, name:"of Thorns", benefit:"When you take damage from a melee attack, the attacker takes 2d4 piercing damage. ", multiplier: 4},
{min:486, max:493, name:"of Unity", benefit:"While wearing this item, any allies within 5 feet of you have a +4 bonus to saving throws.", multiplier: 4},
{min:494, max:502, name:"of Chance", benefit:"Once per loot session, you can roll a d8. On a 7 or higher, you gain one additional loot drop.  ", multiplier: 4},
{min:503, max:506, name:"of Athletics", benefit:"You gain advantage on Athletics skill checks.  ", multiplier: 4},
{min:507, max:510, name:"of Acrobatics", benefit:"You gain advantage on Acrobatics skill checks.  ", multiplier: 4},
{min:511, max:514, name:"of the Theif", benefit:"You gain advantage on Sleight of Hand skill checks.  ", multiplier: 4},
{min:515, max:518, name:"of Stealth", benefit:"You gain advantage on Stealth skill checks.  ", multiplier: 4},
{min:519, max:522, name:"of Arcana", benefit:"You gain advantage on Arcana skill checks.  ", multiplier: 4},
{min:523, max:526, name:"of History", benefit:"You gain advantage on History skill checks.  ", multiplier: 4},
{min:527, max:530, name:"of Investigation", benefit:"You gain advantage on Investigation skill checks.  ", multiplier: 4},
{min:531, max:534, name:"of Nature", benefit:"You gain advantage on Nature skill checks.  ", multiplier: 4},
{min:535, max:538, name:"of Religion", benefit:"You gain advantage on Religion skill checks.  ", multiplier: 4},
{min:539, max:542, name:"of Animal Handling", benefit:"You gain advantage on Animal Handling skill checks.", multiplier: 4},
{min:543, max:546, name:"of Insight", benefit:"You gain advantage on Insight skill checks.", multiplier: 4},
{min:547, max:550, name:"of Medicine", benefit:"You gain advantage on Medicine skill checks.", multiplier: 4},
{min:551, max:554, name:"of Perception", benefit:"You gain advantage on Perception skill checks.", multiplier: 4},
{min:555, max:558, name:"of Survival", benefit:"You gain advantage on Survival skill checks.", multiplier: 4},
{min:559, max:562, name:"of Deception", benefit:"You gain advantage on Deception skill checks.", multiplier: 4},
{min:563, max:566, name:"of Intimidation", benefit:"You gain advantage on Intimidation skill checks.", multiplier: 4},
{min:567, max:570, name:"of Performance", benefit:"You gain advantage on Performance skill checks.", multiplier: 4},
{min:571, max:574, name:"of Persuasion", benefit:"You gain advantage on Persuasion skill checks. ", multiplier: 4},
{min:575, max:584, name:"of Soul Ward", benefit:"When you would take damage from any source, you can expend up to 4 spell points and reduce the damage by 1d6 for each point spent.", multiplier: 4},
{min:585, max:594, name:"of Arcane Aegis", benefit:"When you would take damage from any source, you can expend up to 6 spell points and reduce the damage by 1d4 for each point spent.", multiplier: 4},
{min:595, max:606, name:"of Might", benefit:"You gain a +3 bonus to your Strength ability score.", multiplier: 7},
{min:607, max:618, name:"of Finesse", benefit:"You gain a +3 bonus to your Dexterity ability score.", multiplier: 7},
{min:619, max:630, name:"of Mettle", benefit:"You gain a +3 bonus to your Constitution ability score.", multiplier: 7},
{min:631, max:642, name:"of Brilliance", benefit:"You gain a +3 bonus to your Intelligence ability score.", multiplier: 7},
{min:643, max:654, name:"of Judgement", benefit:"You gain a +3 bonus to your Wisdom ability score.", multiplier: 7},
{min:655, max:666, name:"of Allure", benefit:"You gain a +3 bonus to your Charisma ability score.", multiplier: 7},
{min:667, max:677, name:"of the Oathkeeper", benefit:"You gain a +2 bonus to your Strength and Charisma ability scores.", multiplier: 7},
{min:678, max:688, name:"of the Priest", benefit:"You gain a +2 bonus to your Strength and Wisdom ability scores.", multiplier: 7},
{min:689, max:699, name:"of the Hexblade", benefit:"You gain a +2 bonus to your Dexterity and Charisma ability scores.", multiplier: 7},
{min:700, max:710, name:"of the Trickster", benefit:"You gain a +2 bonus to your Dexterity and Intelligence ability scores.", multiplier: 7},
{min:711, max:721, name:"of the Ways", benefit:"You gain a +2 bonus to your Dexterity and Wisdom ability scores.", multiplier: 7},
{min:722, max:732, name:"of the Noble", benefit:"You gain a +2 bonus to your Intelligence and Wisdom ability scores.", multiplier: 7},
{min:733, max:742, name:"of of the Stars", benefit:"You gain a +1 bonus to all of your ability scores.", multiplier: 7},
{min:743, max:757, name:"of the Champion", benefit:"You gain 8 additional Armor Points. ", multiplier: 7},
{min:758, max:775, name:"of Condor", benefit:"You maximum hit point value is increased by 13.", multiplier: 7},
{min:776, max:791, name:"of Mammoth", benefit:"You maximum hit point value is increased by 15.", multiplier: 7},
{min:792, max:803, name:"of the Expert", benefit:"You gain 3 hit dice that are the same size as your highest level class. ", multiplier: 7},
{min:804, max:815, name:"of Sinew", benefit:"When a potion or spell allows you to regain health, regain an additional 2d6+5 hit points.", multiplier: 7},
{min:816, max:827, name:"of Regeneration", benefit:"While you are bloodied and still have hit points, you regain 1d8hit points at the start of your turn. ", multiplier: 7},
{min:828, max:844, name:"of the Sun", benefit:"You gain a number of extra spell points, equal to your level. ", multiplier: 7},
{min:845, max:859, name:"of the Titan", benefit:"You gain a number of armor points, equal to your level. ", multiplier: 7},
{min:860, max:878, name:"of Barbs", benefit:"When you take damage from a melee attack, the attacker takes 3d4 piercing damage. ", multiplier: 7},
{min:879, max:895, name:"of Harmony", benefit:"While wearing this item, any allies within 10 feet of you have a +2 bonus to saving throws.", multiplier: 7},
{min:896, max:911, name:"of Wealth", benefit:"Once per loot session, you can roll a d8. On a 5 or higher, you gain one additional loot drop.", multiplier: 7},
{min:912, max:928, name:"of Power", benefit:"You gain a +4 bonus to your Strength ability score.", multiplier: 10},
{min:929, max:945, name:"of Precision", benefit:"You gain a +4 bonus to your Dexterity ability score.", multiplier: 10},
{min:946, max:962, name:"of Vigor", benefit:"You gain a +4 bonus to your Constitution ability score.", multiplier: 10},
{min:963, max:979, name:"of Wizardry", benefit:"You gain a +4 bonus to your Intelligence ability score.", multiplier: 10},
{min:980, max:996, name:"of Justice", benefit:"You gain a +4 bonus to your Wisdom ability score.", multiplier: 10},
{min:997, max:1013, name:"of Sorcery", benefit:"You gain a +4 bonus to your Charisma ability score.", multiplier: 10},
{min:1014, max:1028, name:"of of the Zodiac", benefit:"You gain a +2 bonus to all of your ability scores.", multiplier: 10},
{min:1029, max:1051, name:"of the Duke", benefit:"You gain 10 additional Armor Points. ", multiplier: 10},
{min:1052, max:1072, name:"of the King", benefit:"You gain 12 additional Armor Points. ", multiplier: 10},
{min:1073, max:1093, name:"of Whale", benefit:"You maximum hit point value is increased by 20.", multiplier: 10},
{min:1094, max:1112, name:"of Colossus", benefit:"You maximum hit point value is increased by 25.", multiplier: 10},
{min:1113, max:1136, name:"of the Master", benefit:"You gain 4 hit dice that are the same size as your highest level class. ", multiplier: 10},
{min:1137, max:1159, name:"of Bone", benefit:"When a potion or spell allows you to regain health, regain an additional 2d6+10 hit points.", multiplier: 10},
{min:1160, max:1181, name:"of Marrow", benefit:"When a potion or spell allows you to regain health, regain an additional 2d6+15 hit points.", multiplier: 10},
{min:1182, max:1201, name:"of Regrowth", benefit:"While you are bloodied and still have hit points, you regain 1d12hit points at the start of your turn. ", multiplier: 10},
{min:1202, max:1226, name:"of Vitality", benefit:"You gain a bonus to your maximum hit point value, equal to twice your level. ", multiplier: 10},
{min:1227, max:1251, name:"of Spikes", benefit:"When you take damage from a melee attack, the attacker takes 4d4 piercing damage. ", multiplier: 10},
{min:1252, max:1276, name:"of Kin", benefit:"While wearing this item, any allies within 20 feet of you have a +2 bonus to saving throws.", multiplier: 10},
{min:1277, max:1301, name:"of Fortune", benefit:"Once per loot session, you can roll a d8. On a 3 or higher, you gain one additional loot drop.", multiplier: 10},
{min:1302, max:1305, name:"of Shattering", benefit:"After you take Bludgeoning damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 weapon damage.", multiplier: 2},
{min:1306, max:1309, name:"of Puncturing", benefit:"After you take Piercing damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 weapon damage.", multiplier: 2},
{min:1310, max:1313, name:"of Rending", benefit:"After you take Slashing damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 weapon damage.", multiplier: 2},
{min:1314, max:1317, name:"of Acid", benefit:"After you take Acid damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Acid damage.", multiplier: 2},
{min:1318, max:1321, name:"of Frost", benefit:"After you take Cold damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Cold damage.", multiplier: 2},
{min:1322, max:1325, name:"of Fire", benefit:"After you take Fire damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Fire damage.", multiplier: 2},
{min:1326, max:1329, name:"of Magic", benefit:"After you take Force damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Force damage.", multiplier: 2},
{min:1330, max:1333, name:"of Lightning", benefit:"After you take Lightning damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Lightning damage.", multiplier: 2},
{min:1334, max:1337, name:"of Shadow", benefit:"After you take Necrotic damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Necrotic damage.", multiplier: 2},
{min:1338, max:1341, name:"of Sickness", benefit:"After you take Poison damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Poison damage.", multiplier: 2},
{min:1342, max:1345, name:"of the Mind", benefit:"After you take Psychic damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Psychic damage.", multiplier: 2},
{min:1346, max:1349, name:"of Light", benefit:"After you take Radiant damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Radiant damage.", multiplier: 2},
{min:1350, max:1353, name:"of Thunder", benefit:"After you take Thunder damage, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Thunder damage.", multiplier: 2},
{min:1354, max:1362, name:"of the Wyvern", benefit:"Your Proficiency Bonus increases by 1. This effect can only be applied from one item. ", multiplier: 2},
{min:1363, max:1369, name:"of Readiness", benefit:"You can add 1d4 to initiative rolls.", multiplier: 2},
{min:1370, max:1375, name:"of Apetite", benefit:"When you cast a spell using spell points, roll a d20. On a 13 or higher, the spell costs 1 less SP. Otherwise, it costs 1 more. ", multiplier: 2},
{min:1376, max:1381, name:"of Study", benefit:"When first equipping this item, choose two 1st-level spells you have access to. These spells do not count against your total number of spells known or prepared.", multiplier: 2},
{min:1382, max:1387, name:"of Training", benefit:"When first equipping this item, choose two 2nd-level spells you have access to. These spells do not count against your total number of spells known or prepared.", multiplier: 2},
{min:1388, max:1396, name:"of Instinct", benefit:"This item does not have a proficiency requirement to gain its mastery bonus.", multiplier: 4},
{min:1397, max:1405, name:"of Ease", benefit:"This item does not have a strength requirement to gain its mastery bonus.", multiplier: 4},
{min:1406, max:1414, name:"of Simplicity", benefit:"This item does not have a dexterity requirement to gain its mastery bonus.", multiplier: 4},
{min:1415, max:1422, name:"of the Drake", benefit:"Your Proficiency Bonus increases by 2. This effect can only be applied from one item.", multiplier: 4},
{min:1423, max:1432, name:"of the Leech", benefit:"When you deal damage with a weapon attack, you regain 1d4 hit points.", multiplier: 4},
{min:1433, max:1440, name:"of the Bat", benefit:"When you deal damage with a weapon attack, you regain 1d8 hit points.", multiplier: 4},
{min:1441, max:1450, name:"of the Claw", benefit:"When you deal damage with a weapon attack, you regain 1 spell points.", multiplier: 4},
{min:1451, max:1458, name:"of the Fang", benefit:"When you deal damage with a weapon attack, you regain 2 spell points.", multiplier: 4},
{min:1459, max:1469, name:"of the Apprentice", benefit:"Once per short rest, you can cast a spell with a casting time of one action as a bonus action instead.", multiplier: 4},
{min:1470, max:1478, name:"of Alacrity", benefit:"You can add 1d8 to initiative rolls.", multiplier: 4},
{min:1479, max:1487, name:"of Vengeance", benefit:"On your turn, you can use your move action to instead make a weapon attack.", multiplier: 4},
{min:1488, max:1496, name:"of Quickness", benefit:"On your turn, you can use your move action to instead cast a cantrip.", multiplier: 4},
{min:1497, max:1505, name:"of Hunger", benefit:"When you cast a spell using spell points, roll a d20. On a 9 or higher, the spell costs 1 less SP. Otherwise, it costs 1 more. ", multiplier: 4},
{min:1506, max:1514, name:"of Mnemonics", benefit:"If you have the spellcasting class feature, you can add your proficiency bonus to the number of spells you know or can prepare.", multiplier: 4},
{min:1515, max:1523, name:"of Research", benefit:"When first equipping this item, choose two 3rd-level spells you have access to. These spells do not count against your total number of spells known or prepared. ", multiplier: 4},
{min:1524, max:1532, name:"of Lore", benefit:"When first equipping this item, choose one 4th-level spell you have access to. This spells do not count against your total number of spells known or prepared. ", multiplier: 4},
{min:1533, max:1544, name:"of the Dragon", benefit:"Your Proficiency Bonus increases by 3. This effect can only be applied from one item. ", multiplier: 7},
{min:1545, max:1556, name:"of the Vampire", benefit:"When you deal damage with a weapon attack, you regain 1d12 hit points. ", multiplier: 7},
{min:1557, max:1568, name:"of the Talon", benefit:"When you deal damage with a weapon attack, you regain 3 spell points. ", multiplier: 7},
{min:1569, max:1580, name:"of the Magus", benefit:"Once per short rest, you can cast a spell with a casting time of one action as a bonus action instead. When you use this feature, roll a d6. On a 6, this feature regains its use.", multiplier: 7},
{min:1581, max:1592, name:"of Initiative", benefit:"You can add 1d12 to initiative rolls.", multiplier: 7},
{min:1593, max:1604, name:"of Zeal", benefit:"On your turn, you can use your move action to instead take the attack action.", multiplier: 7},
{min:1605, max:1616, name:"of Haste", benefit:"On your turn, you can use your move action to instead cast a spell. ", multiplier: 7},
{min:1617, max:1628, name:"of Craving", benefit:"When you cast a spell using spell points, roll a d20. On a 5 or higher, the spell costs 1 less SP. Otherwise, it costs 1 more. ", multiplier: 7},
{min:1629, max:1640, name:"of Enlightenment", benefit:"When first equipping this item, choose one 5th-level spell you have access to. This spells do not count against your total number of spells known or prepared. ", multiplier: 7},
{min:1641, max:1652, name:"of the Leopard", benefit:"You gain a damage bonus to your weapon attacks equal to your level divided by 3, rounded down. ", multiplier: 2},
{min:1653, max:1664, name:"of the Lion", benefit:"You gain a damage bonus to your spells equal to your level divided by 3, rounded down. ", multiplier: 2},
{min:1665, max:1676, name:"of Measure", benefit:"When you roll damage for a weapon attack, you can reroll any 1's on the damage dice. You must use the second result. ", multiplier: 2},
{min:1677, max:1688, name:"of Tempo", benefit:"Once per turn when you take the attack action, you may role percentile dice. if the result is less than your level, you may make one additional attack. ", multiplier: 2},
{min:1689, max:1700, name:"of Suppression", benefit:"When you hit a creature with this weapon, its speed is reduced by 10 feet until the start of your next turn.", multiplier: 2},
{min:1701, max:1712, name:"of the Bear", benefit:"When you hit a creature with a melee attack, they must make a DC 15 Strength saving throw. On a failure, the creature is pushed 5 feet.", multiplier: 2},
{min:1713, max:1724, name:"of Fatigue", benefit:"After hitting a creature with this weapon, they cannot make any reactions until the end of the turn.", multiplier: 2},
{min:1725, max:1736, name:"of Binding", benefit:"After hitting a creature with this weapon, they cannot make any reactions until the end of their next turn.", multiplier: 2},
{min:1737, max:1754, name:"of the Panther", benefit:"You gain a damage bonus to your weapon attacks equal to your level divided by 2, rounded down. ", multiplier: 4},
{min:1755, max:1772, name:"of the Tiger", benefit:"You gain a damage bonus to your spells equal to your level divided by 2, rounded down. ", multiplier: 4},
{min:1773, max:1790, name:"of Worth", benefit:"When you roll damage for a weapon attack, you can reroll any 2's on the damage dice. You must use the second result. ", multiplier: 4},
{min:1791, max:1808, name:"of Excellence", benefit:"When you deal damage with a spell, you can reroll any 1's on the damage dice. You must use the second result. ", multiplier: 4},
{min:1809, max:1826, name:"of Momentum", benefit:"Once per turn when you take the attack action, you may role percentile dice. if the result is less than 5 plus your level, you may make one additional attack. ", multiplier: 4},
{min:1827, max:1844, name:"of Impairment", benefit:"When you hit a creature with this weapon, its speed is reduced by half until the start of your next turn.", multiplier: 4},
{min:1845, max:1862, name:"of the Grizzly", benefit:"When you hit a creature with a melee attack, they must make a DC 17 Strength saving throw. On a failure, the creature is pushed 10 feet.", multiplier: 4},
{min:1863, max:1880, name:"of Greed", benefit:"When damage is rolled after hitting with this weapon, roll a d8. On an 8, maximize all damage dice. On 3-7, damage is calculated as usual. On a 1 or 2, the attack deals 0 damage.", multiplier: 4},
{min:1881, max:1904, name:"of Supremacy", benefit:"When you deal damage with a spell, you can reroll any 2's on the damage dice. You must use the second result. ", multiplier: 7},
{min:1905, max:1928, name:"of Velocity", benefit:"Once per turn when you take the attack action, you may role percentile dice. if the result is less than 10 plus your level, you may make one additional attack. ", multiplier: 7},
{min:1929, max:1952, name:"of Containment", benefit:"When you hit a creature with this weapon, its speed is reduced to 0 until the start of your next turn.", multiplier: 7},
{min:1953, max:1976, name:"of Avarice", benefit:"When damage is rolled after hitting with this weapon, roll a d4. On a 4, maximize all damage dice. On 2-3, damage is calculated as usual. On a 1, the attack deals 0 damage.", multiplier: 7},
{min:1977, max:2000, name:"of Maiming", benefit:"After hitting a creature with this weapon, they cannot make any reactions for 1d4 turns.", multiplier: 7},
    ];
const prefixCurseTable = [
{min:1, max:7, name:"Rusted", benefit:"You suffer a -1 to your AC.", multiplier: 0.5},
{min:8, max:13, name:"Crystaline", benefit:"While using this item, your armor points are reduced by 5 to a minimum of 1.", multiplier: 0.5},
{min:14, max:19, name:"Glass", benefit:"While using this item, your armor points are reduced by half.", multiplier: 0.5},
{min:20, max:24, name:"Pitch", benefit:"While using this item, your light sources have bright and dim light reduced by 10 feet.", multiplier: 0.5},
{min:25, max:31, name:"Tar", benefit:"While using this item, you no longer gain the benefits of darkvision, if you have it.", multiplier: 0.5},
{min:32, max:41, name:"Vulnerable", benefit:"You suffer a -2 to your AC.", multiplier: 0.25},
{min:42, max:55, name:"Brittle", benefit:"You suffer a -3 to your AC.", multiplier: 0.15},
{min:56, max:65, name:"Frog's", benefit:"While using this item, your spell points are reduced by 15 to a minimum of 1.", multiplier: 0.25},
{min:66, max:75, name:"Toad's", benefit:"While using this item, your spell points are reduced by half.", multiplier: 0.25},
{min:76, max:83, name:"Tin", benefit:"You suffer a -1 to your weapon attack rolls.", multiplier: 0.5},
{min:84, max:88, name:"Aluminum", benefit:"You suffer a -2 to your weapon attack rolls.", multiplier: 0.5},
{min:89, max:95, name:"Bent", benefit:"When rolling damage for an attack made with this weapon, any dice with a result higher than 3 are instead treated as a 3.", multiplier: 0.5},
{min:96, max:100, name:"Dull", benefit:"When rolling damage for an attack made with this weapon, any dice with a result higher than 2 are instead treated as a 2.", multiplier: 0.5},
{min:101, max:110, name:"Copper", benefit:"You suffer a -3 to your weapon attack rolls.", multiplier: 0.25},
{min:111, max:120, name:"Useless", benefit:"When rolling damage for an attack made with this weapon, all dice are treated as a 1.", multiplier: 0.25},
	];
const suffixCurseTable = [
{min:1, max:7, name:"of Tears", benefit:"After you hit with a melee attack, you take 1 piercing damage.", multiplier: 0.5},
{min:8, max:12, name:"of Pain", benefit:"After you hit with a melee attack, you take 2 piercing damage.", multiplier: 0.5},
{min:13, max:18, name:"of Weakness", benefit:"While using this item, you suffer a -1 to your Strength score.", multiplier: 0.5},
{min:19, max:24, name:"of Frailty", benefit:"While using this item, you suffer a -1 to your Constitution score.", multiplier: 0.5},
{min:25, max:30, name:"of Bumbling", benefit:"While using this item, you suffer a -1 to your Dexterity score.", multiplier: 0.5},
{min:31, max:36, name:"of Dyslexia", benefit:"While using this item, you suffer a -1 to your Intelligence score.", multiplier: 0.5},
{min:37, max:42, name:"of the Nitwit", benefit:"While using this item, you suffer a -1 to your Wisdom score.", multiplier: 0.5},
{min:43, max:48, name:"of Aversion", benefit:"While using this item, you suffer a -1 to your Charisma score.", multiplier: 0.5},
{min:49, max:54, name:"of the Snail", benefit:"While using this item, your speed is halved.", multiplier: 0.5},
{min:55, max:64, name:"of Atrophy", benefit:"While using this item, you suffer a -2 to your Strength score.", multiplier: 0.25},
{min:65, max:74, name:"of Disease", benefit:"While using this item, you suffer a -2 to your Constitution score.", multiplier: 0.25},
{min:75, max:84, name:"of Lumbering", benefit:"While using this item, you suffer a -2 to your Dexterity score.", multiplier: 0.25},
{min:85, max:94, name:"of the Oaf", benefit:"While using this item, you suffer a -2 to your Intelligence score.", multiplier: 0.25},
{min:95, max:104, name:"of the Gullable", benefit:"While using this item, you suffer a -2 to your Wisdom score.", multiplier: 0.25},
{min:105, max:114, name:"of Loathing", benefit:"While using this item, you suffer a -2 to your Charisma score.", multiplier: 0.25},
{min:115, max:122, name:"of Trouble", benefit:"While using this item, you suffer a -1 to all ability scores.", multiplier: 0.25},
{min:123, max:136, name:"of Tribulation", benefit:"While using this item, you suffer a -2 to all ability scores.", multiplier: 0.15},
{min:137, max:143, name:"of Corruption", benefit:"While in posession of this item, your maximum spell points cannot be more than twice your level.", multiplier: 0.5},
{min:144, max:149, name:"of the Fool", benefit:"While in posession of this item, you can only prepare or know 1 spell.", multiplier: 0.5},
{min:150, max:159, name:"of Ruin", benefit:"While using this item, you have disadvantage on all saving throws.", multiplier: 0.25},
{min:160, max:168, name:"of Pox", benefit:"While in posession of this item, you cannot regain hit points from spells, features, or items.", multiplier: 0.25},
{min:169, max:180, name:"of Peril", benefit:"While using this item, attacks against you are made at advantage.", multiplier: 0.25},
{min:181, max:190, name:"of Sloth", benefit:"While using this item, you can make only one attack roll per round, regardless of any additional features or effects.", multiplier: 0.25},
{min:191, max:200, name:"of Passivity", benefit:"While using this item, you cannot make any opportunity attacks.", multiplier: 0.25},
	];