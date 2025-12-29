

        // Your existing loot generation code
        function rollDie(sides) {
            return Math.floor(Math.random() * sides) + 1;
        }

        function rollPercentage() {
            return rollDie(100);
        }

        function getLootLevel(characterLevel, dungeonLevel) {
            const lootLevel = characterLevel + dungeonLevel;
            if (lootLevel < 9) return 1;
            if (lootLevel < 17) return 2;
            if (lootLevel < 25) return 3;
            return 4;
        }

        function getWeightedRandomItem(table, tier) {
            const filteredTable = table.filter(item => item.tier <= tier);
            const totalWeight = filteredTable.reduce((sum, item) => sum + item.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (let item of filteredTable) {
                random -= item.weight;
                if (random <= 0) return item;
            }
            return filteredTable[filteredTable.length - 1];
        }

        function generateGold(characterLevel, dungeonLevel) {
            const lootLevel = characterLevel + dungeonLevel;
            const baseAmount = lootLevel * rollDie(20);
            const multiplier = (100 + rollDie(41) - 1) / 100;
            const amount = Math.floor(baseAmount * multiplier);
           
            return {
                type: 'gold',
                name: `${amount} Gold Pieces`,
                value: amount,
                property: "",
            };
        }

function generatePotion(tier) {
    const roll = rollDie(15 * tier);
    const potion = getWeightedRandomItem(potionTable, tier);
    
    return {
        type: 'potion',
        name: potion.name,
        property: potion.property || "",
        value: potion.value || 0,
        action: potion.action || ""
    };
}
        function generateSpellConsumable(tier) {
            const isBook = rollDie(20) === 20;
            const spellRoll = rollDie(25 * tier);
            let targetSpellLevel;
            
            if (spellRoll <= 9) targetSpellLevel = 0;
            else if (spellRoll <= 19) targetSpellLevel = 1;
            else if (spellRoll <= 29) targetSpellLevel = 2;
            else if (spellRoll <= 39) targetSpellLevel = 3;
            else if (spellRoll <= 49) targetSpellLevel = 4;
            else if (spellRoll <= 59) targetSpellLevel = 5;
            else if (spellRoll <= 69) targetSpellLevel = 6;
            else if (spellRoll <= 79) targetSpellLevel = 7;
            else if (spellRoll <= 89) targetSpellLevel = 8;
            else targetSpellLevel = 9;
            
            const availableSpells = spellTable.filter(s => s.spellLevel === targetSpellLevel);
            const spell = availableSpells[rollDie(availableSpells.length) - 1] || spellTable[0];
            
            return {
                type: 'magic-consumable',
                name: `${isBook ? 'Book' : 'Scroll'} of ${spell.name}`,
                property: `Contains the ${spell.name} spell (Level ${spell.spellLevel}).`,
                value: spell.value + (isBook ? 50 : 0)
            };
        }

function generateGear(tier, guarantee = null) {
    let isArmor, enchantRoll, isRare = false, isUnique = false;
    if (guarantee && guarantee.includes('armor')) {
        isArmor = true;
    } else if (guarantee && guarantee.includes('weapon')) {
        isArmor = false;
    } else {
        isArmor = rollDie(20) <= 10;
    }
    let baseItem = isArmor ?  // Change from const to let
        getWeightedRandomItem(armorTable, tier) : 
        getWeightedRandomItem(weaponTable, tier);
    
    // Store base item reference
    const baseItemIndex = isArmor ? 
        armorTable.indexOf(baseItem) : 
        weaponTable.indexOf(baseItem);
    
    let item = {
        name: baseItem.name,
        property: "",
        value: baseItem.value,
        multiplier: 1,
        baseItemRef: baseItemIndex,
        baseItemType: isArmor ? 'armor' : 'weapon',
        affixes: []
    };
    
 if (!guarantee || guarantee.includes('unique') || guarantee.includes('gear') || guarantee.includes('weapon') || guarantee.includes('armor') || guarantee.includes('magic') || guarantee.includes('prefix') || guarantee.includes('suffix') || guarantee.includes('both') || guarantee.includes('rare')) {
    let uniqueRoll = rollPercentage();
    if (guarantee && guarantee.includes('unique')) {
        uniqueRoll = 101; // Force unique
    }
    
    if (uniqueRoll >= 98) { // 2% chance for unique
        // Keep rolling until we find a valid unique
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loop
        
        while (attempts < maxAttempts) {
            // Filter available uniques for this base item and tier
            const availableUniques = uniqueTable.filter(u => 
                u.baseItem === baseItem.name && 
                u.baseItemType === (isArmor ? 'armor' : 'weapon') &&
                u.tier <= tier
            );
            
if (availableUniques.length > 0) {
    const chosenUnique = getWeightedRandomItem(availableUniques, 999);
    isUnique = true;
    
    item.name = `"${chosenUnique.uniqueName}"<br>Unique ${baseItem.name}`; 
    item.isUnique = true;
    item.uniqueData = chosenUnique;
    item.property = chosenUnique.properties.map(p => `• ${p}`).join('<br>');
    item.multiplier = chosenUnique.multiplier;
    item.value = Math.max(1, Math.floor(baseItem.value * chosenUnique.multiplier));
    
    return item;
}
            
            // No uniques available for this base item, try a different base item
            baseItem = isArmor ? 
                getWeightedRandomItem(armorTable, tier) : 
                getWeightedRandomItem(weaponTable, tier);
            
            // Update item object with new base
            item = {
                name: baseItem.name,
                property: "",
                value: baseItem.value,
                multiplier: 1,
                baseItemRef: isArmor ? armorTable.indexOf(baseItem) : weaponTable.indexOf(baseItem),
                baseItemType: isArmor ? 'armor' : 'weapon',
                affixes: []
            };
            
            attempts++;
        }
        
        // If we couldn't find a unique after max attempts, log warning and continue to rare/enchanted
        console.warn('Could not generate unique item after', maxAttempts, 'attempts. Falling back to rare.');
        isRare = true;
    }
}
    
    // Check for rare items (only if not unique and not mundane guarantee)
    if (!isUnique && (!guarantee || !guarantee.includes('mundane'))) {
        if (guarantee && guarantee.includes('rare')) {
            isRare = true;
        } else if (rollPercentage() >= 95) { // 5% chance for rare
            isRare = true;
        }
    }
    
    if (isRare) {
        const numAffixes = rollDie(4) + 1;
        const name1 = rareName1[rollDie(rareName1.length) - 1];
        const name2 = rareName2[rollDie(rareName2.length) - 1];
        item.name = `"${name1} ${name2}"<br>${baseItem.name}<br>`;
        item.isRare = true;
        let properties = [];
        let usedCategories = new Set();
        
        for (let i = 0; i < numAffixes; i++) {
            const isPrefix = rollDie(2) === 1;
            const table = isPrefix ? prefixTable : suffixTable;
                
            const affix = getWeightedRandomItem(table.filter(a => 
                a.type === 'both' || (isArmor && a.type === 'armor') || (!isArmor && a.type === 'weapon')
            ), tier);
            
            if (affix) {
                if (!usedCategories.has(affix.category)) {
                    usedCategories.add(affix.category);
                    properties.push(`• ${affix.property}`);
                    item.multiplier += affix.multiplier;
                    
                    item.affixes.push({
                        name: affix.name,
                        property: affix.property,
                        isPrefix: isPrefix,
                        isCursed: false
                    });
                }
            }
        }
        
        item.property = properties.join('<br>');
    } else {
        // Regular enchanted/mundane logic
        if (guarantee && guarantee.includes('mundane')) {
            enchantRoll = 1;
        } else if (guarantee && guarantee.includes('prefix')) {
            enchantRoll = 10;
        } else if (guarantee && guarantee.includes('suffix')) {
            enchantRoll = 15;
        } else if (guarantee && guarantee.includes('both')) {
            enchantRoll = 20;
        } else if (guarantee && guarantee.includes('magic')) {
            enchantRoll = rollDie(12) + 8;
        } else {
            enchantRoll = rollDie(20);
        }
        
        if (enchantRoll >= 9) {
            item.value += 15;
            
            const hasPrefix = enchantRoll >= 9 && (enchantRoll <= 13 || enchantRoll >= 19);
            const hasSuffix = enchantRoll >= 14;
            
            let properties = [];
            let usedCategories = new Set();
            
            if (hasPrefix) {
                const isCursed = rollDie(50) === 1;
                const table = isCursed ? cursedPrefixTable : prefixTable;
                const prefix = getWeightedRandomItem(table.filter(a => 
                    a.type === 'both' || (isArmor && a.type === 'armor') || (!isArmor && a.type === 'weapon')
                ), tier);
                
                if (prefix) {
                    item.name = `${prefix.name} ${item.name}`;
                    usedCategories.add(prefix.category);
                    properties.push(`• ${prefix.property}`);
                    item.multiplier += prefix.multiplier;
                    if (isCursed) item.isCursed = true;
                    
                    item.affixes.push({
                        name: prefix.name,
                        property: prefix.property,
                        isPrefix: true,
                        isCursed: isCursed
                    });
                }
            }
            
            if (hasSuffix) {
                const isCursed = rollDie(50) === 1;
                const table = isCursed ? cursedSuffixTable : suffixTable;
                
                let availableAffixes = table.filter(a => 
                    (a.type === 'both' || (isArmor && a.type === 'armor') || (!isArmor && a.type === 'weapon')) &&
                    !usedCategories.has(a.category)
                );
                
                if (availableAffixes.length === 0) {
                    availableAffixes = table.filter(a => 
                        a.type === 'both' || (isArmor && a.type === 'armor') || (!isArmor && a.type === 'weapon')
                    );
                }
                
                const suffix = getWeightedRandomItem(availableAffixes, tier);
                
                if (suffix) {
                    item.name = `${item.name} ${suffix.name}`;
                    usedCategories.add(suffix.category);
                    properties.push(`• ${suffix.property}`);
                    item.multiplier += suffix.multiplier;
                    if (isCursed) item.isCursed = true;
                    
                    item.affixes.push({
                        name: suffix.name,
                        property: suffix.property,
                        isPrefix: false,
                        isCursed: isCursed
                    });
                }
            }
            
            item.property = properties.join('<br>');
        }
    }
    
    item.value = Math.max(1, Math.floor(item.value * Math.max(0.1, item.multiplier)));
    
    return item;
}

function generateSingleLoot(characterLevel, dungeonLevel, guarantee = null) {
    const tier = getLootLevel(characterLevel, dungeonLevel);
    let roll;
   
    if (guarantee === 'no-loot') return { type: 'no-loot', name: 'No Loot', value: 0, property: "" };
    if (guarantee === 'gold') roll = 7;
    else if (guarantee === 'potion') roll = 9;
    else if (guarantee === 'spell-consumable') roll = 11;
    else if (guarantee && (guarantee.includes('gear') || guarantee.includes('weapon') || guarantee.includes('armor') || guarantee.includes('unique') || guarantee.includes('rare') || guarantee.includes('magic') || guarantee.includes('mundane') || guarantee.includes('prefix') || guarantee.includes('suffix') || guarantee.includes('both'))) {
        roll = 13;
    }
    else roll = rollDie(20);
   
    let result = null;
    let hasExtraRoll = false;
   
    if (roll <= 6) {
        return { type: 'no-loot', name: 'No Loot', value: 0, property: "" };
    } else if (roll <= 8) {
        result = generateGold(characterLevel, dungeonLevel);
        hasExtraRoll = rollDie(20) >= 18;
    } else if (roll <= 10) {
        result = generatePotion(tier);
        hasExtraRoll = rollDie(20) >= 18;
    } else if (roll <= 12) {
        result = generateSpellConsumable(tier);
    } else {
        result = generateGear(tier, guarantee);
    }
   
    if (hasExtraRoll && !guarantee) {
        const extraLoot = generateSingleLoot(characterLevel, dungeonLevel);
        if (Array.isArray(extraLoot)) {
            extraLoot.forEach(item => item.isBonusRoll = true);
            return [result, ...extraLoot].filter(item => item && item.type !== 'no-loot');
        } else {
            if (extraLoot && extraLoot.type !== 'no-loot') {
                extraLoot.isBonusRoll = true;
            }
            return [result, extraLoot].filter(item => item && item.type !== 'no-loot');
        }
    }
   
    return result;
}
        function generateLoot() {
            const characterLevel = parseInt(document.getElementById('characterLevel').value) || 1;
            const dungeonLevel = parseInt(document.getElementById('dungeonLevel').value) || 1;
            const numRolls = parseInt(document.getElementById('numRolls').value) || 1;
            const guarantee = document.getElementById('guarantee').value || null;
            
            const results = [];
            
            for (let i = 0; i < numRolls; i++) {
                const loot = generateSingleLoot(characterLevel, dungeonLevel, guarantee);
                if (Array.isArray(loot)) {
                    results.push(...loot);
                } else if (loot) {
                    results.push(loot);
                }
            }
            
            displayResults(results);
        }

        function updateGenerateButton() {
            const characterLevel = parseInt(document.getElementById('characterLevel').value) || 1;
            const dungeonLevel = parseInt(document.getElementById('dungeonLevel').value) || 1;
            const tier = getLootLevel(characterLevel, dungeonLevel);
            
            const generateBtn = document.getElementById('generateLootBtn');
            generateBtn.textContent = `Generate Loot (Tier ${tier})`;
        }

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    if (results.length === 0) {
        resultsDiv.innerHTML = '<div class="no-loot">No loot.</div>';
        return;
    }
   
    let html = '';
    let totalValue = 0;
   
    results.forEach((item, index) => {
        totalValue += item.value || 0;
        let className = 'loot-item';
       
        if (item.type === 'no-loot') {
            className += ' nothing';
        } else if (item.type === 'gold') {
            className += ' gold';
        } else if (item.type === 'potion') {
            className += ' potion';
        } else if (item.type === 'magic-consumable') {
            className += ' magic-consumable';
        } else if (item.isUnique) {
            className += ' unique';
        } else if (item.isRare) {
            className += ' rare';
        } else if (item.isCursed) {
            className += ' cursed';
        } else if (item.property && item.property.trim() !== '') {
            className += ' enchanted';
        } else {
            className += ' mundane';
        }
       
        const bonusIndicator = item.isBonusRoll ? '<div class="bonus-roll-note">(Bonus Roll)</div>' : '';
       
        html += `
            <div class="${className}" data-item-index="${index}">
                <button class="delete-btn" onclick="this.parentElement.remove(); updateTotalValue();">&times;</button>
                <button class="copy-btn" onclick="copyLootItem(this);">⧉</button>
                <h3>${item.name}</h3>
                <div class="loot-properties">${item.property} </div>
                <div class="loot-value">Value: ${item.value || 0} gp</div>
                ${bonusIndicator}
            </div>
        `;
    });
   
    html += `<div class="total-value">
        Total Value: ${totalValue} gp
    </div>`;
   
    resultsDiv.innerHTML = html;
    
    // Add click handlers and store item details
    results.forEach((item, index) => {
        const itemElement = resultsDiv.querySelector(`[data-item-index="${index}"]`);
        if (itemElement) {
            itemElement.itemDetails = item;
            itemElement.style.cursor = 'pointer';
            itemElement.addEventListener('click', function(e) {
                if (e.target.classList.contains('delete-btn') || 
                    e.target.classList.contains('copy-btn')) {
                    return;
                }
                showItemDetails(itemElement);
            });
        }
    });
}

        function updateTotalValue() {
            const resultsDiv = document.getElementById('results');
            const lootItems = resultsDiv.querySelectorAll('.loot-item');
            let totalValue = 0;
            
            lootItems.forEach(item => {
                const valueText = item.querySelector('.loot-value').textContent;
                const value = parseInt(valueText.match(/\d+/)[0]) || 0;
                totalValue += value;
            });
            
            const totalDiv = resultsDiv.querySelector('.total-value');
            if (totalDiv) {
                totalDiv.textContent = `Total Value: ${totalValue} gp`;
            }
        }

        function copyLootItem(button) {
            const lootItem = button.parentElement;
            const name = lootItem.querySelector('h3').textContent;
            const properties = lootItem.querySelector('.loot-properties').textContent;
            const value = lootItem.querySelector('.loot-value').textContent;
            
            let copyText = name;
            if (properties && properties.trim() !== '') {
                copyText += '\n' + properties.trim();
            }
            copyText += '\n' + value;
            
            navigator.clipboard.writeText(copyText).then(() => {
                const originalBg = button.style.backgroundColor;
                const originalColor = button.style.color;
                button.style.backgroundColor = '#4ca5e6';
                button.style.color = '#000000';
                
                setTimeout(() => {
                    button.style.backgroundColor = originalBg;
                    button.style.color = originalColor;           
                    button.textContent = '⧉';
                }, 500);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Copy failed. Please select and copy manually.');
            });
        }

        // Tab functionality
        function openTab(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-pane");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("tab-btn");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].classList.remove("active");
            }
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        }

    // Populate tables when page loads
        function populateTables() {
            // Potions table
            const potionsTableBody = document.querySelector('#potions-table tbody');
            potionTable.forEach(item => {
                const row = potionsTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.tier}</td>
                    <td>${item.name}</td>
                    <td>${item.property}</td>
                    <td>${item.action}</td>
                    <td>${item.value}</td>

                `;
            });

            // Weapons table
            const weaponsTableBody = document.querySelector('#weapons-table tbody');
            weaponTable.forEach(item => {
                const row = weaponsTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.tier}</td>
                    <td>${item.name}</td>
                    <td>${item.quality || '-'}</td>
                    <td>${item.class}</td>
                    <td>${item.damage}</td>
                    <td>${item.weaponProperties || '-'}</td>
                    <td>${item.proficiency}</td>
                    <td>${item.strReq}</td>
                    <td>${item.dexReq}</td>
                    <td>${item.prowessBonus}</td>
                    <td>${item.value}</td>
                `;
            });

            // Armor table
            const armorTableBody = document.querySelector('#armor-table tbody');
            armorTable.forEach(item => {
                const row = armorTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.tier}</td>
                    <td>${item.name}</td>
                    <td>${item.class}</td> 
                    <td>${item.armorClass}</td>
                    <td>${item.dexMax}</td>
                    <td>${item.proficiency}</td>
                    <td>${item.strReq}</td>
                    <td>${item.dexReq}</td>
                    <td>${item.prowessBonus}</td>
                    <td>${item.value}</td>
                `;
            });

            // Spells table
            const spellsTableBody = document.querySelector('#spells-table tbody');
            spellTable.forEach(item => {
                const row = spellsTableBody.insertRow();
                const nameCell = item.link ? 
                    `<a href="${item.link}" target="_blank" class="table-spell-link">${item.name}</a>` : 
                    item.name;
                row.innerHTML = `
                    <td>${item.spellLevel}</td>
                    <td>${nameCell}</td>
                    <td>${item.value}</td>
                `;
            });

            // Prefixes table
            const prefixesTableBody = document.querySelector('#prefixes-table tbody');
            prefixTable.forEach(item => {
                const row = prefixesTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.tier}</td>
                    <td>${item.name}</td>
                    <td>${item.property}</td>
                    
                `;
            });

            // Cursed prefixes table
            const cursedPrefixesTableBody = document.querySelector('#cursed-prefixes-table tbody');
            cursedPrefixTable.forEach(item => {
                const row = cursedPrefixesTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.tier}</td>
                    <td>${item.name}</td>
                    <td>${item.property}</td>
                `;
            });

            // Suffixes table
            const suffixesTableBody = document.querySelector('#suffixes-table tbody');
            suffixTable.forEach(item => {
                const row = suffixesTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.tier}</td>
                    <td>${item.name}</td>
                    <td>${item.property}</td>
                `;
            });

            // Cursed suffixes table
            const cursedSuffixesTableBody = document.querySelector('#cursed-suffixes-table tbody');
            cursedSuffixTable.forEach(item => {
                const row = cursedSuffixesTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.tier}</td>
                    <td>${item.name}</td>
                    <td>${item.property}</td>
                `;
            });

            // Prowess table
            const prowessTableBody = document.querySelector('#prowess-features-table tbody');
            prowessTable.forEach(item => {
                const row = prowessTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.prowessName}</td>
                    <td>${item.prowessFeature}</td>
                    <td>${item.prowessGearType}</td>
                `;
            });
            
            // Unique table
            const UniqueTableBody = document.querySelector('#unique-gear-table tbody');
            uniqueTable.forEach(item => {
                const row = UniqueTableBody.insertRow();

                row.innerHTML = `
                    <td>${item.uniqueName}</td>
                    <td>${item.baseItem}</td>
                    <td>${item.baseItemType}</td>
                    <td>${item.properties.map(p => `• ${p}`).join('<br>')}</td>
                    

                `;
            });           

            // Make all tables sortable
            initializeTableSorting();
        }

        // Table sorting functionality
        function initializeTableSorting() {
            const tables = document.querySelectorAll('.data-table');
            
            tables.forEach(table => {
                const headers = table.querySelectorAll('th');
                const tbody = table.querySelector('tbody');
                
                // Store original order
                const originalRows = Array.from(tbody.querySelectorAll('tr'));
                table.originalRows = originalRows.slice();
                
                headers.forEach((header, index) => {
                    header.classList.add('sortable');
                    header.setAttribute('data-column', index);
                    header.setAttribute('data-sort', 'default');
                    
                    header.addEventListener('click', function() {
                        sortTable(table, index, this);
                    });
                });
            });
        }

        function sortTable(table, columnIndex, headerElement) {
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const currentSort = headerElement.getAttribute('data-sort');
            
            // Clear all other headers' sort classes
            table.querySelectorAll('th').forEach(th => {
                if (th !== headerElement) {
                    th.classList.remove('sort-asc', 'sort-desc');
                    th.setAttribute('data-sort', 'default');
                }
            });
            
            let sortedRows;
            let newSortState;
            
            if (currentSort === 'default') {
                // Sort ascending (A-Z)
                sortedRows = rows.slice().sort((a, b) => {
                    const aValue = getCellValue(a, columnIndex);
                    const bValue = getCellValue(b, columnIndex);
                    return compareValues(aValue, bValue, true);
                });
                newSortState = 'asc';
                headerElement.classList.add('sort-asc');
                headerElement.classList.remove('sort-desc');
            } else if (currentSort === 'asc') {
                // Sort descending (Z-A)
                sortedRows = rows.slice().sort((a, b) => {
                    const aValue = getCellValue(a, columnIndex);
                    const bValue = getCellValue(b, columnIndex);
                    return compareValues(aValue, bValue, false);
                });
                newSortState = 'desc';
                headerElement.classList.add('sort-desc');
                headerElement.classList.remove('sort-asc');
            } else {
                // Return to default order
                sortedRows = table.originalRows.slice();
                newSortState = 'default';
                headerElement.classList.remove('sort-asc', 'sort-desc');
            }
            
            headerElement.setAttribute('data-sort', newSortState);
            
            // Clear tbody and append sorted rows
            tbody.innerHTML = '';
            sortedRows.forEach(row => tbody.appendChild(row));
        }

        function getCellValue(row, columnIndex) {
            const cell = row.cells[columnIndex];
            return cell ? cell.textContent.trim() : '';
        }

        function compareValues(a, b, ascending = true) {
            // Try to parse as numbers first
            const aNum = parseFloat(a);
            const bNum = parseFloat(b);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                // Both are numbers
                return ascending ? aNum - bNum : bNum - aNum;
            }
            
            // Treat as strings
            const aStr = a.toLowerCase();
            const bStr = b.toLowerCase();
            
            if (ascending) {
                return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
            } else {
                return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
            }
        }

        // Item Creator functionality
        let selectedAffixes = [];

        function updateBaseItems() {
            const itemType = document.getElementById('itemType').value;
            const baseItemSelect = document.getElementById('baseItem');
            const table = itemType === 'weapon' ? weaponTable : armorTable;
            
            baseItemSelect.innerHTML = '';
            
            table.forEach((item, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${item.name} (Tier ${item.tier}) - ${item.value}gp`;
                baseItemSelect.appendChild(option);
            });
            
            updateAffixOptions();
            generateCustomItem();
        }

        function updateQualityOptions() {
            const quality = document.getElementById('itemQuality').value;
            const enchantedOptions = document.getElementById('enchanted-options');
            const rareOptions = document.getElementById('rare-options');
            
            enchantedOptions.style.display = quality === 'enchanted' ? 'block' : 'none';
            rareOptions.style.display = quality === 'rare' ? 'block' : 'none';
            
            if (quality === 'rare') {
                selectedAffixes = [];
                updateRareAffixesList();
                updateRareAffixDropdown(); // Update the rare affix dropdown
            }
            
            generateCustomItem();
        }

        function updateRareAffixDropdown() {
            const affixType = document.getElementById('addAffixType').value;
            const affixSelect = document.getElementById('addAffixSelect');
            const itemType = document.getElementById('itemType').value;
            
            affixSelect.innerHTML = '';
            affixSelect.disabled = !affixType;
            
            if (!affixType) {
                affixSelect.innerHTML = '<option value="">Select affix type first</option>';
                return;
            }
            
            affixSelect.innerHTML = '<option value="">Choose an affix...</option>';
            
            if (affixType === 'prefix') {
                // Add normal prefixes
                prefixTable.forEach((prefix, index) => {
                    if (prefix.type === 'both' || prefix.type === itemType) {
                        const option = document.createElement('option');
                        option.value = `normal_${index}`;
                        option.textContent = `${prefix.name} (T${prefix.tier})`;
                        affixSelect.appendChild(option);
                    }
                });
                
                // Add cursed prefixes
                cursedPrefixTable.forEach((prefix, index) => {
                    if (prefix.type === 'both' || prefix.type === itemType) {
                        const option = document.createElement('option');
                        option.value = `cursed_${index}`;
                        option.textContent = `${prefix.name} (T${prefix.tier}) (Cursed)`;
                        affixSelect.appendChild(option);
                    }
                });
            } else if (affixType === 'suffix') {
                // Add normal suffixes
                suffixTable.forEach((suffix, index) => {
                    if (suffix.type === 'both' || suffix.type === itemType) {
                        const option = document.createElement('option');
                        option.value = `normal_${index}`;
                        option.textContent = `${suffix.name} (T${suffix.tier})`;
                        affixSelect.appendChild(option);
                    }
                });
                
                // Add cursed suffixes
                cursedSuffixTable.forEach((suffix, index) => {
                    if (suffix.type === 'both' || suffix.type === itemType) {
                        const option = document.createElement('option');
                        option.value = `cursed_${index}`;
                        option.textContent = `${suffix.name} (T${suffix.tier}) (Cursed)`;
                        affixSelect.appendChild(option);
                    }
                });
            }
        }

        function addChosenAffix() {
            const affixType = document.getElementById('addAffixType').value;
            const affixValue = document.getElementById('addAffixSelect').value;
            
            if (!affixType || !affixValue) {
                alert('Please select both affix type and specific affix!');
                return;
            }
            
            const [type, index] = affixValue.split('_');
            let affix;
            let isCursed = false;
            let isPrefix = affixType === 'prefix';
            
            if (affixType === 'prefix') {
                if (type === 'normal') {
                    affix = prefixTable[parseInt(index)];
                } else if (type === 'cursed') {
                    affix = cursedPrefixTable[parseInt(index)];
                    isCursed = true;
                }
            } else if (affixType === 'suffix') {
                if (type === 'normal') {
                    affix = suffixTable[parseInt(index)];
                } else if (type === 'cursed') {
                    affix = cursedSuffixTable[parseInt(index)];
                    isCursed = true;
                }
            }
            
            if (!affix) {
                alert('Error finding the selected affix!');
                return;
            }
            
            // Check if this category is already used
            if (selectedAffixes.some(selected => selected.category === affix.category)) {
                alert(`An affix with category "${affix.category}" is already selected!`);
                return;
            }
            
            selectedAffixes.push({
                ...affix,
                isCursed: isCursed,
                isPrefix: isPrefix
            });
            
            updateRareAffixesList();
            generateCustomItem();
            
            // Reset the dropdowns
            document.getElementById('addAffixType').value = '';
            document.getElementById('addAffixSelect').innerHTML = '<option value="">Select affix type first</option>';
            document.getElementById('addAffixSelect').disabled = true;
        }

        function updateAffixOptions() {
            const itemType = document.getElementById('itemType').value;
            const prefixSelect = document.getElementById('prefixSelect');
            const suffixSelect = document.getElementById('suffixSelect');
            
            // Clear existing options
            prefixSelect.innerHTML = '<option value="">None</option>';
            suffixSelect.innerHTML = '<option value="">None</option>';
            
            // Populate prefixes (normal first, then cursed)
            prefixTable.forEach((prefix, index) => {
                if (prefix.type === 'both' || prefix.type === itemType) {
                    const option = document.createElement('option');
                    option.value = `normal_${index}`;
                    option.textContent = `${prefix.name} (T${prefix.tier})`;
                    prefixSelect.appendChild(option);
                }
            });
            
            cursedPrefixTable.forEach((prefix, index) => {
                if (prefix.type === 'both' || prefix.type === itemType) {
                    const option = document.createElement('option');
                    option.value = `cursed_${index}`;
                    option.textContent = `${prefix.name} (T${prefix.tier}) (Cursed)`;
                    prefixSelect.appendChild(option);
                }
            });
            
            // Populate suffixes (normal first, then cursed)
            suffixTable.forEach((suffix, index) => {
                if (suffix.type === 'both' || suffix.type === itemType) {
                    const option = document.createElement('option');
                    option.value = `normal_${index}`;
                    option.textContent = `${suffix.name} (T${suffix.tier})`;
                    suffixSelect.appendChild(option);
                }
            });
            
            cursedSuffixTable.forEach((suffix, index) => {
                if (suffix.type === 'both' || suffix.type === itemType) {
                    const option = document.createElement('option');
                    option.value = `cursed_${index}`;
                    option.textContent = `${suffix.name} (T${suffix.tier}) (Cursed)`;
                    suffixSelect.appendChild(option);
                }
            });
        }

        function addRandomAffix() {
            const itemType = document.getElementById('itemType').value;
            const isArmor = itemType === 'armor';
            
            // Combine all affix tables
            const allAffixes = [...prefixTable, ...suffixTable, ...cursedPrefixTable, ...cursedSuffixTable];
            const validAffixes = allAffixes.filter(affix => 
                (affix.type === 'both' || (isArmor && affix.type === 'armor') || (!isArmor && affix.type === 'weapon')) &&
                !selectedAffixes.some(selected => selected.category === affix.category)
            );
            
            if (validAffixes.length === 0) {
                alert('No more valid affixes available!');
                return;
            }
            
            const randomAffix = validAffixes[Math.floor(Math.random() * validAffixes.length)];
            const isCursed = cursedPrefixTable.includes(randomAffix) || cursedSuffixTable.includes(randomAffix);
            const isPrefix = prefixTable.includes(randomAffix) || cursedPrefixTable.includes(randomAffix);
            
            selectedAffixes.push({
                ...randomAffix,
                isCursed: isCursed,
                isPrefix: isPrefix
            });
            
            updateRareAffixesList();
            generateCustomItem();
        }

        function removeAffix(index) {
            selectedAffixes.splice(index, 1);
            updateRareAffixesList();
            generateCustomItem();
        }

        function updateRareAffixesList() {
            const affixList = document.getElementById('rareAffixes');
            affixList.innerHTML = '';
            
            selectedAffixes.forEach((affix, index) => {
                const affixDiv = document.createElement('div');
                affixDiv.className = 'affix-item';
                affixDiv.innerHTML = `
                    <span>${affix.name}${affix.isCursed ? ' (Cursed)' : ''}</span>
                    <button class="remove-affix" onclick="removeAffix(${index})">×</button>
                `;
                affixList.appendChild(affixDiv);
            });
            
            if (selectedAffixes.length === 0) {
                affixList.innerHTML = '<div style="text-align: center; color: #888; font-style: italic;">No affixes selected</div>';
            }
        }

function generateCustomItem() {
    const itemType = document.getElementById('itemType').value;
    const baseItemIndex = parseInt(document.getElementById('baseItem').value) || 0;
    const quality = document.getElementById('itemQuality').value;
    
    const baseTable = itemType === 'weapon' ? weaponTable : armorTable;
    const baseItem = baseTable[baseItemIndex];
    
    if (!baseItem) return null;
    
    let item = {
        name: baseItem.name,
        property: "",
        value: baseItem.value,
        multiplier: 1,
        type: 'gear',
        baseItemRef: baseItemIndex,
        baseItemType: itemType,
        affixes: []
    };
    
    let className = 'created-item';
    let isCursed = false;
    
    if (quality === 'enchanted') {
        const prefixValue = document.getElementById('prefixSelect').value;
        const suffixValue = document.getElementById('suffixSelect').value;
        
        let properties = [];
        
        if (prefixValue) {
            const [type, index] = prefixValue.split('_');
            let prefix;
            let prefixIsCursed = false;
            
            if (type === 'normal') {
                prefix = prefixTable[parseInt(index)];
            } else if (type === 'cursed') {
                prefix = cursedPrefixTable[parseInt(index)];
                prefixIsCursed = true;
                isCursed = true;
            }
            
            if (prefix) {
                item.name = `${prefix.name} ${item.name}`;
                properties.push(`• ${prefix.property}`);
                item.multiplier += prefix.multiplier;
                
                item.affixes.push({
                    name: prefix.name,
                    property: prefix.property,
                    isPrefix: true,
                    isCursed: prefixIsCursed
                });
            }
        }
        
        if (suffixValue) {
            const [type, index] = suffixValue.split('_');
            let suffix;
            let suffixIsCursed = false;
            
            if (type === 'normal') {
                suffix = suffixTable[parseInt(index)];
            } else if (type === 'cursed') {
                suffix = cursedSuffixTable[parseInt(index)];
                suffixIsCursed = true;
                isCursed = true;
            }
            
            if (suffix) {
                item.name = `${item.name} ${suffix.name}`;
                properties.push(`• ${suffix.property}`);
                item.multiplier += suffix.multiplier;
                
                item.affixes.push({
                    name: suffix.name,
                    property: suffix.property,
                    isPrefix: false,
                    isCursed: suffixIsCursed
                });
            }
        }
        
        item.property = properties.join('<br>');
        className += isCursed ? ' preview-cursed' : ' preview-enchanted';
        if (properties.length > 0) item.value += 15;
        
    } else if (quality === 'rare') {
        const name1 = document.getElementById('rareName1').value;
        const name2 = document.getElementById('rareName2').value;
        
        item.name = `"${name1} ${name2}"<br>${baseItem.name}<br>`;
        item.isRare = true;
        className += ' preview-rare';
        
        let properties = [];
        selectedAffixes.forEach(affix => {
            properties.push(`• ${affix.property}`);
            item.multiplier += affix.multiplier;
            if (affix.isCursed) isCursed = true;
            
            item.affixes.push({
                name: affix.name,
                property: affix.property,
                isPrefix: affix.isPrefix,
                isCursed: affix.isCursed
            });
        });
        
        item.property = properties.join('<br>');
        if (isCursed) className = className.replace('preview-rare', 'preview-cursed');
        
    } else {
        className += ' preview-mundane';
    }
    
    if (isCursed) item.isCursed = true;
    if (quality === 'rare') item.isRare = true;
    
    item.value = Math.max(1, Math.floor(item.value * Math.max(0.1, item.multiplier)));
    
    updateItemPreview(item, className);
    
    return item;
}

        function updateItemPreview(item, className) {
            const previewDiv = document.getElementById('createdItem');
            previewDiv.className = className;
            previewDiv.innerHTML = `
                <div class="preview-item-name">${item.name}</div>
                <div class="preview-item-properties">${item.property || 'No special properties'}</div>
                <div class="preview-item-value">Value: ${item.value} gp</div>
            `;
        }

        function addCustomItemToResults() {
            const customItem = generateCustomItem();
            if (!customItem) {
                alert('Please configure an item first!');
                return;
            }
            
            // Get current results or initialize empty array
            const resultsDiv = document.getElementById('results');
            let currentItems = [];
            
            // If there are existing results, extract them
            const existingItems = resultsDiv.querySelectorAll('.loot-item');
            existingItems.forEach(itemElement => {
                const name = itemElement.querySelector('h3').textContent;
                const properties = itemElement.querySelector('.loot-properties').textContent.trim();
                const valueText = itemElement.querySelector('.loot-value').textContent;
                const value = parseInt(valueText.match(/\d+/)[0]) || 0;
                
                // Determine item type from CSS classes
                let type = 'gear';
                if (itemElement.classList.contains('gold')) type = 'gold';
                else if (itemElement.classList.contains('potion')) type = 'potion';
                else if (itemElement.classList.contains('magic-consumable')) type = 'magic-consumable';
                
                const item = {
                    name: name,
                    property: properties,
                    value: value,
                    type: type,
                    isRare: itemElement.classList.contains('rare'),
                    isCursed: itemElement.classList.contains('cursed')
                };
                
                currentItems.push(item);
            });
            
            // Add the new custom item
            currentItems.push(customItem);
            
            // Re-display all results
            displayResults(currentItems);
            
            // Switch to loot roller tab to show the results
            document.getElementById('loot-roller').classList.add('active');
            document.getElementById('item-creator').classList.remove('active');
            document.querySelector('.tab-btn[onclick="openTab(event, \'loot-roller\')"]').classList.add('active');
            document.querySelector('.tab-btn[onclick="openTab(event, \'item-creator\')"]').classList.remove('active');
            
            // Show success message
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = 'Added to Loot!';
            button.style.background = '#4ca5e6';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 1500);
        }

        function resetCreator() {
            document.getElementById('itemType').value = 'weapon';
            document.getElementById('itemQuality').value = 'mundane';
            document.getElementById('prefixSelect').value = '';
            document.getElementById('suffixSelect').value = '';
            selectedAffixes = [];
            
            updateBaseItems();
            updateQualityOptions();
        }

        function initializeCreator() {
            // Populate rare name selects
            const rareName1Select = document.getElementById('rareName1');
            const rareName2Select = document.getElementById('rareName2');
            
            rareName1.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                rareName1Select.appendChild(option);
            });
            
            rareName2.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                rareName2Select.appendChild(option);
            });
            
            // Set default rare names
            rareName1Select.value = rareName1[0];
            rareName2Select.value = rareName2[0];
            
            // Initialize base items and options
            updateBaseItems();
            updateQualityOptions();
            
            // Add event listeners for auto-preview
            document.getElementById('baseItem').addEventListener('change', generateCustomItem);
            document.getElementById('prefixSelect').addEventListener('change', generateCustomItem);
            document.getElementById('suffixSelect').addEventListener('change', generateCustomItem);
            document.getElementById('rareName1').addEventListener('change', generateCustomItem);
            document.getElementById('rareName2').addEventListener('change', generateCustomItem);
            document.getElementById('itemType').addEventListener('change', updateRareAffixDropdown);
            document.getElementById('addAffixType').addEventListener('change', updateRareAffixDropdown);
        }

        // Initialize tables when page loads
        document.addEventListener('DOMContentLoaded', function() {
            populateTables();
            initializeCreator();
            updateGenerateButton(); // Set initial button text
            
            // Add event listeners for live tier updates
            document.getElementById('characterLevel').addEventListener('input', updateGenerateButton);
            document.getElementById('dungeonLevel').addEventListener('input', updateGenerateButton);
        });
// Store for tracking selected item details
let selectedItemDetails = null;

function showItemDetails(itemElement) {
    // Get item data from the element
    const name = itemElement.querySelector('h3').innerHTML;
    const properties = itemElement.querySelector('.loot-properties').textContent.trim();
    const valueText = itemElement.querySelector('.loot-value').textContent;
    const value = parseInt(valueText.match(/\d+/)[0]) || 0;
    
    // Get item type from classes
    let itemType = null;
    if (itemElement.classList.contains('gold')) itemType = 'gold';
    else if (itemElement.classList.contains('potion')) itemType = 'potion';
    else if (itemElement.classList.contains('magic-consumable')) itemType = 'magic-consumable';
    else itemType = 'gear';
    
    // Get stored item details if available
    const storedDetails = itemElement.itemDetails;
    
    // Open the side pane
    openDetailPane(name, properties, value, itemType, storedDetails);
}

function openDetailPane(name, properties, value, itemType, details) {
    let pane = document.getElementById('detailPane');
    
    if (!pane) {
        pane = document.createElement('div');
        pane.id = 'detailPane';
        pane.className = 'detail-pane';
        document.body.appendChild(pane);
    }
    
    let content = '';
    
    if (itemType === 'gold') {
        content = `
            <div class="detail-header">
                <h2>Gold</h2>
                <button class="close-detail-btn" onclick="closeDetailPane()">&times;</button>
            </div>
            <div class="detail-body">
                <div class="detail-section">
                    <p class="gold-amount">${name}</p>
                </div>
            </div>
        `;
    } else if (itemType === 'potion') {
        content = `
            <div class="detail-header">
                <h2>Potion</h2>
                <button class="close-detail-btn" onclick="closeDetailPane()">&times;</button>
            </div>
            <div class="detail-body">
                <div class="detail-section">
                    <h3 class="section-title">${name}</h3>
                    ${details && details.action ? `<p><strong>Action Type:</strong> ${details.action}</p>` : ''}
                    <p><strong>Effect:</strong> ${properties}</p>
                </div>
            </div>
        `;
    } else if (itemType === 'magic-consumable') {
        const spellName = name.match(/of (.+)$/)?.[1] || '';
        const spell = spellTable.find(s => s.name === spellName);
        
        content = `
            <div class="detail-header">
                <h2>Spell Consumable</h2>
                <button class="close-detail-btn" onclick="closeDetailPane()">&times;</button>
            </div>
            <div class="detail-body">
                <div class="detail-section">
                    <h3 class="section-title">${name}</h3>
                    <p>${properties}</p>
                    ${spell && spell.link ? `<p><a href="${spell.link}" target="_blank" class="spell-link">View Spell Details on dnd5e.com</a></p>` : ''}
                </div>
            </div>
        `;
} else if (itemType === 'gear') {
    const isUnique = details && details.isUnique;
    const isRare = details && details.isRare;
    const baseItemRef = details && details.baseItemRef;
    const baseItemType = details && details.baseItemType;
    const affixes = details && details.affixes;
    
    let baseItem = null;
    if (baseItemRef !== undefined && baseItemType) {
        baseItem = baseItemType === 'weapon' ? weaponTable[baseItemRef] : armorTable[baseItemRef];
    }
    
    const headerTitle = isUnique ? 'Unique Item' : (baseItemType === 'weapon' ? 'Weapon' : baseItemType === 'armor' ? 'Armor' : 'Gear');
    
    content = `
        <div class="detail-header ${isUnique ? 'unique-header' : ''}">
            <h2>${headerTitle}</h2>
            <button class="close-detail-btn" onclick="closeDetailPane()">&times;</button>
        </div>
        <div class="detail-body">
            <div class="detail-section">
                <h3 class="section-title ${isUnique ? 'unique-title' : ''}">${name.replace(/<br>/g, ' ')}</h3>
            </div>
    `;
    
    // Display base item stats
    if (baseItem) {
        content += '<div class="detail-section"><h4 class="subsection-title" style="color: #ffffffff;">Base Stats</h4>';
        
        if (baseItemType === 'weapon') {
            content += `
                ${baseItem.quality ? `<p><strong>Quality:</strong> ${baseItem.quality}</p>` : ''}
                <p><strong>Class:</strong> ${baseItem.class}</p>
                <p><strong>Damage:</strong> ${baseItem.damage}</p>
                ${baseItem.weaponProperties && baseItem.weaponProperties !== '-' ? `<p><strong>Properties:</strong> ${baseItem.weaponProperties}</p>` : ''}
                <p><strong>Proficiency:</strong> ${baseItem.proficiency}</p>
                ${baseItem.strReq && baseItem.strReq !== '-' ? `<p><strong>Str Req:</strong> ${baseItem.strReq}</p>` : ''}
                ${baseItem.dexReq && baseItem.dexReq !== '-' ? `<p><strong>Dex Req:</strong> ${baseItem.dexReq}</p>` : ''}
                ${baseItem.prowessBonus && baseItem.prowessBonus !== '-' ? `<p><strong>Prowess:</strong> ${baseItem.prowessBonus}</p>` : ''}
            `;
        } else if (baseItemType === 'armor') {
            content += `
                <p><strong>Class:</strong> ${baseItem.class}</p>
                ${baseItem.armorClass && baseItem.armorClass !== '-' ? `<p><strong>Armor Class:</strong> ${baseItem.armorClass}</p>` : ''}
                ${baseItem.dexMax && baseItem.dexMax !== '-' ? `<p><strong>Dex Max:</strong> ${baseItem.dexMax}</p>` : ''}
                ${baseItem.proficiency && baseItem.proficiency !== '-' ? `<p><strong>Proficiency:</strong> ${baseItem.proficiency}</p>` : ''}
                ${baseItem.strReq && baseItem.strReq !== '-' ? `<p><strong>Str Req:</strong> ${baseItem.strReq}</p>` : ''}
                ${baseItem.dexReq && baseItem.dexReq !== '-' ? `<p><strong>Dex Req:</strong> ${baseItem.dexReq}</p>` : ''}
                ${baseItem.prowessBonus && baseItem.prowessBonus !== '-' ? `<p><strong>Prowess:</strong> ${baseItem.prowessBonus}</p>` : ''}
            `;
        }
        
        content += '</div>';
        
        // Display prowess feature if item has one
        if (baseItem.prowessBonus && baseItem.prowessBonus !== '-') {
            const prowessFeature = prowessTable.find(p => p.prowessName === baseItem.prowessBonus);
            if (prowessFeature) {
                content += `
                    <div class="detail-section">
                        <h4 class="subsection-title" style="color: #ceca95;">Prowess Feature</h4>
                        <div class="prowess-detail">
                            <p class="prowess-name"><strong>${prowessFeature.prowessName}</strong></p>
                            <p class="prowess-feature">${prowessFeature.prowessFeature}</p>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    // Display unique properties or affixes
    if (isUnique && details.uniqueData) {
        content += '<div class="detail-section"><h4 class="subsection-title">Unique Properties</h4>';
        details.uniqueData.properties.forEach(prop => {
            content += `
                <div class="unique-property">
                    <p>${prop}</p>
                </div>
            `;
        });
        content += '</div>';
    } else if (affixes && affixes.length > 0) {
        content += '<div class="detail-section"><h4 class="subsection-title">Magical Properties</h4>';
        affixes.forEach(affix => {
            content += `
                <div class="affix-detail">
                    <p class="affix-name"><strong>${affix.name}${affix.isCursed ? ' (Cursed)' : ''}</strong></p>
                    <p class="affix-property">${affix.property}</p>
                </div>
            `;
        });
        content += '</div>';
    } else if (properties && properties.trim() !== '') {
        content += `
            <div class="detail-section">
                <h4 class="subsection-title">Properties</h4>
                <div class="properties-text">${properties}</div>
            </div>
        `;
    }
    
    content += '</div>';
}
    
    pane.innerHTML = content;
    pane.classList.add('open');
}

function closeDetailPane() {
    const pane = document.getElementById('detailPane');
    if (pane) {
        pane.classList.remove('open');
    }
}

const potionTable = [
            {tier: 1, name: "Small Healing Potion", property: "Restores 1 Healing Surges", action:'Bonus Action', value:25, weight:10},
            {tier: 1, name: "Small Mana Potion", property: "Restores 2d4+2 Spell Points or 2 uses of short rest character features", action:'Bonus Action', value:40, weight:10},
            {tier: 2, name: "Small Rejuvination Potion", property: "Restores 1 Healing Surges, 1d4+1 Spell Points, and 1 use of short rest character features", action:'Action', value:100, weight:4},
            {tier: 2, name: "Large Healing Potion", property: "Restores 3 Healing Surges", action:'Bonus Action', value:350, weight:15},
            {tier: 3, name: "Large Mana Potion", property: "Restores 4d4+4 Spell Points or 4 uses of short rest character features", action:'Bonus Action', value:560, weight:15},
            {tier: 3, name: "Large Rejuvination Potion", property: "Restores 2 Healing Surges, 2d4+2 Spell Points, and 2 uses of short rest character features", action:'Ation', value:980, weight:4},
            {tier: 4, name: "Full Rejuvination Potion", property: "Gain the benefits of a Long Rest", action:'Action', value:1200, weight:2},
        ];
const spellTable = [
            {name: "Acid Splash", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:acid-splash"},
            {name: "Blade Ward", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:blade-ward"},
            {name: "Booming Blade", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:booming-blade"},
            {name: "Chill Touch", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:chill-touch"},
            {name: "Eldritch Blast", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:eldritch-blast"},
            {name: "Fire Bolt", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:fire-bolt"},
            {name: "Frostbite", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:frostbite"},
            {name: "Green-Flame Blade", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:green-flame-blade"},
            {name: "Guidance", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:guidance"},
            {name: "Gust", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:gust"},
            {name: "Infestation", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:infestation"},
            {name: "Lightning Lure", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:lightning-lure"},
            {name: "Mage Hand", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:mage-hand"},
            {name: "Magic Stone", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:magic-stone"},
            {name: "Mind Sliver", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:mind-sliver"},
            {name: "Poison Spray", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:poison-spray"},
            {name: "Primal Savagery", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:primal-savagery"},
            {name: "Produce Flame", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:produce-flame"},
            {name: "Ray of Frost", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:ray-of-frost"},
            {name: "Sacred Flame", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:sacred-flame"},
            {name: "Shillelagh", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:shillelagh"},
            {name: "Shocking Grasp", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:shocking-grasp"},
            {name: "Spare the Dying", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:spare-the-dying"},
            {name: "Sword Burst", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:sword-burst"},
            {name: "Thorn Whip", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:thorn-whip"},
            {name: "Thunderclap", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:thunderclap"},
            {name: "Toll the Dead", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:toll-the-dead"},
            {name: "True Strike", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:true-strike"},
            {name: "Vicious Mockery", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:vicious-mockery"},
            {name: "Word of Radiance", value:10, spellLevel: 0, link: "https://dnd5e.wikidot.com/spell:word-of-radiance"},
            {name: "Armor of Agathys", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:armor-of-agathys"},
            {name: "Arms of Hadar", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:arms-of-hadar"},
            {name: "Bane", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:bane"},
            {name: "Bless", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:bless"},
            {name: "Burning Hands", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:burning-hands"},
            {name: "Catapult", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:catapult"},
            {name: "Chaos Bolt", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:chaos-bolt"},
            {name: "Chromatic Orb", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:chromatic-orb"},
            {name: "Compelled Duel", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:compelled-duel"},
            {name: "Cure Wounds", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:cure-wounds"},
            {name: "Detect Magic", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:detect-magic"},
            {name: "Detect Poison and Disease", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:detect-poison-and-disease"},
            {name: "Dissonant Whispers", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:dissonant-whispers"},
            {name: "Divine Favor", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:divine-favor"},
            {name: "Earth Tremor", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:earth-tremor"},
            {name: "Ensnaring Strike", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:ensnaring-strike"},
            {name: "Entangle", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:entangle"},
            {name: "Expeditious Retreat", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:expeditious-retreat"},
            {name: "Faerie Fire", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:faerie-fire"},
            {name: "False Life", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:false-life"},
            {name: "Find Familiar", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:find-familiar"},
            {name: "Fog Cloud", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:fog-cloud"},
            {name: "Frost Fingers", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:frost-fingers"},
            {name: "Gift of Alacrity", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:gift-of-alacrity"},
            {name: "Goodberry", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:goodberry"},
            {name: "Grease", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:grease"},
            {name: "Guiding Bolt", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:guiding-bolt"},
            {name: "Hail of Thorns", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:hail-of-thorns"},
            {name: "Healing Word", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:healing-word"},
            {name: "Hellish Rebuke", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:hellish-rebuke"},
            {name: "Heroism", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:heroism"},
            {name: "Hex", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:hex"},
            {name: "Hunter's Mark", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:hunters-mark"},
            {name: "Ice Knife", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:inflict-wounds"},
            {name: "Inflict Wounds", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:inflict-wounds"},
            {name: "Mage Armor", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:mage-armor"},
            {name: "Magic Missile", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:magic-missile"},
            {name: "Protection from Evil and Good", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:protection-from-evil-and-good"},
            {name: "Ray of Sickness", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:ray-of-sickness"},
            {name: "Sanctuary", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:sanctuary"},
            {name: "Searing Smite", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:searing-smite"},
            {name: "Shield", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:shield"},
            {name: "Shield of Faith", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:shield-of-faith"},
            {name: "Sleep", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:sleep"},
            {name: "Tasha's Caustic Brew", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:tashas-caustic-brew"},
            {name: "Tasha's Hideous Laughter", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:tashas-hideous-laughter"},
            {name: "Thunderous Smite", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:thunderous-smite"},
            {name: "Thunderwave", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:thunderwave"},
            {name: "Wrathful Smite", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:wrathful-smite"},
            {name: "Zephyr Strike", value:60, spellLevel: 1, link: "https://dnd5e.wikidot.com/spell:zephyr-strike"},
            {name: "Aganazzar's Scorcher", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:aganazzars-scorcher"},
            {name: "Aid", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:aid"},
            {name: "Barkskin", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:barkskin"},
            {name: "Blindness/Deafness", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Blindness-Deafness"},
            {name: "Blur", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Blur"},
            {name: "Branding Smite", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Branding-Smite"},
            {name: "Calm Emotions", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Calm-Emotions"},
            {name: "Cloud of Daggers", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Cloud-of-Daggers"},
            {name: "Cordon of Arrows", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Cordon-of-Arrows"},
            {name: "Crown of Madness", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Crown-of-Madness"},
            {name: "Darkness", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Darkness"},
            {name: "Darkvision", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Darkvision"},
            {name: "Dragon's Breath", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Dragons-Breath"},
            {name: "Enlarge/Reduce", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Enlarge-Reduce"},
            {name: "Flame Blade", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Flame-Blade"},
            {name: "Flaming Sphere", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Flaming-Sphere"},
            {name: "Healing Spirit", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Healing-Spirit"},
            {name: "Heat Metal", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Heat-Metal"},
            {name: "Hold Person", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Hold-Person"},
            {name: "Invisibility", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Invisibility"},
            {name: "Kinetic Jaunt", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Kinetic-Jaunt"},
            {name: "Lesser Restoration", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Lesser-Restoration"},
            {name: "Magic Weapon", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Magic-Weapon"},
            {name: "Melf's Acid Arrow", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Melfs-Acid-Arrow"},
            {name: "Mind Spike", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Mind-Spike"},
            {name: "Mirror Image", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Mirror-Image"},
            {name: "Misty Step", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Misty-Step"},
            {name: "Phantasmal Force", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Phantasmal-Force"},
            {name: "Prayer of Healing", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Prayer-of-Healing"},
            {name: "Pyrotechnics", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Pyrotechnics"},
            {name: "Ray of Enfeeblement", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Ray-of-Enfeeblement"},
            {name: "Scorching Ray", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Scorching-Ray"},
            {name: "Shadow Blade", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Shadow-Blade"},
            {name: "Shatter", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Shatter"},
            {name: "Silence", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Silence"},
            {name: "Spike Growth", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Spike-Growth"},
            {name: "Spiritual Weapon", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Spiritual-Weapon"},
            {name: "Tasha's Mind Whip", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Tashas-Mind-Whip"},
            {name: "Web", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Web"},
            {name: "Wither and Bloom", value:120, spellLevel: 2, link: "https://dnd5e.wikidot.com/spell:Wither-and-Bloom"},
            {name: "Animate Dead", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Animate-Dead"},
            {name: "Aura of Vitality", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Aura-of-Vitality"},
            {name: "Beacon of Hope", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Beacon-of-Hope"},
            {name: "Blinding Smite", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Blinding-Smite"},
            {name: "Blink", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Blink"},
            {name: "Conjure Barrage", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Conjure-Barrage"},
            {name: "Counterspell", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Counterspell"},
            {name: "Crusader's Mantle", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Crusaders-Mantle"},
            {name: "Daylight", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Daylight"},
            {name: "Dispel Magic", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Dispel-Magic"},
            {name: "Elemental Weapon", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Elemental-Weapon"},
            {name: "Erupting Earth", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Erupting-Earth"},
            {name: "Fear", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Fear"},
            {name: "Fireball", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Fireball"},
            {name: "Flame Arrows", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Flame-Arrows"},
            {name: "Fly", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Fly"},
            {name: "Glyph of Warding", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Glyph-of-Warding"},
            {name: "Haste", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Haste"},
            {name: "Hunger Of Hadar", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Hunger-Of-Hadar"},
            {name: "Hypnotic Pattern", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Hypnotic-Pattern"},
            {name: "Intellect Fortress", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Intellect-Fortress"},
            {name: "Life Transference", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Life-Transference"},
            {name: "Lightning Arrow", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Lightning-Arrow"},
            {name: "Lightning Bolt", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Lightning-Bolt"},
            {name: "Major Image", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Major-Image"},
            {name: "Mass Healing Word", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Mass-Healing-Word"},
            {name: "Meld into Stone", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Meld-into-Stone"},
            {name: "Melf's Minute Meteors", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Melfs-Minute-Meteors"},
            {name: "Pulse Wave", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Pulse-Wave"},
            {name: "Remove Curse", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Remove-Curse"},
            {name: "Revivify", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Revivify"},
            {name: "Slow", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Slow"},
            {name: "Spirit Guardians", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Spirit-Guardians"},
            {name: "Summon Lesser Demons", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Summon-Lesser-Demons"},
            {name: "Summon Shadowspawn", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Summon-Shadowspawn"},
            {name: "Summon Undead", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Summon-Undead"},
            {name: "Thunder Step", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Thunder-Step"},
            {name: "Vampiric Touch", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Vampiric-Touch"},
            {name: "Wall of Water", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Wall-of-Water"},
            {name: "Wind Wall", value:200, spellLevel: 3, link: "https://dnd5e.wikidot.com/spell:Wind-Wall"},
            {name: "Aura of Life", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Aura-of-Life"},
            {name: "Aura of Purity", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Aura-of-Purity"},
            {name: "Banishment", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Banishment"},
            {name: "Blight", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Blight"},
            {name: "Confusion", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Confusion"},
            {name: "Conjure Minor Elementals", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Conjure-Minor-Elementals"},
            {name: "Death Ward", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Death-Ward"},
            {name: "Dimension Door", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Dimension-Door"},
            {name: "Dominate Beast", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Dominate-Beast"},
            {name: "Evard's Black Tentacles", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Evards-Black-Tentacles"},
            {name: "Fire Shield", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Fire-Shield"},
            {name: "Grasping Vine", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Grasping-Vine"},
            {name: "Gravity Sinkhole", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Gravity-Sinkhole"},
            {name: "Greater Invisibility", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Greater-Invisibility"},
            {name: "Guardian of Faith", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Guardian-of-Faith"},
            {name: "Guardian of Nature", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Guardian-of-Nature"},
            {name: "Otiluke's Resilient Sphere", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Otilukes-Resilient-Sphere"},
            {name: "Phantasmal Killer", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Phantasmal-Killer"},
            {name: "Polymorph", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Polymorph"},
            {name: "Raulothim's Psychic Lance", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Raulothims-Psychic-Lance"},
            {name: "Shadow Of Moil", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Shadow-Of-Moil"},
            {name: "Staggering Smite", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Staggering-Smite"},
            {name: "Stone Shape", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Stone-Shape"},
            {name: "Stoneskin", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Stoneskin"},
            {name: "Storm Sphere", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Storm-Sphere"},
            {name: "Summon Aberration", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Summon-Aberration"},
            {name: "Summon Construct", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Summon-Construct"},
            {name: "Summon Elemental", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Summon-Elemental"},
            {name: "Summon Greater Demon", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Summon-Greater-Demon"},
            {name: "Wall of Fire", value:320, spellLevel: 4, link: "https://dnd5e.wikidot.com/spell:Wall-of-Fire"},
            {name: "Animate Objects", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Animate-Objects"},
            {name: "Banishing Smite", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Banishing-Smite"},
            {name: "Bigby's Hand", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Bigbys-Hand"},
            {name: "Circle of Power", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Circle-of-Power"},
            {name: "Cloudkill", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Cloudkill"},
            {name: "Cone of Cold", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Cone-of-Cold"},
            {name: "Conjure Elemental", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Conjure-Elemental"},
            {name: "Conjure Volley", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Conjure-Volley"},
            {name: "Contagion", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Contagion"},
            {name: "Danse Macabre", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Danse-Macabre"},
            {name: "Dawn", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Dawn"},
            {name: "Destructive Wave", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Destructive-Wave"},
            {name: "Dispel Evil and Good", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Dispel-Evil-and-Good"},
            {name: "Far Step", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Far-Step"},
            {name: "Flame Strike", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Flame-Strike"},
            {name: "Hold Monster", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Hold-Monster"},
            {name: "Holy Weapon", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Holy-Weapon"},
            {name: "Immolation", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Immolation"},
            {name: "Insect Plague", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Insect-Plague"},
            {name: "Negative Energy Flood", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Negative-Energy-Flood"},
            {name: "Passwall", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Passwall"},
            {name: "Steel Wind Strike", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Steel-Wind-Strike"},
            {name: "Summon Celestial", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Summon-Celestial"},
            {name: "Swift Quiver", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Swift-Quiver"},
            {name: "Synaptic Static", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Synaptic-Static"},
            {name: "Telekinesis", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Telekinesis"},
            {name: "Temporal Shunt", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Temporal-Shunt"},
            {name: "Wall of Force", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Wall-of-Force"},
            {name: "Wall of Light", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Wall-of-Light"},
            {name: "Wall of Stone", value:640, spellLevel: 5, link: "https://dnd5e.wikidot.com/spell:Wall-of-Stone"},
            {name: "Blade Barrier", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Blade-Barrier"},
            {name: "Bones of the Earth", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Bones-of-the-Earth"},
            {name: "Chain Lightning", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Chain-Lightning"},
            {name: "Circle of Death", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Circle-of-Death"},
            {name: "Disintegrate", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Disintegrate"},
            {name: "Gravity Fissure", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Gravity-Fissure"},
            {name: "Harm", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Harm"},
            {name: "Heal", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Heal"},
            {name: "Investiture of Flame", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Investiture-of-Flame"},
            {name: "Investiture of Ice", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Investiture-of-Ice"},
            {name: "Investiture of Stone", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Investiture-of-Stone"},
            {name: "Mental Prison", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Mental-Prison"},
            {name: "Scatter", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Scatter"},
            {name: "Soul Cage", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Soul-Cage"},
            {name: "Summon Fiend", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Summon-Fiend"},
            {name: "Sunbeam", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Sunbeam"},
            {name: "Tasha's Otherworldly Guise", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Tashas-Otherworldly-Guise"},
            {name: "True Seeing", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:True-Seeing"},
            {name: "Wall of Ice", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Wall-of-Ice"},
            {name: "Wall of Thorns", value:1280, spellLevel: 6, link: "https://dnd5e.wikidot.com/spell:Wall-of-Thorns"},
            {name: "Crown of Stars", value:2560, spellLevel: 7, link: "https://dnd5e.wikidot.com/spell:Crown-of-Stars"},
            {name: "Finger of Death", value:2560, spellLevel: 7, link: "https://dnd5e.wikidot.com/spell:Finger-of-Death"},
            {name: "Fire Storm", value:2560, spellLevel: 7, link: "https://dnd5e.wikidot.com/spell:Fire-Storm"},
            {name: "Forcecage", value:2560, spellLevel: 7, link: "https://dnd5e.wikidot.com/spell:Forcecage"},
            {name: "Mordenkainen's Sword", value:2560, spellLevel: 7, link: "https://dnd5e.wikidot.com/spell:Mordenkainens-Sword"},
            {name: "Power Word: Pain", value:2560, spellLevel: 7, link: "https://dnd5e.wikidot.com/spell:Power-Word-Pain"},
            {name: "Prismatic Spray", value:2560, spellLevel: 7, link: "https://dnd5e.wikidot.com/spell:Prismatic-Spray"},
            {name: "Regenerate", value:2560, spellLevel: 7, link: "https://dnd5e.wikidot.com/spell:Regenerate"},
            {name: "Reverse Gravity", value:2560, spellLevel: 7, link: "https://dnd5e.wikidot.com/spell:Reverse-Gravity"},
            {name: "Whirlwind", value:2560, spellLevel: 7, link: "https://dnd5e.wikidot.com/spell:Whirlwind"},
            {name: "Abi-Dalzim's Horrid Wilting", value:5120, spellLevel: 8, link: "https://dnd5e.wikidot.com/spell:Abi-Dalzims-Horrid-Wilting"},
            {name: "Animal Shapes", value:5120, spellLevel: 8, link: "https://dnd5e.wikidot.com/spell:Animal-Shapes"},
            {name: "Antipathy/Sympathy", value:5120, spellLevel: 8, link: "https://dnd5e.wikidot.com/spell:Antipathy-Sympathy"},
            {name: "Dark Star", value:5120, spellLevel: 8, link: "https://dnd5e.wikidot.com/spell:Dark-Star"},
            {name: "Dominate Monster", value:5120, spellLevel: 8, link: "https://dnd5e.wikidot.com/spell:Dominate-Monster"},
            {name: "Earthquake", value:5120, spellLevel: 8, link: "https://dnd5e.wikidot.com/spell:Earthquake"},
            {name: "Holy Aura", value:5120, spellLevel: 8, link: "https://dnd5e.wikidot.com/spell:Holy-Aura"},
            {name: "Mind Blank", value:5120, spellLevel: 8, link: "https://dnd5e.wikidot.com/spell:Mind-Blank"},
            {name: "Power Word: Stun", value:5120, spellLevel: 8, link: "https://dnd5e.wikidot.com/spell:Power-Word-Stun"},
            {name: "Sunburst", value:5120, spellLevel: 8, link: "https://dnd5e.wikidot.com/spell:Sunburst"},
            {name: "Blade of Disaster", value:10000, spellLevel: 9, link: "https://dnd5e.wikidot.com/spell:Blade-of-Disaster"},
            {name: "Foresight", value:10000, spellLevel: 9, link: "https://dnd5e.wikidot.com/spell:Foresight"},
            {name: "Invulnerability", value:10000, spellLevel: 9, link: "https://dnd5e.wikidot.com/spell:Invulnerability"},
            {name: "Mass Heal", value:10000, spellLevel: 9, link: "https://dnd5e.wikidot.com/spell:Mass-Heal"},
            {name: "Meteor Swarm", value:10000, spellLevel: 9, link: "https://dnd5e.wikidot.com/spell:Meteor-Swarm"},
            {name: "Prismatic Wall", value:10000, spellLevel: 9, link: "https://dnd5e.wikidot.com/spell:Prismatic-Wall"},
            {name: "Psychic Scream", value:10000, spellLevel: 9, link: "https://dnd5e.wikidot.com/spell:Psychic-Scream"},
            {name: "Ravenous Void", value:10000, spellLevel: 9, link: "https://dnd5e.wikidot.com/spell:Ravenous-Void"},
            {name: "Time Stop", value:10000, spellLevel: 9, link: "https://dnd5e.wikidot.com/spell:Time-Stop"},
            {name: "Wish", value:10000, spellLevel: 9, link: "https://dnd5e.wikidot.com/spell:"},
        ];
const armorTable = [
            {tier: 1, weight: 7, name: "Sandals", class: "Feet", armorClass: "-", proficiency: "-", strReq: "-", dexReq: "-", dexMax: "-", prowessBonus: "-", value: 1}, 
            {tier: 1, weight: 7, name: "Shoes", class: "Feet", armorClass: "-", proficiency: "-", strReq: "-", dexReq: "15", dexMax: "-", prowessBonus: "Dashing", value: 1}, 
            {tier: 1, weight: 7, name: "Leather Boots", class: "Feet", armorClass: "-", proficiency: "Light", strReq: "-", dexReq: "11", dexMax: "-", prowessBonus: "1 AP", value: 2}, 
            {tier: 1, weight: 7, name: "Sash", class: "Belt", armorClass: "-", proficiency: "-", strReq: "-", dexReq: "17", dexMax: "-", prowessBonus: "Dashing", value: 1}, 
            {tier: 1, weight: 7, name: "Belt", class: "Belt", armorClass: "-", proficiency: "Light", strReq: "-", dexReq: "13", dexMax: "-", prowessBonus: "1 AP", value: 2}, 
            {tier: 1, weight: 7, name: "Leather Gloves", class: "Gloves", armorClass: "-", proficiency: "-", strReq: "-", dexReq: "-", dexMax: "-", prowessBonus: "-", value: 3}, 
            {tier: 1, weight: 7, name: "Heavy Leather Gloves", class: "Gloves", armorClass: "-", proficiency: "Light", strReq: "-", dexReq: "-", dexMax: "-", prowessBonus: "1 AP", value: 5}, 
            {tier: 1, weight: 7, name: "Leather Cap", class: "Head", armorClass: "-", proficiency: "-", strReq: "-", dexReq: "-", dexMax: "-", prowessBonus: "-", value: 5}, 
            {tier: 1, weight: 7, name: "Skull Helmet", class: "Head", armorClass: "-", proficiency: "Medium", strReq: "13", dexReq: "-", dexMax: "-", prowessBonus: "2 AP", value: 9}, 
            {tier: 1, weight: 9, name: "Buckler", class: "Shield", armorClass: "1", proficiency: "Shield", strReq: "-", dexReq: "13", dexMax: "-", prowessBonus: "2 AP", value: 10}, 
            {tier: 1, weight: 10, name: "Shield", class: "Shield", armorClass: "2", proficiency: "Shield", strReq: "15", dexReq: "-", dexMax: "-", prowessBonus: "-", value: 15}, 
            {tier: 1, weight: 8, name: "Cloak", class: "Torso", armorClass: "-", proficiency: "-", strReq: "-", dexReq: "-", dexMax: "Dex Mod", prowessBonus: "-", value: 12}, 
            {tier: 1, weight: 8, name: "Cape", class: "Torso", armorClass: "-", proficiency: "-", strReq: "-", dexReq: "13", dexMax: "Dex Mod", prowessBonus: "1 AP", value: 14}, 
            {tier: 1, weight: 8, name: "Quilted Armor", class: "Torso", armorClass: "1", proficiency: "-", strReq: "-", dexReq: "14", dexMax: "Dex Mod", prowessBonus: "2 AP", value: 18}, 
            {tier: 1, weight: 8, name: "Gambeson", class: "Torso", armorClass: "1", proficiency: "-", strReq: "-", dexReq: "15", dexMax: "Dex Mod", prowessBonus: "+1 AC", value: 20}, 
            {tier: 1, weight: 8, name: "Padded Armor", class: "Torso", armorClass: "1", proficiency: "Light", strReq: "-", dexReq: "11", dexMax: "Dex Mod", prowessBonus: "1 AP", value: 15}, 
            {tier: 1, weight: 8, name: "Leather Armor", class: "Torso", armorClass: "1", proficiency: "Light", strReq: "-", dexReq: "15", dexMax: "Dex Mod", prowessBonus: "3 AP", value: 25}, 
            {tier: 1, weight: 8, name: "Sudded Leather Armor", class: "Torso", armorClass: "2", proficiency: "Light", strReq: "11", dexReq: "-", dexMax: "Dex Mod", prowessBonus: "1 AP", value: 45}, 
            {tier: 1, weight: 8, name: "Hide Armor", class: "Torso", armorClass: "3", proficiency: "Light", strReq: "12", dexReq: "-", dexMax: "Dex Max 2", prowessBonus: "Dex Max 3", value: 15}, 
            {tier: 1, weight: 8, name: "Chain Shirt", class: "Torso", armorClass: "3", proficiency: "Medium", strReq: "11", dexReq: "-", dexMax: "Dex Max 2", prowessBonus: "1 AP", value: 50}, 
            {tier: 1, weight: 8, name: "Chain Mail", class: "Torso", armorClass: "6", proficiency: "Heavy", strReq: "13", dexReq: "-", dexMax: "-", prowessBonus: "2 AP", value: 75}, 
            {tier: 2, weight: 35, name: "Ring", class: "Jewelrey", armorClass: "-", proficiency: "-", strReq: "(Cha 11)", dexReq: "(Cha 11)", dexMax: "-", prowessBonus: "1 AP", value: 750}, 
            {tier: 2, weight: 35, name: "Amulet", class: "Jewelrey", armorClass: "-", proficiency: "-", strReq: "(Int 11)", dexReq: "(Int 11)", dexMax: "-", prowessBonus: "2 AP", value: 900}, 
            {tier: 2, weight: 11, name: "Heavy Leather Boots", class: "Feet", armorClass: "-", proficiency: "Medium", strReq: "-", dexReq: "15", dexMax: "-", prowessBonus: "Dashing", value: 170}, 
            {tier: 2, weight: 11, name: "Chain Boots", class: "Feet", armorClass: "-", proficiency: "Medium", strReq: "14", dexReq: "-", dexMax: "-", prowessBonus: "2 AP", value: 190}, 
            {tier: 2, weight: 11, name: "Heavy Leather Belt", class: "Belt", armorClass: "-", proficiency: "Medium", strReq: "-", dexReq: "13", dexMax: "-", prowessBonus: "2 AP", value: 210}, 
            {tier: 2, weight: 11, name: "Vambrace", class: "Gloves", armorClass: "-", proficiency: "Light", strReq: "-", dexReq: "13", dexMax: "-", prowessBonus: "2 AP", value: 230}, 
            {tier: 2, weight: 11, name: "Chain Gloves", class: "Gloves", armorClass: "-", proficiency: "Medium", strReq: "-", dexReq: "15", dexMax: "-", prowessBonus: "3 AP", value: 260}, 
            {tier: 2, weight: 11, name: "Bone Mask", class: "Head", armorClass: "-", proficiency: "Light", strReq: "12", dexReq: "-", dexMax: "-", prowessBonus: "1 AP", value: 300}, 
            {tier: 2, weight: 11, name: "Crown", class: "Head", armorClass: "-", proficiency: "Light", strReq: "-", dexReq: "-", dexMax: "-", prowessBonus: "1 AP", value: 450}, 
            {tier: 2, weight: 11, name: "Full Helm", class: "Head", armorClass: "-", proficiency: "Medium", strReq: "14", dexReq: "-", dexMax: "-", prowessBonus: "Fortified", value: 380}, 
            {tier: 2, weight: 12, name: "Kite Shield", class: "Shield", armorClass: "2", proficiency: "Light, Shield", strReq: "11", dexReq: "13", dexMax: "-", prowessBonus: "3 AP", value: 410}, 
            {tier: 2, weight: 12, name: "Large Shield", class: "Shield", armorClass: "2", proficiency: "Medium, Shield", strReq: "15", dexReq: "-", dexMax: "-", prowessBonus: "5 AP", value: 430}, 
            {tier: 2, weight: 12, name: "Hardened Leather Armor", class: "Torso", armorClass: "1", proficiency: "Light", strReq: "13", dexReq: "-", dexMax: "Dex Mod", prowessBonus: "4 AP", value: 350}, 
            {tier: 2, weight: 12, name: "Serpentskin Armor", class: "Torso", armorClass: "2", proficiency: "Light", strReq: "13", dexReq: "-", dexMax: "Dex Mod", prowessBonus: "2 AP", value: 500}, 
            {tier: 2, weight: 12, name: "Breast Plate", class: "Torso", armorClass: "4", proficiency: "Medium", strReq: "14", dexReq: "-", dexMax: "Dex Max 2", prowessBonus: "3 AP", value: 450}, 
            {tier: 2, weight: 12, name: "Cuirass", class: "Torso", armorClass: "4", proficiency: "Medium", strReq: "15", dexReq: "-", dexMax: "Dex Max 2", prowessBonus: "Dex Max 3", value: 580}, 
            {tier: 2, weight: 12, name: "Field Plate", class: "Torso", armorClass: "6", proficiency: "Medium", strReq: "16", dexReq: "-", dexMax: "Dex Max 2", prowessBonus: "Dex Max 3", value: 750}, 
            {tier: 2, weight: 12, name: "Scale Mail", class: "Torso", armorClass: "4", proficiency: "Medium", strReq: "14", dexReq: "-", dexMax: "Dex Max 2", prowessBonus: "2 AP", value: 650}, 
            {tier: 2, weight: 12, name: "Ring Mail", class: "Torso", armorClass: "4", proficiency: "Heavy", strReq: "12", dexReq: "-", dexMax: "-", prowessBonus: "Dex Max 2", value: 700}, 
            {tier: 2, weight: 12, name: "Wyrmhide Armor", class: "Torso", armorClass: "6", proficiency: "Heavy", strReq: "16", dexReq: "-", dexMax: "-", prowessBonus: "Dex Max 3", value: 740}, 
            {tier: 2, weight: 12, name: "Splint Mail", class: "Torso", armorClass: "7", proficiency: "Heavy", strReq: "15", dexReq: "-", dexMax: "-", prowessBonus: "3 AP", value: 800}, 
            {tier: 3, weight: 20, name: "Light Plate Boots", class: "Feet", armorClass: "-", proficiency: "Medium", strReq: "15", dexReq: "-", dexMax: "-", prowessBonus: "Anchored", value: 1000}, 
            {tier: 3, weight: 20, name: "Greaves", class: "Feet", armorClass: "-", proficiency: "Heavy", strReq: "17", dexReq: "-", dexMax: "-", prowessBonus: "3 AP", value: 1050}, 
            {tier: 3, weight: 20, name: "Mithril Coil", class: "Belt", armorClass: "-", proficiency: "Medium", strReq: "15", dexReq: "-", dexMax: "-", prowessBonus: "3 AP", value: 1100}, 
            {tier: 3, weight: 20, name: "Plated Belt", class: "Belt", armorClass: "1", proficiency: "Heavy", strReq: "17", dexReq: "-", dexMax: "-", prowessBonus: "-", value: 1150}, 
            {tier: 3, weight: 20, name: "Light Plate Gloves", class: "Gloves", armorClass: "-", proficiency: "Medium", strReq: "14", dexReq: "-", dexMax: "-", prowessBonus: "Reinforced", value: 1200}, 
            {tier: 3, weight: 20, name: "Diadem", class: "Head", armorClass: "-", proficiency: "-", strReq: "-", dexReq: "-", dexMax: "-", prowessBonus: "2 AP", value: 1300}, 
            {tier: 3, weight: 20, name: "Circlet", class: "Head", armorClass: "-", proficiency: "-", strReq: "-", dexReq: "-", dexMax: "-", prowessBonus: "2 AP", value: 1400}, 
            {tier: 3, weight: 20, name: "Great Helm", class: "Head", armorClass: "-", proficiency: "Heavy", strReq: "17", dexReq: "-", dexMax: "-", prowessBonus: "Reinforced", value: 1500}, 
            {tier: 3, weight: 20, name: "Tower Shield", class: "Shield", armorClass: "2", proficiency: "Heavy, Shield", strReq: "17", dexReq: "-", dexMax: "-", prowessBonus: "+1 AC", value: 1600}, 
            {tier: 3, weight: 21, name: "Shroud", class: "Torso", armorClass: "-", proficiency: "-", strReq: "-", dexReq: "17", dexMax: "Dex Mod", prowessBonus: "4 AP", value: 1700}, 
            {tier: 3, weight: 21, name: "Grand Robe", class: "Torso", armorClass: "1", proficiency: "-", strReq: "-", dexReq: "15", dexMax: "Dex Mod", prowessBonus: "3 AP", value: 1800}, 
            {tier: 3, weight: 21, name: "Light Plate", class: "Torso", armorClass: "4", proficiency: "Medium", strReq: "13", dexReq: "-", dexMax: "Dex Max 2", prowessBonus: "3 AP", value: 1900}, 
            {tier: 3, weight: 21, name: "Half Plate", class: "Torso", armorClass: "5", proficiency: "Medium", strReq: "15", dexReq: "-", dexMax: "Dex Max 2", prowessBonus: "2 AP", value: 2000}, 
            {tier: 3, weight: 21, name: "Demonhide Armor", class: "Torso", armorClass: "3", proficiency: "Medium", strReq: "12", dexReq: "-", dexMax: "Dex Max 2", prowessBonus: "3 AP", value: 2200}, 
            {tier: 3, weight: 21, name: "Archon Plate", class: "Torso", armorClass: "5", proficiency: "Medium", strReq: "17", dexReq: "-", dexMax: "Dex Max 2", prowessBonus: "5 AP", value: 2400}, 
            {tier: 3, weight: 21, name: "Mesh Armor", class: "Torso", armorClass: "5", proficiency: "Heavy", strReq: "15", dexReq: "-", dexMax: "-", prowessBonus: "Dex Max 2", value: 2500}, 
            {tier: 3, weight: 21, name: "Tigulated Mail", class: "Torso", armorClass: "5", proficiency: "Heavy", strReq: "14", dexReq: "-", dexMax: "-", prowessBonus: "3 AP", value: 2600}, 
            {tier: 3, weight: 21, name: "Full Plate Mail", class: "Torso", armorClass: "8", proficiency: "Heavy", strReq: "17", dexReq: "-", dexMax: "-", prowessBonus: "3 AP", value: 2800}, 
            {tier: 3, weight: 21, name: "Ancient Plate", class: "Torso", armorClass: "7", proficiency: "Heavy", strReq: "16", dexReq: "-", dexMax: "-", prowessBonus: "4 AP", value: 3000}, 
            {tier: 4, weight: 25, name: "Plate Gauntlets", class: "Gloves", armorClass: "1", proficiency: "Heavy", strReq: "16", dexReq: "-", dexMax: "-", prowessBonus: "Fortified", value: 4000}, 
            {tier: 4, weight: 25, name: "Armet", class: "Head", armorClass: "1", proficiency: "Heavy", strReq: "15", dexReq: "-", dexMax: "-", prowessBonus: "-", value: 4500}, 
            {tier: 4, weight: 25, name: "Gothic Shield", class: "Shield", armorClass: "3", proficiency: "Heavy, Shield", strReq: "19", dexReq: "-", dexMax: "-", prowessBonus: "Anchored", value: 5000}, 
            {tier: 4, weight: 25, name: "Aegis", class: "Shield", armorClass: "3", proficiency: "Heavy, Shield", strReq: "21", dexReq: "-", dexMax: "-", prowessBonus: "Braced", value: 6000}, 
            {tier: 4, weight: 29, name: "Gothic Plate", class: "Torso", armorClass: "9", proficiency: "Heavy", strReq: "21", dexReq: "-", dexMax: "-", prowessBonus: "+1 AC", value: 7000}, 
            {tier: 4, weight: 29, name: "Templar Plate", class: "Torso", armorClass: "8", proficiency: "Heavy", strReq: "19", dexReq: "-", dexMax: "-", prowessBonus: "5 AP", value: 8000}, 
        ];
const weaponTable = [
            {tier:1, weight:4, name:"Club", quality:"Normal", class:"Club", damage:"1d4 Bludgeoning", proficiency:"Simple Melee", strReq:"-", dexReq:"-", weaponProperties:"Light", prowessBonus:"-", value:5}, 
            {tier:1, weight:5, name:"Dagger", quality:"Normal", class:"Dagger", damage:"1d4 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"11", weaponProperties:"Finesse, Light, Range (20/60)", prowessBonus:"Wide Critical", value:10}, 
            {tier:1, weight:4, name:"Greatclub", quality:"Normal", class:"Greatclub", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"13", dexReq:"-", weaponProperties:"Two-handed", prowessBonus:"-", value:12}, 
            {tier:1, weight:4, name:"Handaxe", quality:"Normal", class:"Handaxe", damage:"1d6 Slashing", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"Light, Range (20/60)", prowessBonus:"-", value:15}, 
            {tier:1, weight:4, name:"Javelin", quality:"Normal", class:"Javelin", damage:"1d6 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"11", weaponProperties:"Range (30/120)", prowessBonus:"-", value:10}, 
            {tier:1, weight:4, name:"Light Hammer", quality:"Normal", class:"Light Hammer", damage:"1d4 Bludgeoning", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"Light, Range (20/60)", prowessBonus:"-", value:12}, 
            {tier:1, weight:5, name:"Mace", quality:"Normal", class:"Mace", damage:"1d6 Bludgeoning", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"-", prowessBonus:"-", value:10}, 
            {tier:1, weight:4, name:"Metal Knuckles", quality:"Normal", class:"Metal Knuckles", damage:"1d4 Bludgeoning", proficiency:"Simple Melee", strReq:"-", dexReq:"-", weaponProperties:"-", prowessBonus:"-", value:8}, 
            {tier:1, weight:4, name:"Quarterstaff", quality:"Normal", class:"Quarterstaff", damage:"1d6 Bludgeoning", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"Versatile (1d8)", prowessBonus:"Hinder", value:7}, 
            {tier:1, weight:4, name:"Sickle", quality:"Normal", class:"Sickle", damage:"1d4 Slashing", proficiency:"Simple Melee", strReq:"-", dexReq:"11", weaponProperties:"Light", prowessBonus:"Bleed", value:15}, 
            {tier:1, weight:4, name:"Spear", quality:"Normal", class:"Spear", damage:"1d6 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"11", weaponProperties:"Range (20/60), Versatile (1d8)", prowessBonus:"-", value:10}, 
            {tier:1, weight:4, name:"Light Crossbow", quality:"Normal", class:"Light Crossbow", damage:"1d4 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"11", weaponProperties:"Thrown (20/60)", prowessBonus:"Debilitate", value:25}, 
            {tier:1, weight:4, name:"Dart", quality:"Normal", class:"Dart", damage:"1d4 Piercing", proficiency:"Simple Ranged", strReq:"9", dexReq:"15", weaponProperties:"Finesse, Range (20/60)", prowessBonus:"Aim", value:4}, 
            {tier:1, weight:5, name:"Shortbow", quality:"Normal", class:"Shortbow", damage:"1d8 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"13", weaponProperties:"Range, Two-handed, (80/320)", prowessBonus:"-", value:35}, 
            {tier:1, weight:4, name:"Sling", quality:"Normal", class:"Sling", damage:"1d6 Bludgeoning", proficiency:"Simple Ranged", strReq:"-", dexReq:"11", weaponProperties:"Range (30/120)", prowessBonus:"-", value:20}, 
            {tier:2, weight:9, name:"Battleaxe", quality:"Normal", class:"Battleaxe", damage:"1d8 Slashing", proficiency:"Martial Melee", strReq:"15", dexReq:"-", weaponProperties:"Versatile (1d10)", prowessBonus:"Cleave", value:120}, 
            {tier:2, weight:8, name:"Flail", quality:"Normal", class:"Flail", damage:"1d8 Bludgeoning", proficiency:"Martial Melee", strReq:"15", dexReq:"-", weaponProperties:"-", prowessBonus:"Brutal", value:110}, 
            {tier:2, weight:8, name:"Glaive", quality:"Normal", class:"Glaive", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"17", dexReq:"11", weaponProperties:"Heavy, Two-handed, Reach", prowessBonus:"-", value:150}, 
            {tier:2, weight:9, name:"Greataxe", quality:"Normal", class:"Greataxe", damage:"1d12 Slashing", proficiency:"Martial Melee", strReq:"17", dexReq:"-", weaponProperties:"Heavy, Two-handed,", prowessBonus:"Cleave", value:170}, 
            {tier:2, weight:8, name:"Greatsword", quality:"Normal", class:"Greatsword", damage:"2d6 Slashing", proficiency:"Martial Melee", strReq:"15", dexReq:"13", weaponProperties:"Heavy, Two-handed", prowessBonus:"Debilitate", value:180}, 
            {tier:2, weight:8, name:"Halberd", quality:"Normal", class:"Halberd", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"17", dexReq:"11", weaponProperties:"Heavy, Two-handed, Reach", prowessBonus:"-", value:160}, 
            {tier:2, weight:8, name:"Lance", quality:"Normal", class:"Lance", damage:"1d12 Piercing", proficiency:"Martial Melee", strReq:"17", dexReq:"13", weaponProperties:"Reach", prowessBonus:"Skewer", value:140}, 
            {tier:2, weight:9, name:"Longsword", quality:"Normal", class:"Longsword", damage:"1d8 Slashing", proficiency:"Martial Melee", strReq:"13", dexReq:"11", weaponProperties:"Versatile (1d10)", prowessBonus:"Debilitate", value:135}, 
            {tier:2, weight:8, name:"Maul", quality:"Normal", class:"Maul", damage:"2d6 Bludgeoning", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"Heavy, Two-handed", prowessBonus:"Stagger", value:155}, 
            {tier:2, weight:8, name:"Morningstar", quality:"Normal", class:"Morningstar", damage:"1d8 Bludgeoning", proficiency:"Martial Melee", strReq:"15", dexReq:"-", weaponProperties:"-", prowessBonus:"Bleed", value:125}, 
            {tier:2, weight:8, name:"Pike", quality:"Normal", class:"Pike", damage:"1d10 Piercing", proficiency:"Martial Melee", strReq:"17", dexReq:"11", weaponProperties:"Heavy, Two-handed, Reach", prowessBonus:"-", value:115}, 
            {tier:2, weight:8, name:"Rapier", quality:"Normal", class:"Rapier", damage:"1d8 Piercing", proficiency:"Martial Melee", strReq:"-", dexReq:"15", weaponProperties:"Finesse", prowessBonus:"-", value:145}, 
            {tier:2, weight:8, name:"Scimitar", quality:"Normal", class:"Scimitar", damage:"1d6 Slashing", proficiency:"Martial Melee", strReq:"11", dexReq:"14", weaponProperties:"Finesse, Light,", prowessBonus:"Wide Critical", value:130}, 
            {tier:2, weight:8, name:"Scythe", quality:"Normal", class:"Scythe", damage:"3d4 Slashing", proficiency:"Martial Melee", strReq:"15", dexReq:"15", weaponProperties:"Heavy, Two-handed", prowessBonus:"Cleave", value:100}, 
            {tier:2, weight:9, name:"Shortsword", quality:"Normal", class:"Shortsword", damage:"1d6 Slashing", proficiency:"Martial Melee", strReq:"11", dexReq:"-", weaponProperties:"Finesse, Light", prowessBonus:"Bleed", value:105}, 
            {tier:2, weight:8, name:"Trident", quality:"Normal", class:"Trident", damage:"1d6 Piercing", proficiency:"Martial Melee", strReq:"13", dexReq:"-", weaponProperties:"Range (20/60), Versatile (1d8)", prowessBonus:"Brutal", value:120}, 
            {tier:2, weight:9, name:"Warhammer", quality:"Normal", class:"Warhammer", damage:"1d8 Bludgeoning", proficiency:"Martial Melee", strReq:"15", dexReq:"-", weaponProperties:"Versatile (1d10)", prowessBonus:"Stagger", value:140}, 
            {tier:2, weight:8, name:"War pick", quality:"Normal", class:"War pick", damage:"1d8 Piercing", proficiency:"Martial Melee", strReq:"17", dexReq:"-", weaponProperties:"-", prowessBonus:"Sunder", value:95}, 
            {tier:2, weight:8, name:"Whip", quality:"Normal", class:"Whip", damage:"1d4 Slashing", proficiency:"Martial Melee", strReq:"-", dexReq:"15", weaponProperties:"Finesse, Reach", prowessBonus:"Hinder", value:85}, 
            {tier:2, weight:10, name:"Hand Crossbow", quality:"Normal", class:"Hand Crossbow", damage:"1d4 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"19", weaponProperties:"Light, Loading, Range (30/120)", prowessBonus:"Wide Critical", value:125}, 
            {tier:2, weight:8, name:"Heavy Crossbow", quality:"Normal", class:"Heavy Crossbow", damage:"1d6 Piercing", proficiency:"Martial Ranged", strReq:"13", dexReq:"15", weaponProperties:"Heavy, Loading, Two-handed, Range (100/400)", prowessBonus:"Aim", value:175}, 
            {tier:2, weight:10, name:"Longbow", quality:"Normal", class:"Longbow", damage:"1d4 Piercing", proficiency:"Martial Ranged", strReq:"11", dexReq:"17", weaponProperties:"Heavy, Two-handed, Range (150/600)", prowessBonus:"Stagger", value:150}, 
            {tier:2, weight:7, name:"Cudgel", quality:"Exceptional", class:"Club", damage:"1d6 Bludgeoning", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"Light", prowessBonus:"-", value:19}, 
            {tier:2, weight:9, name:"Dirk", quality:"Exceptional", class:"Dagger", damage:"2d4 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"12", weaponProperties:"Finesse, Light, Range (20/60)", prowessBonus:"Wide Critical", value:37}, 
            {tier:2, weight:7, name:"Gnarled Club", quality:"Exceptional", class:"Greatclub", damage:"1d12 Bludgeoning", proficiency:"Simple Melee", strReq:"14", dexReq:"-", weaponProperties:"Two-handed", prowessBonus:"-", value:45}, 
            {tier:2, weight:7, name:"Hatchet", quality:"Exceptional", class:"Handaxe", damage:"1d8 Slashing", proficiency:"Simple Melee", strReq:"12", dexReq:"-", weaponProperties:"Light, Range (20/60)", prowessBonus:"-", value:56}, 
            {tier:2, weight:7, name:"Harpoon", quality:"Exceptional", class:"Javelin", damage:"1d8 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"12", weaponProperties:"Range (30/120)", prowessBonus:"-", value:37}, 
            {tier:2, weight:7, name:"Knobkerrie", quality:"Exceptional", class:"Light Hammer", damage:"1d6 Bludgeoning", proficiency:"Simple Melee", strReq:"12", dexReq:"-", weaponProperties:"Light, Range (20/60)", prowessBonus:"-", value:45}, 
            {tier:2, weight:9, name:"Mallet", quality:"Exceptional", class:"Mace", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"12", dexReq:"-", weaponProperties:"-", prowessBonus:"-", value:37}, 
            {tier:2, weight:7, name:"Claws", quality:"Exceptional", class:"Metal Knuckles", damage:"1d6 Bludgeoning", proficiency:"Simple Melee", strReq:"11", dexReq:"-", weaponProperties:"-", prowessBonus:"-", value:30}, 
            {tier:2, weight:7, name:"War Staff", quality:"Exceptional", class:"Quarterstaff", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"12", dexReq:"-", weaponProperties:"Versatile (1d10)", prowessBonus:"Hinder", value:26}, 
            {tier:2, weight:7, name:"Hand Scythe", quality:"Exceptional", class:"Sickle", damage:"1d6 Slashing", proficiency:"Simple Melee", strReq:"-", dexReq:"12", weaponProperties:"Light", prowessBonus:"Bleed", value:56}, 
            {tier:2, weight:9, name:"Mancatcher", quality:"Exceptional", class:"Spear", damage:"1d8 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"12", weaponProperties:"Range (20/60), Versatile (1d10)", prowessBonus:"-", value:37}, 
            {tier:2, weight:7, name:"Arbalest", quality:"Exceptional", class:"Light Crossbow", damage:"1d6 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"12", weaponProperties:"Thrown (20/60)", prowessBonus:"Debilitate", value:93}, 
            {tier:2, weight:7, name:"Shuriken", quality:"Exceptional", class:"Dart", damage:"1d6 Piercing", proficiency:"Simple Ranged", strReq:"10", dexReq:"16", weaponProperties:"Finesse, Range (20/60)", prowessBonus:"Aim", value:15}, 
            {tier:2, weight:9, name:"Horse Bow", quality:"Exceptional", class:"Shortbow", damage:"1d10 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"14", weaponProperties:"Range, Two-handed, (80/320)", prowessBonus:"-", value:130}, 
            {tier:2, weight:7, name:"Hurler", quality:"Exceptional", class:"Sling", damage:"1d8 Bludgeoning", proficiency:"Simple Ranged", strReq:"-", dexReq:"12", weaponProperties:"Range (30/120)", prowessBonus:"-", value:74}, 
            {tier:3, weight:14, name:"Bearded Axe", quality:"Exceptional", class:"Battleaxe", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"16", dexReq:"-", weaponProperties:"Versatile (1d12)", prowessBonus:"Cleave", value:444}, 
            {tier:3, weight:11, name:"Shredder", quality:"Exceptional", class:"Flail", damage:"1d10 Bludgeoning", proficiency:"Martial Melee", strReq:"16", dexReq:"-", weaponProperties:"-", prowessBonus:"Brutal", value:407}, 
            {tier:3, weight:11, name:"Bardiche", quality:"Exceptional", class:"Glaive", damage:"1d12 Slashing", proficiency:"Martial Melee", strReq:"18", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", prowessBonus:"-", value:555}, 
            {tier:3, weight:14, name:"Executioner", quality:"Exceptional", class:"Greataxe", damage:"2d8 Slashing", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"Heavy, Two-handed,", prowessBonus:"Cleave", value:629}, 
            {tier:3, weight:14, name:"Claymore", quality:"Exceptional", class:"Greatsword", damage:"2d8 Slashing", proficiency:"Martial Melee", strReq:"16", dexReq:"14", weaponProperties:"Heavy, Two-handed", prowessBonus:"Debilitate", value:666}, 
            {tier:3, weight:11, name:"Poleaxe", quality:"Exceptional", class:"Halberd", damage:"1d12 Slashing", proficiency:"Martial Melee", strReq:"18", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", prowessBonus:"-", value:592}, 
            {tier:3, weight:11, name:"Ranseur", quality:"Exceptional", class:"Lance", damage:"2d8 Piercing", proficiency:"Martial Melee", strReq:"18", dexReq:"14", weaponProperties:"Reach", prowessBonus:"Skewer", value:518}, 
            {tier:3, weight:14, name:"Broad Sword", quality:"Exceptional", class:"Longsword", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"14", dexReq:"12", weaponProperties:"Versatile (1d12)", prowessBonus:"Debilitate", value:500}, 
            {tier:3, weight:11, name:"Sledge", quality:"Exceptional", class:"Maul", damage:"2d8 Bludgeoning", proficiency:"Martial Melee", strReq:"19", dexReq:"-", weaponProperties:"Heavy, Two-handed", prowessBonus:"Stagger", value:574}, 
            {tier:3, weight:11, name:"Flanged Mace", quality:"Exceptional", class:"Morningstar", damage:"1d10 Bludgeoning", proficiency:"Martial Melee", strReq:"16", dexReq:"-", weaponProperties:"-", prowessBonus:"Bleed", value:463}, 
            {tier:3, weight:11, name:"Partisan", quality:"Exceptional", class:"Pike", damage:"1d12 Piercing", proficiency:"Martial Melee", strReq:"18", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", prowessBonus:"-", value:426}, 
            {tier:3, weight:11, name:"Spadroon", quality:"Exceptional", class:"Rapier", damage:"1d10 Piercing", proficiency:"Martial Melee", strReq:"-", dexReq:"16", weaponProperties:"Finesse", prowessBonus:"-", value:537}, 
            {tier:3, weight:11, name:"Sabre", quality:"Exceptional", class:"Scimitar", damage:"1d8 Slashing", proficiency:"Martial Melee", strReq:"12", dexReq:"15", weaponProperties:"Finesse, Light,", prowessBonus:"Wide Critical", value:481}, 
            {tier:3, weight:11, name:"Giant Thresher", quality:"Exceptional", class:"Scythe", damage:"4d4 Slashing", proficiency:"Martial Melee", strReq:"16", dexReq:"15", weaponProperties:"Heavy, Two-handed", prowessBonus:"Cleave", value:370}, 
            {tier:3, weight:14, name:"Gladius", quality:"Exceptional", class:"Shortsword", damage:"1d8 Slashing", proficiency:"Martial Melee", strReq:"12", dexReq:"-", weaponProperties:"Finesse, Light", prowessBonus:"Bleed", value:389}, 
            {tier:3, weight:11, name:"Brandistock", quality:"Exceptional", class:"Trident", damage:"1d8 Piercing", proficiency:"Martial Melee", strReq:"14", dexReq:"-", weaponProperties:"Range (20/60), Versatile (1d10)", prowessBonus:"Brutal", value:444}, 
            {tier:3, weight:14, name:"Battle Gavel", quality:"Exceptional", class:"Warhammer", damage:"1d10 Bludgeoning", proficiency:"Martial Melee", strReq:"16", dexReq:"-", weaponProperties:"Versatile (1d12)", prowessBonus:"Stagger", value:518}, 
            {tier:3, weight:11, name:"Crowbill", quality:"Exceptional", class:"War pick", damage:"1d10 Piercing", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"-", prowessBonus:"Sunder", value:352}, 
            {tier:3, weight:11, name:"Flog", quality:"Exceptional", class:"Whip", damage:"1d6 Slashing", proficiency:"Martial Melee", strReq:"-", dexReq:"16", weaponProperties:"Finesse, Reach", prowessBonus:"Hinder", value:315}, 
            {tier:3, weight:14, name:"Stake Thrower", quality:"Exceptional", class:"Hand Crossbow", damage:"2d4 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"20", weaponProperties:"Light, Loading, Range (30/120)", prowessBonus:"Wide Critical", value:463}, 
            {tier:3, weight:11, name:"Ballista", quality:"Exceptional", class:"Heavy Crossbow", damage:"1d8 Piercing", proficiency:"Martial Ranged", strReq:"14", dexReq:"16", weaponProperties:"Heavy, Loading, Two-handed, Range (100/400)", prowessBonus:"Aim", value:648}, 
            {tier:3, weight:11, name:"War Bow", quality:"Exceptional", class:"Longbow", damage:"1d6 Piercing", proficiency:"Martial Ranged", strReq:"12", dexReq:"18", weaponProperties:"Heavy, Two-handed, Range (150/600)", prowessBonus:"Stagger", value:555}, 
            {tier:3, weight:10, name:"Truncheon", quality:"Elite", class:"Club", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"13", dexReq:"-", weaponProperties:"Light", prowessBonus:"-", value:86}, 
            {tier:3, weight:13, name:"Stiletto", quality:"Elite", class:"Dagger", damage:"3d4 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"14", weaponProperties:"Finesse, Light, Range (20/60)", prowessBonus:"Wide Critical", value:167}, 
            {tier:3, weight:10, name:"Tyrant", quality:"Elite", class:"Greatclub", damage:"2d8 Bludgeoning", proficiency:"Simple Melee", strReq:"16", dexReq:"-", weaponProperties:"Two-handed", prowessBonus:"-", value:203}, 
            {tier:3, weight:10, name:"Cleaver", quality:"Elite", class:"Handaxe", damage:"1d10 Slashing", proficiency:"Simple Melee", strReq:"14", dexReq:"-", weaponProperties:"Light, Range (20/60)", prowessBonus:"-", value:252}, 
            {tier:3, weight:10, name:"Dardo", quality:"Elite", class:"Javelin", damage:"1d10 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"14", weaponProperties:"Range (30/120)", prowessBonus:"-", value:167}, 
            {tier:3, weight:10, name:"Hurlbat", quality:"Elite", class:"Light Hammer", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"14", dexReq:"-", weaponProperties:"Light, Range (20/60)", prowessBonus:"-", value:203}, 
            {tier:3, weight:13, name:"Scepter", quality:"Elite", class:"Mace", damage:"1d10 Bludgeoning", proficiency:"Simple Melee", strReq:"14", dexReq:"-", weaponProperties:"-", prowessBonus:"-", value:167}, 
            {tier:3, weight:10, name:"Kaiser Fist", quality:"Elite", class:"Metal Knuckles", damage:"1d8 Bludgeoning", proficiency:"Simple Melee", strReq:"13", dexReq:"-", weaponProperties:"-", prowessBonus:"-", value:135}, 
            {tier:3, weight:10, name:"Rune Staff", quality:"Elite", class:"Quarterstaff", damage:"1d10 Bludgeoning", proficiency:"Simple Melee", strReq:"14", dexReq:"-", weaponProperties:"Versatile (1d12)", prowessBonus:"Hinder", value:117}, 
            {tier:3, weight:10, name:"Thresher", quality:"Elite", class:"Sickle", damage:"1d8 Slashing", proficiency:"Simple Melee", strReq:"-", dexReq:"14", weaponProperties:"Light", prowessBonus:"Bleed", value:252}, 
            {tier:3, weight:10, name:"Yari", quality:"Elite", class:"Spear", damage:"1d10 Piercing", proficiency:"Simple Melee", strReq:"-", dexReq:"14", weaponProperties:"Range (20/60), Versatile (1d12)", prowessBonus:"-", value:167}, 
            {tier:3, weight:10, name:"Battle Crossbow", quality:"Elite", class:"Light Crossbow", damage:"1d8 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"14", weaponProperties:"Thrown (20/60)", prowessBonus:"Debilitate", value:419}, 
            {tier:3, weight:10, name:"Kunai", quality:"Elite", class:"Dart", damage:"1d8 Piercing", proficiency:"Simple Ranged", strReq:"12", dexReq:"18", weaponProperties:"Finesse, Range (20/60)", prowessBonus:"Aim", value:68}, 
            {tier:3, weight:12, name:"Composite Bow", quality:"Elite", class:"Shortbow", damage:"1d12 Piercing", proficiency:"Simple Ranged", strReq:"-", dexReq:"16", weaponProperties:"Range, Two-handed, (80/320)", prowessBonus:"-", value:585}, 
            {tier:3, weight:10, name:"Hand Trebuchet", quality:"Elite", class:"Sling", damage:"1d10 Bludgeoning", proficiency:"Simple Ranged", strReq:"-", dexReq:"14", weaponProperties:"Range (30/120)", prowessBonus:"-", value:333}, 
            {tier:4, weight:20, name:"Tabar", quality:"Elite", class:"Battleaxe", damage:"1d12 Slashing", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"Versatile (2d6)", prowessBonus:"Cleave", value:1998}, 
            {tier:4, weight:16, name:"Scorpion Flail", quality:"Elite", class:"Flail", damage:"1d12 Bludgeoning", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"-", prowessBonus:"Brutal", value:1832}, 
            {tier:4, weight:16, name:"Kwan Dao", quality:"Elite", class:"Glaive", damage:"2d6 Slashing", proficiency:"Martial Melee", strReq:"19", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", prowessBonus:"-", value:2498}, 
            {tier:4, weight:20, name:"Gothic Axe", quality:"Elite", class:"Greataxe", damage:"3d6 Slashing", proficiency:"Martial Melee", strReq:"20", dexReq:"-", weaponProperties:"Heavy, Two-handed,", prowessBonus:"Cleave", value:2831}, 
            {tier:4, weight:20, name:"Zweihander", quality:"Elite", class:"Greatsword", damage:"3d6 Slashing", proficiency:"Martial Melee", strReq:"17", dexReq:"14", weaponProperties:"Heavy, Two-handed", prowessBonus:"Debilitate", value:2997}, 
            {tier:4, weight:16, name:"Bec de Corbin", quality:"Elite", class:"Halberd", damage:"2d6 Slashing", proficiency:"Martial Melee", strReq:"19", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", prowessBonus:"-", value:2664}, 
            {tier:4, weight:16, name:"Spetum", quality:"Elite", class:"Lance", damage:"3d6 Piercing", proficiency:"Martial Melee", strReq:"19", dexReq:"14", weaponProperties:"Reach", prowessBonus:"Skewer", value:2331}, 
            {tier:4, weight:20, name:"Bastard Sword", quality:"Elite", class:"Longsword", damage:"1d12 Slashing", proficiency:"Martial Melee", strReq:"15", dexReq:"12", weaponProperties:"Versatile (2d6)", prowessBonus:"Debilitate", value:2250}, 
            {tier:4, weight:16, name:"Driver", quality:"Elite", class:"Maul", damage:"3d6 Bludgeoning", proficiency:"Martial Melee", strReq:"21", dexReq:"-", weaponProperties:"Heavy, Two-handed", prowessBonus:"Stagger", value:2583}, 
            {tier:4, weight:16, name:"Devil Star", quality:"Elite", class:"Morningstar", damage:"1d12 Bludgeoning", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"-", prowessBonus:"Bleed", value:2084}, 
            {tier:4, weight:16, name:"Guisarme", quality:"Elite", class:"Pike", damage:"2d6 Piercing", proficiency:"Martial Melee", strReq:"19", dexReq:"12", weaponProperties:"Heavy, Two-handed, Reach", prowessBonus:"-", value:1917}, 
            {tier:4, weight:16, name:"Epee", quality:"Elite", class:"Rapier", damage:"1d12 Piercing", proficiency:"Martial Melee", strReq:"-", dexReq:"18", weaponProperties:"Finesse", prowessBonus:"-", value:2417}, 
            {tier:4, weight:16, name:"Falchion", quality:"Elite", class:"Scimitar", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"12", dexReq:"16", weaponProperties:"Finesse, Light,", prowessBonus:"Wide Critical", value:2165}, 
            {tier:4, weight:16, name:"Grimm", quality:"Elite", class:"Scythe", damage:"5d4 Slashing", proficiency:"Martial Melee", strReq:"18", dexReq:"15", weaponProperties:"Heavy, Two-handed", prowessBonus:"Cleave", value:1665}, 
            {tier:4, weight:19, name:"Tulwar", quality:"Elite", class:"Shortsword", damage:"1d10 Slashing", proficiency:"Martial Melee", strReq:"14", dexReq:"-", weaponProperties:"Finesse, Light", prowessBonus:"Bleed", value:1751}, 
            {tier:4, weight:16, name:"War Fork", quality:"Elite", class:"Trident", damage:"1d10 Piercing", proficiency:"Martial Melee", strReq:"16", dexReq:"-", weaponProperties:"Range (20/60), Versatile (1d12)", prowessBonus:"Brutal", value:1998}, 
            {tier:4, weight:20, name:"Skullcracker", quality:"Elite", class:"Warhammer", damage:"1d12 Bludgeoning", proficiency:"Martial Melee", strReq:"18", dexReq:"-", weaponProperties:"Versatile (2d6)", prowessBonus:"Stagger", value:2331}, 
            {tier:4, weight:16, name:"Mattock", quality:"Elite", class:"War pick", damage:"1d12 Piercing", proficiency:"Martial Melee", strReq:"20", dexReq:"-", weaponProperties:"-", prowessBonus:"Sunder", value:1584}, 
            {tier:4, weight:16, name:"Scourge", quality:"Elite", class:"Whip", damage:"1d8 Slashing", proficiency:"Martial Melee", strReq:"-", dexReq:"18", weaponProperties:"Finesse, Reach", prowessBonus:"Hinder", value:1418}, 
            {tier:4, weight:20, name:"Bolt Pistol", quality:"Elite", class:"Hand Crossbow", damage:"3d4 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"22", weaponProperties:"Light, Loading, Range (30/120)", prowessBonus:"Wide Critical", value:2084}, 
            {tier:4, weight:16, name:"Colossus Crossbow", quality:"Elite", class:"Heavy Crossbow", damage:"1d10 Piercing", proficiency:"Martial Ranged", strReq:"14", dexReq:"17", weaponProperties:"Heavy, Loading, Two-handed, Range (100/400)", prowessBonus:"Aim", value:2916}, 
            {tier:4, weight:20, name:"Siege Bow", quality:"Elite", class:"Longbow", damage:"1d8 Piercing", proficiency:"Martial Ranged", strReq:"12", dexReq:"19", weaponProperties:"Heavy, Two-handed, Range (150/600)", prowessBonus:"Stagger", value:2498}, 
        ];
const prefixTable = [
            {tier: 1, type: "armor", weight: 4, name: "Obsidian", property: "When you take Bludgeoning damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Ebony", property: "When you take Piercing damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Jet", property: "When you take Slashing damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Jade", property: "When you take Acid damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Sapphire", property: "When you take Cold damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Ruby", property: "When you take Fire damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Kalkite", property: "When you take Force damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Topaz", property: "When you take Lightning damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Ivory", property: "When you take Necrotic damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Emerald", property: "When you take Poison damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Amethyst", property: "When you take Psychic damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Pearl", property: "When you take Radiant damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 4, name: "Amber", property: "When you take Thunder damage, you can reduce it by 1d8, to a minimum of 1.", category: "damageReduction", multiplier: 2},
            {tier: 1, type: "armor", weight: 12, name: "Saintly", property: "When a non-living enemy attacks you, increase your AC by 1.", category: "acConditional", multiplier: 2},
            {tier: 1, type: "armor", weight: 10, name: "Sinful", property: "When a living enemy attacks you, increase your AC by 1.", category: "acConditional", multiplier: 2},
            {tier: 1, type: "armor", weight: 10, name: "Entrenched", property: "Your AC against ranged attacks is increased by 1.  ", category: "acConditional", multiplier: 2},
            {tier: 1, type: "armor", weight: 8, name: "Sly", property: "When you take damage from a weapon attack or spell, you regain 1d4-1 Spell Points.  ", category: "spRegen", multiplier: 2},
            {tier: 1, type: "armor", weight: 8, name: "Calculating", property: "When you take damage from a weapon attack or spell, you regain 1d6-1 Spell Points.  ", category: "spRegen", multiplier: 2},
            {tier: 2, type: "armor", weight: 18, name: "Glorious", property: "You gain a +1 bonus to your AC. ", category: "acBonus", multiplier: 4},
            {tier: 2, type: "armor", weight: 14, name: "Valiant ", property: "You gain a bonus to your AC equal to the number of enemies adjacent to you ", category: "acConditional", multiplier: 4},
            {tier: 2, type: "armor", weight: 14, name: "Blessed", property: "You gain a bonus to your AC equal to the number of allies adjacent to you ", category: "acConditional", multiplier: 4},
            {tier: 2, type: "armor", weight: 4, name: "Durasteel", property: "You gain resistance to Bludgeoning damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 4, name: "Khaydarin", property: "You gain resistance to Piercing damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 4, name: "Duralumin", property: "You gain resistance to Slashing damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 3, name: "Black", property: "You gain resistance to Acid damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 4, name: "White", property: "You gain resistance to Cold damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 4, name: "Red", property: "You gain resistance to Fire damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 4, name: "Kyber", property: "You gain resistance to Force damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 4, name: "Blue", property: "You gain resistance to Lightning damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 4, name: "Onyx", property: "You gain resistance to Necrotic damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 4, name: "Green", property: "You gain resistance to Poison damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 3, name: "Gemmed", property: "You gain resistance to Psychic damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 3, name: "Astral", property: "You gain resistance to Radiant damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 3, name: "Purple", property: "You gain resistance to Thunder damage. ", category: "damageResistance", multiplier: 4},
            {tier: 2, type: "armor", weight: 9, name: "Holy", property: "When a non-living enemy attacks you, increase your AC by 2.", category: "acConditional", multiplier: 4},
            {tier: 2, type: "armor", weight: 9, name: "Wicked", property: "When a living enemy attacks you, increase your AC by 2.", category: "acConditional", multiplier: 4},
            {tier: 2, type: "armor", weight: 9, name: "Buttressed", property: "Your AC against ranged attacks is increased by 2.  ", category: "acConditional", multiplier: 4},
            {tier: 2, type: "armor", weight: 10, name: "Unseen", property: "While wearing this item, you are invisible to creatures more than 30 feet away from you. When you make an attack or cast a spell, you become visible until the end of the turn.  ", category: "invisible", multiplier: 4},
            {tier: 2, type: "armor", weight: 10, name: "Stalking", property: "While wearing this item, you can choose to become invisible at the start of your turn. When you perform any action, bonus action, or reaction, you become visible again.   ", category: "invisible", multiplier: 4},
            {tier: 3, type: "armor", weight: 20, name: "Exalted", property: "You gain a +2 bonus to your AC. ", category: "acBonus", multiplier: 7},
            {tier: 3, type: "armor", weight: 16, name: "Godly", property: "When a non-living enemy attacks you, increase your AC by 3.", category: "acConditional", multiplier: 7},
            {tier: 3, type: "armor", weight: 16, name: "Desecrated", property: "When a living enemy attacks you, increase your AC by 3.", category: "acConditional", multiplier: 7},
            {tier: 3, type: "armor", weight: 16, name: "Bastioned", property: "Your AC against ranged attacks is increased by 3.  ", category: "acConditional", multiplier: 7},
            {tier: 3, type: "armor", weight: 16, name: "Vulpine", property: "When you take damage from a weapon attack or spell, you regain 1d4+1 Spell Points.  ", category: "spRegen", multiplier: 7},
            {tier: 3, type: "armor", weight: 16, name: "Corvine", property: "When you take damage from a weapon attack or spell, you regain 1d6+1 Spell Points.  ", category: "spRegen", multiplier: 7},
            {tier: 3, type: "armor", weight: 16, name: "Hidden", property: "While wearing this item, you are invisible to creatures more than 20 feet away from you. When you make an attack or cast a spell, you become visible until the end of the turn.  ", category: "invisible", multiplier: 7},
            {tier: 4, type: "armor", weight: 26, name: "Triumphant", property: "You gain a +3 bonus to your AC. ", category: "acBonus", multiplier: 10},
            {tier: 4, type: "armor", weight: 22, name: "Veiled", property: "While wearing this item, you are invisible to creatures more than 10 feet away from you. When you make an attack or cast a spell, you become visible until the end of the turn.  ", category: "invisible", multiplier: 10},
            {tier: 1, type: "both", weight: 16, name: "Newt's", property: "You gain 2 spell points that are regained after a long rest. ", category: "spMax", multiplier: 2},
            {tier: 1, type: "both", weight: 14, name: "Lizard's", property: "You gain 3 spell points that are regained after a long rest. ", category: "spMax", multiplier: 2},
            {tier: 2, type: "both", weight: 20, name: "Snake's", property: "You gain 5 spell points that are regained after a long rest. ", category: "spMax", multiplier: 4},
            {tier: 2, type: "both", weight: 18, name: "Crocodile's", property: "You gain 6 spell points that are regained after a long rest. ", category: "spMax", multiplier: 4},
            {tier: 2, type: "both", weight: 16, name: "Serpent's", property: "You gain 7 spell points that are regained after a long rest. ", category: "spMax", multiplier: 4},
            {tier: 2, type: "both", weight: 20, name: "Granite", property: "When you get this item, choose a class feature that recharges after a short rest. Increase the number of times you can use that feature by 2. You can change the feature after a long rest.", category: "classFeatures", multiplier: 4},
            {tier: 2, type: "both", weight: 16, name: "Pyrite", property: "When you get this item, choose a class feature that recharges after a short rest. Increase the number of times you can use that feature by 3. You can change the feature after a long rest.", category: "classFeatures", multiplier: 4},
            {tier: 2, type: "both", weight: 24, name: "Cobalt", property: "When you get this item, choose a class feature that recharges after a Long rest. Increase the number of times you can use that feature by 1. You can change the feature after a long rest.", category: "classFeatures", multiplier: 4},
            {tier: 3, type: "both", weight: 24, name: "Viper's", property: "You gain 9 spell points that are regained after a long rest. ", category: "spMax", multiplier: 7},
            {tier: 3, type: "both", weight: 22, name: "Basilisk's", property: "You gain 10 spell points that are regained after a long rest. ", category: "spMax", multiplier: 7},
            {tier: 3, type: "both", weight: 24, name: "Opal", property: "When you get this item, choose a class feature that recharges after a Long rest. Increase the number of times you can use that feature by 2. You can change the feature after a long rest.", category: "classFeatures", multiplier: 7},
            {tier: 3, type: "both", weight: 22, name: "Azure", property: "When you get this item, choose 2 class features that recharge after a short rest. Increase the number of times you can use that feature by 1. You can change these features after a long rest.", category: "classFeatures", multiplier: 7},
            {tier: 3, type: "both", weight: 20, name: "Lapis", property: "When you get this item, choose 2 class features that recharge after a short rest. Increase the number of times you can use that feature by 2. You can change these features after a long rest.", category: "classFeatures", multiplier: 7},
            {tier: 3, type: "both", weight: 18, name: "Diamond", property: "When you get this item, choose 2 class features that recharge after a long rest. Increase the number of times you can use that feature by 1. You can change these features after a long rest.", category: "classFeatures", multiplier: 7},
            {tier: 4, type: "both", weight: 28, name: "Wyrm's", property: "You gain 11 spell points that are regained after a long rest. ", category: "spMax", multiplier: 10},
            {tier: 4, type: "both", weight: 26, name: "Hydra's", property: "You gain 13 spell points that are regained after a long rest. ", category: "spMax", multiplier: 10},
            {tier: 1, type: "weapon", weight: 12, name: "Bronze", property: "You gain a +1 to attack rolls.", category: "attackBonus", multiplier: 2},
            {tier: 1, type: "weapon", weight: 12, name: "Iron", property: "You gain a +1 to damage rolls.", category: "damageBonusFlat", multiplier: 2},
            {tier: 1, type: "weapon", weight: 13, name: "+1", property: "You gain a +1 to attack and damage rolls.", category: "weaponBonus", multiplier: 2},
            {tier: 1, type: "weapon", weight: 10, name: "Pewter", property: "You gain a +2 to attack rolls.", category: "attackBonus", multiplier: 2},
            {tier: 1, type: "weapon", weight: 10, name: "Steel", property: "You gain a +2 to damage rolls.", category: "damageBonusFlat", multiplier: 2},
            {tier: 1, type: "weapon", weight: 13, name: "Deadly", property: "On a d20 weapon attack roll of 20, you can add one additional weapon damage die.", category: "damageBonusConditional", multiplier: 2},
            {tier: 1, type: "weapon", weight: 11, name: "Vicious", property: "On a d20 weapon attack roll of 19-20, you can add one additional weapon damage die.", category: "damageBonusConditional", multiplier: 2},
            {tier: 1, type: "weapon", weight: 9, name: "Savage", property: "On a d20 weapon attack roll of 18-20, you can add one additional weapon damage die.", category: "damageBonusConditional", multiplier: 2},
            {tier: 1, type: "weapon", weight: 7, name: "Vitriolic", property: "This weapon additionally deals 1d6 extra Acid damage.", category: "elementalWeaponDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 7, name: "Frozen", property: "This weapon additionally deals 1d6 extra Cold damage.", category: "elementalWeaponDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 7, name: "Flaming", property: "This weapon additionally deals 1d6 extra Fire damage.", category: "elementalWeaponDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 7, name: "Forceful", property: "This weapon additionally deals 1d6 extra Force damage.", category: "elementalWeaponDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 7, name: "Shocking", property: "This weapon additionally deals 1d6 extra Lightning damage.", category: "elementalWeaponDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 7, name: "Decaying", property: "This weapon additionally deals 1d6 extra Necrotic damage.", category: "elementalWeaponDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 7, name: "Poisoned", property: "This weapon additionally deals 1d6 extra Poison damage.", category: "elementalWeaponDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 7, name: "Tormenting", property: "This weapon additionally deals 1d6 extra Psychic damage.", category: "elementalWeaponDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 7, name: "Radiant", property: "This weapon additionally deals 1d6 extra Radiant damage.", category: "elementalWeaponDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 7, name: "Booming", property: "This weapon additionally deals 1d6 extra Thunder damage.", category: "elementalWeaponDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 12, name: "Jagged", property: "When you deal critical damage, you can add 1d6 when determining the extra damage. ", category: "critDamage", multiplier: 2},
            {tier: 1, type: "weapon", weight: 9, name: "Viridian", property: "When you hit a creature with this weapon, its AC is reduced by 1, constitution save ends. This effect does not stack. ", category: "appliedStatusEffect", multiplier: 2},
            {tier: 1, type: "weapon", weight: 9, name: "Crimson", property: "When you hit a creature with this weapon, its attack bonus is reduced by 1, constitution save ends. This effect does not stack. ", category: "appliedStatusEffect", multiplier: 2},
            {tier: 1, type: "weapon", weight: 12, name: "Crusader's", property: "You gain 1 bonus damage for every creature adjacent to you.", category: "damageBonusConditional", multiplier: 2},
            {tier: 1, type: "weapon", weight: 12, name: "Berserker's", property: "You gain 1 bonus damage for every creature adjacent to the target.", category: "damageBonusConditional", multiplier: 2},
            {tier: 1, type: "weapon", weight: 12, name: "Exploding", property: "When rolling damage for attacks made with this weapon, when a die rolls maximum, you may roll that die again for bonus damage. This effect can occur multiple times.", category: "damageExplode", multiplier: 2},
            {tier: 1, type: "weapon", weight: 14, name: "Erupting", property: "When rolling damage for attacks made with this weapon, when a die rolls maximum, you may roll that die again. The additional damage is fire damage. This effect can occur multiple times.", category: "damageExplode", multiplier: 2},
            {tier: 1, type: "weapon", weight: 14, name: "Rupturing", property: "When rolling damage for attacks made with this weapon, when a die rolls maximum, you may roll that die again. The additional damage is force damage. This effect can occur multiple times.", category: "damageExplode", multiplier: 2},
            {tier: 1, type: "weapon", weight: 14, name: "Detonating", property: "When rolling damage for attacks made with this weapon, when a die rolls maximum, you may roll that die again. The additional damage is thunder damage.  This effect can occur multiple times.", category: "damageExplode", multiplier: 2},
            {tier: 1, type: "weapon", weight: 10, name: "Howling", property: "When you hit a creature with a melee attack, they must make a DC 14 Wisdom saving throw. On a failure, the creature must use its next available action or reaction to move their speed away from you.", category: "appliedStatusEffect", multiplier: 2},
            {tier: 2, type: "weapon", weight: 19, name: "+2", property: "You gain a +2 to attack and damage rolls.", category: "weaponBonus", multiplier: 4},
            {tier: 2, type: "weapon", weight: 19, name: "Gold", property: "You gain a +3 to attack rolls.", category: "attackBonus", multiplier: 4},
            {tier: 2, type: "weapon", weight: 19, name: "Platinum", property: "You gain a +3 to damage rolls.", category: "damageBonusFlat", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Adamantine", property: "Your critical hit range is increased by 1.", category: "critRange", multiplier: 4},
            {tier: 2, type: "weapon", weight: 15, name: "Ruthless", property: "On a d20 weapon attack roll of 17-20, you can add one additional weapon damage die.", category: "damageBonusConditional", multiplier: 4},
            {tier: 2, type: "weapon", weight: 15, name: "Merciless", property: "On a d20 weapon attack roll of 16-20, you can add one additional weapon damage die.", category: "damageBonusConditional", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Corrosive", property: "This weapon additionally deals 1d8 extra Acid damage.", category: "elementalWeaponDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Arctic", property: "This weapon additionally deals 1d8 extra Cold damage.", category: "elementalWeaponDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Ashen", property: "This weapon additionally deals 1d8 extra Fire damage.", category: "elementalWeaponDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Potent", property: "This weapon additionally deals 1d8 extra Force damage.", category: "elementalWeaponDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Electric", property: "This weapon additionally deals 1d8 extra Lightning damage.", category: "elementalWeaponDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Rotting", property: "This weapon additionally deals 1d8 extra Necrotic damage.", category: "elementalWeaponDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Venomous", property: "This weapon additionally deals 1d8 extra Poison damage.", category: "elementalWeaponDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Traumatic", property: "This weapon additionally deals 1d8 extra Psychic damage.", category: "elementalWeaponDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Luminous", property: "This weapon additionally deals 1d8 extra Radiant damage.", category: "elementalWeaponDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Crashing", property: "This weapon additionally deals 1d8 extra Thunder damage.", category: "elementalWeaponDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 19, name: "Heavy", property: "When you deal critical damage, you can add 1d10 when determining the extra damage. ", category: "critDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 19, name: "Brutal", property: "When you deal critical damage, you can add 2d6 when determining the extra damage. ", category: "critDamage", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Beryl", property: "When you hit a creature with this weapon, its AC is reduced by 2, constitution save ends. This effect does not stack. ", category: "appliedStatusEffect", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Scarlet", property: "When you hit a creature with this weapon, its attack bonus is reduced by 2, constitution save ends. This effect does not stack. ", category: "appliedStatusEffect", multiplier: 4},
            {tier: 2, type: "weapon", weight: 19, name: "Wailing", property: "When you hit a creature with a melee attack, they must make a DC 16 Wisdom saving throw. On a failure, the creature must use its next available action or reaction to move their speed away from you.", category: "appliedStatusEffect", multiplier: 4},
            {tier: 2, type: "weapon", weight: 17, name: "Dreadful", property: "After hitting a creature with this weapon, the target is frightened of you until the end of its next turn.  ", category: "appliedStatusEffect", multiplier: 4},
            {tier: 2, type: "weapon", weight: 19, name: "Blighted", property: "After hitting a creature with this weapon, the target is poisoned until the end of its next turn.  ", category: "appliedStatusEffect", multiplier: 4},
            {tier: 2, type: "weapon", weight: 15, name: "Exhausting", property: "After hitting a creature with this weapon, the target is under the effect of the Slow spell  until the end of its next turn. ", category: "appliedStatusEffect", multiplier: 4},
            {tier: 2, type: "weapon", weight: 15, name: "Chaotic", property: "After hitting a creature with this weapon, the target uses its action at the start of its turn to make a melee attack against a randomly determined creature within its reach. If there is no creature within its reach, the target can act normally  ", category: "appliedStatusEffect", multiplier: 4},
            {tier: 3, type: "weapon", weight: 24, name: "+3", property: "You gain a +3 to attack and damage rolls.", category: "weaponBonus", multiplier: 7},
            {tier: 3, type: "weapon", weight: 26, name: "Mithril", property: "Your critical hit range is increased by 2.", category: "critRange", multiplier: 7},
            {tier: 3, type: "weapon", weight: 18, name: "Caustic", property: "This weapon additionally deals 1d10 extra Acid damage.", category: "elementalWeaponDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 18, name: "Glacial", property: "This weapon additionally deals 1d10 extra Cold damage.", category: "elementalWeaponDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 18, name: "Blazing", property: "This weapon additionally deals 1d10 extra Fire damage.", category: "elementalWeaponDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 18, name: "Mystic", property: "This weapon additionally deals 1d10 extra Force damage.", category: "elementalWeaponDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 18, name: "Stormy", property: "This weapon additionally deals 1d10 extra Lightning damage.", category: "elementalWeaponDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 18, name: "Deathly", property: "This weapon additionally deals 1d10 extra Necrotic damage.", category: "elementalWeaponDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 18, name: "Toxic", property: "This weapon additionally deals 1d10 extra Poison damage.", category: "elementalWeaponDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 18, name: "Harrowing", property: "This weapon additionally deals 1d10 extra Psychic damage.", category: "elementalWeaponDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 18, name: "Hallowed", property: "This weapon additionally deals 1d10 extra Radiant damage.", category: "elementalWeaponDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 18, name: "Roaring", property: "This weapon additionally deals 1d10 extra Thunder damage.", category: "elementalWeaponDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 23, name: "Massive", property: "When you deal critical damage, you can add 2d10 when determining the extra damage. ", category: "critDamage", multiplier: 7},
            {tier: 3, type: "weapon", weight: 27, name: "Templar's", property: "You gain 2 bonus damage for every creature adjacent to you.", category: "damageBonusConditional", multiplier: 7},
            {tier: 3, type: "weapon", weight: 27, name: "Fanatic's", property: "You gain 2 bonus damage for every creature adjacent to the target.", category: "damageBonusConditional", multiplier: 7},
            {tier: 3, type: "weapon", weight: 21, name: "Obscurring", property: "After hitting a creature with this weapon, the target is blinded until the end of its next turn.  ", category: "appliedStatusEffect", multiplier: 7},
            {tier: 3, type: "weapon", weight: 22, name: "Nightmare", property: "After hitting a creature with this weapon, the target is frightened of you, save ends.  ", category: "appliedStatusEffect", multiplier: 7},
            {tier: 3, type: "weapon", weight: 24, name: "Pestilent", property: "After hitting a creature with this weapon, the target is poisoned, save ends.  ", category: "appliedStatusEffect", multiplier: 7},
            {tier: 3, type: "weapon", weight: 22, name: "Discordant", property: "After hitting a creature with this weapon, the target uses its action to make a melee attack against a randomly determined creature within its reach. If there is no creature within its reach, the target does nothing that turn.  ", category: "appliedStatusEffect", multiplier: 7},
            {tier: 3, type: "weapon", weight: 21, name: "Phasing", property: "After hitting a creature with this weapon,  the target shifts to the ethereal plane until the end of its next turn.   ", category: "appliedStatusEffect", multiplier: 7},
            {tier: 4, type: "weapon", weight: 33, name: "Orichalcum", property: "Your critical hit range is increased by 3.", category: "critRange", multiplier: 10},
            {tier: 4, type: "weapon", weight: 27, name: "Crippling", property: "After hitting a creature with this weapon, the target is incapacitated until the end of its next turn.  ", category: "appliedStatusEffect", multiplier: 10},
            {tier: 4, type: "weapon", weight: 27, name: "Blinding", property: "After hitting a creature with this weapon, the target is blinded, save ends.  ", category: "appliedStatusEffect", multiplier: 10},
            {tier: 4, type: "weapon", weight: 27, name: "Subjugating", property: "After hitting a creature with this weapon, the target is incapacitated, save ends.  ", category: "appliedStatusEffect", multiplier: 10},
            {tier: 4, type: "weapon", weight: 27, name: "Overwhelming", property: "After hitting a creature with this weapon, the target is under the effect of the Slow spell  save ends. ", category: "appliedStatusEffect", multiplier: 10},
        ];
const suffixTable = [
            {tier: 1, weight: 11, type: "armor", name: "of Brawn", property:"You gain a +1 bonus to your Strength ability score.", category: "abilityScore", multiplier: 2},
            {tier: 1, weight: 11, type: "armor", name: "of Nimbleness", property:"You gain a +1 bonus to your Dexterity ability score.", category: "abilityScore", multiplier: 2},
            {tier: 1, weight: 11, type: "armor", name: "of Stamina", property:"You gain a +1 bonus to your Constitution ability score.", category: "abilityScore", multiplier: 2},
            {tier: 1, weight: 11, type: "armor", name: "of Wit", property:"You gain a +1 bonus to your Intelligence ability score.", category: "abilityScore", multiplier: 2},
            {tier: 1, weight: 11, type: "armor", name: "of Reason", property:"You gain a +1 bonus to your Wisdom ability score.", category: "abilityScore", multiplier: 2},
            {tier: 1, weight: 11, type: "armor", name: "of Appeal", property:"You gain a +1 bonus to your Charisma ability score.", category: "abilityScore", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of the Boar", property:"You gain a +1 bonus to your Strength saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of the Ram", property:"You gain a +1 bonus to your Dexterity saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of the Cat", property:"You gain a +1 bonus to your Constitution saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of the Raccoon ", property:"You gain a +1 bonus to your Intelligence saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of the Beetle", property:"You gain a +1 bonus to your Wisdom saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of the Badger", property:"You gain a +1 bonus to your Charisma saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of the Rat", property:"You gain a +1 bonus to your Death saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 4, type: "armor", name: "of the Wolf", property:"You gain a +2 bonus to your Charisma saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 4, type: "armor", name: "of the Owl", property:"You gain a +2 bonus to your Strength saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 4, type: "armor", name: "of the Tortoise", property:"You gain a +2 bonus to your Dexterity saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 4, type: "armor", name: "of the Dove", property:"You gain a +2 bonus to your Constitution saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 4, type: "armor", name: "of the Swan", property:"You gain a +2 bonus to your Intelligence saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 4, type: "armor", name: "of the Hyena", property:"You gain a +2 bonus to your Wisdom saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 4, type: "armor", name: "of the Possum", property:"You gain a +2 bonus to your Death saving throws.", category: "savingThrow", multiplier: 2},
            {tier: 1, weight: 18, type: "armor", name: "of the Warrior", property:"You gain 1 additional Armor Point. ", category: "apMax", multiplier: 2},
            {tier: 1, weight: 14, type: "armor", name: "of the Soldier", property:"You gain 3 additional Armor Points. ", category: "apMax", multiplier: 2},
            {tier: 1, weight: 13, type: "armor", name: "of the Sparrow", property:"You maximum hit point value is increased by 2.  ", category: "hpMax", multiplier: 2},
            {tier: 1, weight: 11, type: "armor", name: "of the Kestrel", property:"You maximum hit point value is increased by 5.  ", category: "hpMax", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of the Adept", property:"You gain 1 hit dice that is the same size as your highest level class. ", category: "hitDice", multiplier: 2},
            {tier: 1, weight: 9, type: "armor", name: "of Veins", property:"When a potion or spell allows you to regain health, regain an additional 1d6+3 hit points.", category: "hpHealing", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of the Moon", property:"You gain a number of extra spell points, equal to your level divided by 2, rounded down. ", category: "spMax", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of the Giant", property:"You gain a number of armor points, equal to your level divided by 2, rounded down. ", category: "apMax", multiplier: 2},
            {tier: 1, weight: 3, type: "armor", name: "of Glowing", property:"While wearing this item, light sources you carry shed 5 feet more bright and dim light. ", category: "lightLevel", multiplier: 2},
            {tier: 1, weight: 3, type: "armor", name: "of Gleaming", property:"While wearing this item, light sources you carry shed 10 feet more bright and dim light. ", category: "lightLevel", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of Brambles", property:"When you take damage from a melee attack, the attacker takes 1d4 piercing damage. ", category: "thorns", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of Rapport", property:"While wearing this item, any allies within 5 feet of you have a +1 bonus to saving throws.", category: "savingThrowConditional", multiplier: 2},
            {tier: 1, weight: 6, type: "armor", name: "of Mana Shield", property:"When you would take damage from any source, you can expend  up to 2 spell points and reduce the damage by  1d12 for each point spent.", category: "spDefense", multiplier: 2},
            {tier: 2, weight: 12, type: "armor", name: "of Strength", property:"You gain a +2 bonus to your Strength ability score.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 12, type: "armor", name: "of Dexterity", property:"You gain a +2 bonus to your Dexterity ability score.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 12, type: "armor", name: "of Constitution", property:"You gain a +2 bonus to your Constitution ability score.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 12, type: "armor", name: "of Intelligence", property:"You gain a +2 bonus to your Intelligence ability score.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 12, type: "armor", name: "of Wisdom", property:"You gain a +2 bonus to your Wisdom ability score.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 12, type: "armor", name: "of Charisma", property:"You gain a +2 bonus to your Charisma ability score.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 6, type: "armor", name: "of the Paladin", property:"You gain a +1 bonus to your Strength and Charisma ability scores.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 6, type: "armor", name: "of the Cleric", property:"You gain a +1 bonus to your Strength and Wisdom ability scores.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 6, type: "armor", name: "of the Warlock", property:"You gain a +1 bonus to your Dexterity and Charisma ability scores.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 6, type: "armor", name: "of the Rogue", property:"You gain a +1 bonus to your Dexterity and Intelligence ability scores.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 6, type: "armor", name: "of the Monk", property:"You gain a +1 bonus to your Dexterity and Wisdom ability scores.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 6, type: "armor", name: "of the Psion", property:"You gain a +1 bonus to your Intelligence and Wisdom ability scores.", category: "abilityScore", multiplier: 4},
            {tier: 2, weight: 5, type: "armor", name: "of the Gorilla", property:"You gain a +3 bonus to your Strength saving throws.", category: "savingThrow", multiplier: 4},
            {tier: 2, weight: 5, type: "armor", name: "of the Hawk", property:"You gain a +3 bonus to your Dexterity saving throws.", category: "savingThrow", multiplier: 4},
            {tier: 2, weight: 5, type: "armor", name: "of the Ox", property:"You gain a +3 bonus to your Constitution saving throws.", category: "savingThrow", multiplier: 4},
            {tier: 2, weight: 5, type: "armor", name: "of the Raven", property:"You gain a +3 bonus to your Intelligence saving throws.", category: "savingThrow", multiplier: 4},
            {tier: 2, weight: 5, type: "armor", name: "of the Stag", property:"You gain a +3 bonus to your Wisdom saving throws.", category: "savingThrow", multiplier: 4},
            {tier: 2, weight: 5, type: "armor", name: "of the Peacock", property:"You gain a +3 bonus to your Charisma saving throws.", category: "savingThrow", multiplier: 4},
            {tier: 2, weight: 6, type: "armor", name: "of the Vulture", property:"You gain a +3 bonus to your Death saving throws.", category: "savingThrow", multiplier: 4},
            {tier: 2, weight: 14, type: "armor", name: "of the Knight", property:"You gain 5 additional Armor Points.", category: "apMax", multiplier: 4},
            {tier: 2, weight: 13, type: "armor", name: "of Falcon", property:"You maximum hit point value is increased by 8.", category: "hpMax", multiplier: 4},
            {tier: 2, weight: 11, type: "armor", name: "of Eagle", property:"You maximum hit point value is increased by 10.", category: "hpMax", multiplier: 4},
            {tier: 2, weight: 9, type: "armor", name: "of the Veteran", property:"You gain 2 hit dice that are the same size as your highest level class.", category: "hitDice", multiplier: 4},
            {tier: 2, weight: 10, type: "armor", name: "of Health", property:"While you are bloodied and still have hit points, you regain 1d4hit points at the start of your turn.", category: "hpRegen", multiplier: 4},
            {tier: 2, weight: 9, type: "armor", name: "of Life", property:"You gain a bonus to your maximum hit point value, equal to your level.", category: "hpMax", multiplier: 4},
            {tier: 2, weight: 8, type: "armor", name: "of Blood", property:"When a potion or spell allows you to regain health, regain an additional 1d6+6 hit points.", category: "hpHealing", multiplier: 4},
            {tier: 2, weight: 7, type: "armor", name: "of Heart", property:"When a potion or spell allows you to regain health, regain an additional 1d6+9 hit points.", category: "hpHealing", multiplier: 4},
            {tier: 2, weight: 7, type: "armor", name: "of Shining", property:"While wearing this item, light sources you carry shed 15 feet more bright and dim light. ", category: "lightLevel", multiplier: 4},
            {tier: 2, weight: 10, type: "armor", name: "of Thorns", property:"When you take damage from a melee attack, the attacker takes 2d4 piercing damage. ", category: "thorns", multiplier: 4},
            {tier: 2, weight: 8, type: "armor", name: "of Unity", property:"While wearing this item, any allies within 5 feet of you have a +4 bonus to saving throws.", category: "savingThrowConditional", multiplier: 4},
            {tier: 2, weight: 9, type: "armor", name: "of Chance", property:"Once per loot session, you can roll a d8. On a 7 or higher, you gain one additional loot drop.  ", category: "lootDrop", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Athletics", property:"You gain advantage on Athletics skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Acrobatics", property:"You gain advantage on Acrobatics skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of the Theif", property:"You gain advantage on Sleight of Hand skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Stealth", property:"You gain advantage on Stealth skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Arcana", property:"You gain advantage on Arcana skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of History", property:"You gain advantage on History skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Investigation", property:"You gain advantage on Investigation skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Nature", property:"You gain advantage on Nature skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Religion", property:"You gain advantage on Religion skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Animal Handling", property:"You gain advantage on Animal Handling skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Insight", property:"You gain advantage on Insight skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Medicine", property:"You gain advantage on Medicine skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Perception", property:"You gain advantage on Perception skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Survival", property:"You gain advantage on Survival skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Deception", property:"You gain advantage on Deception skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Intimidation", property:"You gain advantage on Intimidation skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Performance", property:"You gain advantage on Performance skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 4, type: "armor", name: "of Persuasion", property:"You gain advantage on Persuasion skill checks.  ", category: "skillCheck", multiplier: 4},
            {tier: 2, weight: 10, type: "armor", name: "of Soul Ward", property:"When you would take damage from any source, you can expend  up to 4 spell points and reduce the damage by  1d6 for each point spent.", category: "spDefense", multiplier: 4},
            {tier: 2, weight: 10, type: "armor", name: "of Arcane Aegis", property:"When you would take damage from any source, you can expend  up to 6 spell points and reduce the damage by  1d4 for each point spent.", category: "spDefense", multiplier: 4},
            {tier: 3, weight: 12, type: "armor", name: "of Might", property:"You gain a +3 bonus to your Strength ability score.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 12, type: "armor", name: "of Finesse", property:"You gain a +3 bonus to your Dexterity ability score.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 12, type: "armor", name: "of Mettle", property:"You gain a +3 bonus to your Constitution ability score.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 12, type: "armor", name: "of Brilliance", property:"You gain a +3 bonus to your Intelligence ability score.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 12, type: "armor", name: "of Judgement", property:"You gain a +3 bonus to your Wisdom ability score.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 12, type: "armor", name: "of Allure", property:"You gain a +3 bonus to your Charisma ability score.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 11, type: "armor", name: "of the Oathkeeper", property:"You gain a +2 bonus to your Strength and Charisma ability scores.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 11, type: "armor", name: "of the Priest", property:"You gain a +2 bonus to your Strength and Wisdom ability scores.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 11, type: "armor", name: "of the Hexblade", property:"You gain a +2 bonus to your Dexterity and Charisma ability scores.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 11, type: "armor", name: "of the Trickster", property:"You gain a +2 bonus to your Dexterity and Intelligence ability scores.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 11, type: "armor", name: "of the Ways", property:"You gain a +2 bonus to your Dexterity and Wisdom ability scores.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 11, type: "armor", name: "of the Noble", property:"You gain a +2 bonus to your Intelligence and Wisdom ability scores.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 10, type: "armor", name: "of of the Stars", property:"You gain a +1 bonus to all of your ability scores.", category: "abilityScore", multiplier: 7},
            {tier: 3, weight: 15, type: "armor", name: "of the Champion", property:"You gain 8 additional Armor Points. ", category: "apMax", multiplier: 7},
            {tier: 3, weight: 18, type: "armor", name: "of Condor", property:"You maximum hit point value is increased by 13.  ", category: "hpMax", multiplier: 7},
            {tier: 3, weight: 16, type: "armor", name: "of Mammoth", property:"You maximum hit point value is increased by 15.  ", category: "hpMax", multiplier: 7},
            {tier: 3, weight: 12, type: "armor", name: "of the Expert", property:"You gain 3 hit dice that are the same size as your highest level class. ", category: "hitDice", multiplier: 7},
            {tier: 3, weight: 12, type: "armor", name: "of Sinew", property:"When a potion or spell allows you to regain health, regain an additional 2d6+5 hit points.", category: "hpHealing", multiplier: 7},
            {tier: 3, weight: 12, type: "armor", name: "of Regeneration", property:"While you are bloodied and still have hit points, you regain 1d8hit points at the start of your turn. ", category: "hpRegen", multiplier: 7},
            {tier: 3, weight: 17, type: "armor", name: "of the Sun", property:"You gain a number of extra spell points, equal to your level. ", category: "spMax", multiplier: 7},
            {tier: 3, weight: 15, type: "armor", name: "of the Titan", property:"You gain a number of armor points, equal to your level. ", category: "apMax", multiplier: 7},
            {tier: 3, weight: 19, type: "armor", name: "of Barbs", property:"When you take damage from a melee attack, the attacker takes 3d4 piercing damage. ", category: "thorns", multiplier: 7},
            {tier: 3, weight: 17, type: "armor", name: "of Harmony", property:"While wearing this item, any allies within 10 feet of you have a +2 bonus to saving throws.", category: "savingThrowConditional", multiplier: 7},
            {tier: 3, weight: 16, type: "armor", name: "of Wealth", property:"Once per loot session, you can roll a d8. On a 5 or higher, you gain one additional loot drop.  ", category: "lootDrop", multiplier: 7},
            {tier: 4, weight: 17, type: "armor", name: "of Power", property:"You gain a +4 bonus to your Strength ability score.", category: "abilityScore", multiplier: 10},
            {tier: 4, weight: 17, type: "armor", name: "of Precision", property:"You gain a +4 bonus to your Dexterity ability score.", category: "abilityScore", multiplier: 10},
            {tier: 4, weight: 17, type: "armor", name: "of Vigor", property:"You gain a +4 bonus to your Constitution ability score.", category: "abilityScore", multiplier: 10},
            {tier: 4, weight: 17, type: "armor", name: "of Wizardry", property:"You gain a +4 bonus to your Intelligence ability score.", category: "abilityScore", multiplier: 10},
            {tier: 4, weight: 17, type: "armor", name: "of Justice", property:"You gain a +4 bonus to your Wisdom ability score.", category: "abilityScore", multiplier: 10},
            {tier: 4, weight: 17, type: "armor", name: "of Sorcery", property:"You gain a +4 bonus to your Charisma ability score.", category: "abilityScore", multiplier: 10},
            {tier: 4, weight: 15, type: "armor", name: "of of the Zodiac", property:"You gain a +2 bonus to all of your ability scores.", category: "abilityScore", multiplier: 10},
            {tier: 4, weight: 23, type: "armor", name: "of the Duke", property:"You gain 10 additional Armor Points. ", category: "apMax", multiplier: 10},
            {tier: 4, weight: 21, type: "armor", name: "of the King", property:"You gain 12 additional Armor Points. ", category: "apMax", multiplier: 10},
            {tier: 4, weight: 21, type: "armor", name: "of Whale", property:"You maximum hit point value is increased by 20.  ", category: "hpMax", multiplier: 10},
            {tier: 4, weight: 19, type: "armor", name: "of Colossus", property:"You maximum hit point value is increased by 25.  ", category: "hpMax", multiplier: 10},
            {tier: 4, weight: 24, type: "armor", name: "of the Master", property:"You gain 4 hit dice that are the same size as your highest level class. ", category: "hitDice", multiplier: 10},
            {tier: 4, weight: 23, type: "armor", name: "of Bone", property:"When a potion or spell allows you to regain health, regain an additional 2d6+10 hit points.", category: "hpHealing", multiplier: 10},
            {tier: 4, weight: 22, type: "armor", name: "of Marrow", property:"When a potion or spell allows you to regain health, regain an additional 2d6+15 hit points.", category: "hpHealing", multiplier: 10},
            {tier: 4, weight: 20, type: "armor", name: "of Regrowth", property:"While you are bloodied and still have hit points, you regain 1d12hit points at the start of your turn. ", category: "hpRegen", multiplier: 10},
            {tier: 4, weight: 25, type: "armor", name: "of Vitality", property:"You gain a bonus to your maximum hit point value, equal to twice your level. ", category: "hpMax", multiplier: 10},
            {tier: 4, weight: 25, type: "armor", name: "of Spikes", property:"When you take damage from a melee attack, the attacker takes 4d4 piercing damage. ", category: "thorns", multiplier: 10},
            {tier: 4, weight: 25, type: "armor", name: "of Kin", property:"While wearing this item, any allies within 20 feet of you have a +2 bonus to saving throws.", category: "savingThrowConditional", multiplier: 10},
            {tier: 4, weight: 25, type: "armor", name: "of Fortune", property:"Once per loot session, you can roll a d8. On a 3 or higher, you gain one additional loot drop.  ", category: "lootDrop", multiplier: 10},
            {tier: 1, weight: 4, type: "both", name: "of Shattering", property:"After you take Physical damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 weapon damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Puncturing", property:"After you take Physical damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 weapon damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Rending", property:"After you take Physical damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 weapon damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Acid", property:"After you take Elemental damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Acid damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Frost", property:"After you take Elemental damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Cold damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Fire", property:"After you take Elemental damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Fire damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Magic", property:"After you take Elemental damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Force damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Lightning", property:"After you take Elemental damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Lightning damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Shadow", property:"After you take Elemental damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Necrotic damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Sickness", property:"After you take Elemental damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Poison damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of the Mind", property:"After you take Elemental damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Psychic damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Light", property:"After you take Elemental damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Radiant damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 4, type: "both", name: "of Thunder", property:"After you take Elemental damage from an attack or ability, the first time you hit with a weapon attack on your next turn, the target takes an extra 1d6 Thunder damage.", category: "elementalWeaponDamageConditional", multiplier: 2},
            {tier: 1, weight: 9, type: "both", name: "of the Wyvern", property:"Your Proficiency Bonus increases by 1. This effect can only be applied from one item. ", category: "proficiencyBonus", multiplier: 2},
            {tier: 1, weight: 7, type: "both", name: "of Readiness", property:"You can add 1d4 to initiative rolls.  ", category: "initiative", multiplier: 2},
            {tier: 1, weight: 6, type: "both", name: "of Apetite", property:"When you cast a spell using spell points, roll a d20. On a 13 or higher, the spell costs 1 less SP. Otherwise, it costs 1 more. ", category: "spCost", multiplier: 2},
            {tier: 1, weight: 6, type: "both", name: "of Study", property:"When first equipping this item, choose two 1st-level spells you have access to. These spells do not count against your total number of spells known or prepared. ", category: "spellPrep", multiplier: 2},
            {tier: 1, weight: 6, type: "both", name: "of Training", property:"When first equipping this item, choose two 2nd-level spells you have access to. These spells do not count against your total number of spells known or prepared. ", category: "spellPrep", multiplier: 2},
            {tier: 2, weight: 9, type: "both", name: "of Instinct", property:"This item does not have a proficiency requirement to gain its prowess bonus.", category: "itemRequirements", multiplier: 4},
            {tier: 2, weight: 9, type: "both", name: "of Ease", property:"This item does not have a strength requirement to gain its prowess bonus.", category: "itemRequirements", multiplier: 4},
            {tier: 2, weight: 9, type: "both", name: "of Simplicity", property:"This item does not have a dexterity requirement to gain its prowess bonus.", category: "itemRequirements", multiplier: 4},
            {tier: 2, weight: 8, type: "both", name: "of the Drake", property:"Your Proficiency Bonus increases by 2. This effect can only be applied from one item. ", category: "proficiencyBonus", multiplier: 4},
            {tier: 2, weight: 10, type: "both", name: "of the Leech", property:"When you deal damage with a weapon attack, you regain 1d4 hit points. ", category: "hpLeech", multiplier: 4},
            {tier: 2, weight: 8, type: "both", name: "of the Bat", property:"When you deal damage with a weapon attack, you regain 1d8 hit points. ", category: "hpLeech", multiplier: 4},
            {tier: 2, weight: 10, type: "both", name: "of the Claw", property:"When you deal damage with a weapon attack, you regain 1 spell points. ", category: "spRegen", multiplier: 4},
            {tier: 2, weight: 8, type: "both", name: "of the Fang", property:"When you deal damage with a weapon attack, you regain 2 spell points. ", category: "spRegen", multiplier: 4},
            {tier: 2, weight: 11, type: "both", name: "of the Apprentice", property:"Once per short rest, you can cast a spell with a casting time of one action as a bonus action instead.    ", category: "spellSpeed", multiplier: 4},
            {tier: 2, weight: 9, type: "both", name: "of Alacrity", property:"You can add 1d8 to initiative rolls.  ", category: "initiative", multiplier: 4},
            {tier: 2, weight: 9, type: "both", name: "of Vengeance", property:"On your turn, you can use your move action to instead make a weapon attack.   ", category: "attackSpeed", multiplier: 4},
            {tier: 2, weight: 9, type: "both", name: "of Quickness", property:"On your turn, you can use your move action to instead cast a cantrip.   ", category: "spellSpeed", multiplier: 4},
            {tier: 2, weight: 9, type: "both", name: "of Hunger", property:"When you cast a spell using spell points, roll a d20. On a 9 or higher, the spell costs 1 less SP. Otherwise, it costs 1 more. ", category: "spCost", multiplier: 4},
            {tier: 2, weight: 9, type: "both", name: "of Mnemonics", property:"If you have the spellcasting class feature, you can add your proficiency bonus to the number of spells you know or can prepare.   ", category: "spellPrep", multiplier: 4},
            {tier: 2, weight: 9, type: "both", name: "of Research", property:"When first equipping this item, choose two 3rd-level spells you have access to. These spells do not count against your total number of spells known or prepared. ", category: "spellPrep", multiplier: 4},
            {tier: 2, weight: 9, type: "both", name: "of Lore", property:"When first equipping this item, choose one 4th-level spell you have access to. This spells do not count against your total number of spells known or prepared. ", category: "spellPrep", multiplier: 4},
            {tier: 3, weight: 12, type: "both", name: "of the Dragon", property:"Your Proficiency Bonus increases by 3. This effect can only be applied from one item. ", category: "proficiencyBonus", multiplier: 7},
            {tier: 3, weight: 12, type: "both", name: "of the Vampire", property:"When you deal damage with a weapon attack, you regain 1d12 hit points. ", category: "hpLeech", multiplier: 7},
            {tier: 3, weight: 12, type: "both", name: "of the Talon", property:"When you deal damage with a weapon attack, you regain 3 spell points. ", category: "spRegen", multiplier: 7},
            {tier: 3, weight: 12, type: "both", name: "of the Magus", property:"Once per short rest, you can cast a spell with a casting time of one action as a bonus action instead. When you use this feature, roll a d6. On a 6, this feature regains its use.   ", category: "spellSpeed", multiplier: 7},
            {tier: 3, weight: 12, type: "both", name: "of Initiative", property:"You can add 1d12 to initiative rolls.  ", category: "initiative", multiplier: 7},
            {tier: 3, weight: 12, type: "both", name: "of Zeal", property:"On your turn, you can use your move action to instead take the attack action.   ", category: "attackSpeed", multiplier: 7},
            {tier: 3, weight: 12, type: "both", name: "of Haste", property:"On your turn, you can use your move action to instead cast a spell.   ", category: "spellSpeed", multiplier: 7},
            {tier: 3, weight: 12, type: "both", name: "of Craving", property:"When you cast a spell using spell points, roll a d20. On a 5 or higher, the spell costs 1 less SP. Otherwise, it costs 1 more. ", category: "spCost", multiplier: 7},
            {tier: 3, weight: 12, type: "both", name: "of Enlightenment", property:"When first equipping this item, choose one 5th-level spell you have access to. This spells do not count against your total number of spells known or prepared. ", category: "spellPrep", multiplier: 7},
            {tier: 1, weight: 12, type: "weapon", name: "of the Leopard", property:"You gain a damage bonus to your weapon attacks equal to your level divided by 3, rounded down. ", category: "damageBonusFlat", multiplier: 2},
            {tier: 1, weight: 12, type: "weapon", name: "of the Lion", property:"You gain a damage bonus to your spells equal to your level divided by 3, rounded down. ", category: "spellDamageFlat", multiplier: 2},
            {tier: 1, weight: 12, type: "weapon", name: "of Measure", property:"When you roll damage for a weapon attack, you can reroll any 1's on the damage dice. You must use the second result. ", category: "weaponReroll", multiplier: 2},
            {tier: 1, weight: 12, type: "weapon", name: "of Tempo", property:"Once per turn when you take the attack action, you may role percentile dice. if the result is less than your level, you may make one additional attack. ", category: "attackSpeed", multiplier: 2},
            {tier: 1, weight: 12, type: "weapon", name: "of Suppression", property:"When you hit a creature with this weapon, its speed is reduced by 10 feet until the start of your next turn.", category: "appliedStatusEffect", multiplier: 2},
            {tier: 1, weight: 12, type: "weapon", name: "of the Bear", property:"When you hit a creature with a melee attack, they must make a DC 15 Strength saving throw. On a failure, the creature is pushed 5 feet.", category: "appliedStatusEffect", multiplier: 2},
            {tier: 1, weight: 12, type: "weapon", name: "of Fatigue", property:"After hitting a creature with this weapon, they cannot make any reactions until the end of the turn.  ", category: "appliedStatusEffect", multiplier: 2},
            {tier: 1, weight: 12, type: "weapon", name: "of Binding", property:"After hitting a creature with this weapon, they cannot make any reactions until the end of their next turn.  ", category: "appliedStatusEffect", multiplier: 2},
            {tier: 2, weight: 18, type: "weapon", name: "of the Panther", property:"You gain a damage bonus to your weapon attacks equal to your level divided by 2, rounded down. ", category: "damageBonusFlat", multiplier: 4},
            {tier: 2, weight: 18, type: "weapon", name: "of the Tiger", property:"You gain a damage bonus to your spells equal to your level divided by 2, rounded down. ", category: "damageBonusFlat", multiplier: 4},
            {tier: 2, weight: 18, type: "weapon", name: "of Worth", property:"When you roll damage for a weapon attack, you can reroll any 2's on the damage dice. You must use the second result. ", category: "weaponReroll", multiplier: 4},
            {tier: 2, weight: 18, type: "weapon", name: "of Excellence", property:"When you deal damage with a spell, you can reroll any 1's on the damage dice. You must use the second result. ", category: "spellReroll", multiplier: 4},
            {tier: 2, weight: 18, type: "weapon", name: "of Momentum", property:"Once per turn when you take the attack action, you may role percentile dice. if the result is less than 5 plus your level, you may make one additional attack. ", category: "attackSpeed", multiplier: 4},
            {tier: 2, weight: 18, type: "weapon", name: "of Impairment", property:"When you hit a creature with this weapon, its speed is reduced by half until the start of your next turn.", category: "appliedStatusEffect", multiplier: 4},
            {tier: 2, weight: 18, type: "weapon", name: "of the Grizzly", property:"When you hit a creature with a melee attack, they must make a DC 17 Strength saving throw. On a failure, the creature is pushed 10 feet.", category: "appliedStatusEffect", multiplier: 4},
            {tier: 2, weight: 18, type: "weapon", name: "of Greed", property:"When damage is rolled after hitting with this weapon, roll a d8. On an 8, maximize all damage dice. On 3-7, damage is calculated as usual. On a 1 or 2, the attack deals 0 damage.", category: "damageBonusConditional", multiplier: 4},
            {tier: 3, weight: 24, type: "weapon", name: "of Supremacy", property:"When you deal damage with a spell, you can reroll any 2's on the damage dice. You must use the second result. ", category: "spellReroll", multiplier: 7},
            {tier: 3, weight: 24, type: "weapon", name: "of Velocity", property:"Once per turn when you take the attack action, you may role percentile dice. if the result is less than 10 plus your level, you may make one additional attack. ", category: "attackSpeed", multiplier: 7},
            {tier: 3, weight: 24, type: "weapon", name: "of Containment", property:"When you hit a creature with this weapon, its speed is reduced to 0 until the start of your next turn.", category: "appliedStatusEffect", multiplier: 7},
            {tier: 3, weight: 24, type: "weapon", name: "of Avarice", property:"When damage is rolled after hitting with this weapon, roll a d4. On a 4, maximize all damage dice. On 2-3, damage is calculated as usual. On a 1, the attack deals 0 damage.", category: "damageBonusConditional", multiplier: 7},
            {tier: 3, weight: 24, type: "weapon", name: "of Maiming", property:"After hitting a creature with this weapon, they cannot make any reactions for 1d4 turns.  ", category: "appliedStatusEffect", multiplier: 7},   
        ];
const cursedPrefixTable = [
            {tier: 1, weight: 7, type: "armor", name: "Rusted", property: "Cursed: You suffer a -1 to your AC.  ", category: "appliedStatusEffect", multiplier: 0.5},
            {tier: 1, weight: 6, type: "armor", name: "Crystaline", property: "Cursed: While using this item, your armor points are reduced by 5 to a minimum of 1. ", category: ".", multiplier: 0.5},
            {tier: 1, weight: 6, type: "armor", name: "Glass", property: "Cursed: While using this item, your armor points are reduced by half. ", category: ".", multiplier: 0.5},
            {tier: 1, weight: 5, type: "armor", name: "Pitch", property: "Cursed: While using this item, your light sources have bright and dim light reduced by 10 feet.  ", category: "acBonus", multiplier: 0.5},
            {tier: 1, weight: 7, type: "armor", name: "Tar", property: "Cursed: While using this item, you no longer gain the benefits of darkvision, if you have it.   ", category: "apMax", multiplier: 0.5},
            {tier: 2, weight: 10, type: "armor", name: "Vulnerable", property: "Cursed: You suffer a -2 to your AC.  ", category: "apMax", multiplier: 0.25},
            {tier: 3, weight: 14, type: "armor", name: "Brittle", property: "Cursed: You suffer a -3 to your AC.  ", category: "lightLevel", multiplier: 0.15},
            {tier: 2, weight: 10, type: "both", name: "Frog's", property: "Cursed: While using this item, your spell points are reduced by 15 to a minimum of 1. ", category: "vision", multiplier: 0.25},
            {tier: 2, weight: 10, type: "both", name: "Toad's", property: "Cursed: While using this item, your spell points are reduced by half. ", category: "acBonus", multiplier: 0.25},
            {tier: 1, weight: 8, type: "weapon", name: "Tin", property: "Cursed: You suffer a -1 to your weapon attack rolls.  ", category: "acBonus", multiplier: 0.5},
            {tier: 1, weight: 5, type: "weapon", name: "Aluminum", property: "Cursed: You suffer a -2 to your weapon attack rolls.  ", category: "spMax", multiplier: 0.5},
            {tier: 1, weight: 7, type: "weapon", name: "Bent", property: "Cursed: When rolling damage for an attack made with this weapon, any dice with a result higher than 3 are instead treated as a 3. ", category: "spMax", multiplier: 0.5},
            {tier: 1, weight: 5, type: "weapon", name: "Dull", property: "Cursed: When rolling damage for an attack made with this weapon, any dice with a result higher than 2 are instead treated as a 2. ", category: "attackBonus", multiplier: 0.5},
            {tier: 2, weight: 10, type: "weapon", name: "Copper", property: "Cursed: You suffer a -3 to your weapon attack rolls.  ", category: "attackBonus", multiplier: 0.25},
            {tier: 2, weight: 10, type: "weapon", name: "Useless", property: "Cursed: When rolling damage for an attack made with this weapon, all dice are treated as a 1.    ", category: "weaponReroll", multiplier: 0.25},
        ];
const cursedSuffixTable = [
            {tier: 1, weight: 7, type: "armor", name: "of Tears", property: "Cursed: After you hit with a melee attack, you take 1 piercing damage.  ", category: ".", multiplier: 0.5},
            {tier: 1, weight: 5, type: "armor", name: "of Pain", property: "Cursed: After you hit with a melee attack, you take 2 piercing damage.  ", category: ".", multiplier: 0.5},
            {tier: 1, weight: 6, type: "armor", name: "of Weakness", property: "Cursed: While using this item, you suffer a -1 to your Strength score.", category: ".", multiplier: 0.5},
            {tier: 1, weight: 6, type: "armor", name: "of Frailty", property: "Cursed: While using this item, you suffer a -1 to your Constitution score.", category: "thorns", multiplier: 0.5},
            {tier: 1, weight: 6, type: "armor", name: "of Bumbling", property: "Cursed: While using this item, you suffer a -1 to your Dexterity score.", category: "thorns", multiplier: 0.5},
            {tier: 1, weight: 6, type: "armor", name: "of Dyslexia", property: "Cursed: While using this item, you suffer a -1 to your Intelligence score.", category: "abilityScore", multiplier: 0.5},
            {tier: 1, weight: 6, type: "armor", name: "of the Nitwit", property: "Cursed: While using this item, you suffer a -1 to your Wisdom score.", category: "abilityScore", multiplier: 0.5},
            {tier: 1, weight: 6, type: "armor", name: "of Aversion", property: "Cursed: While using this item, you suffer a -1 to your Charisma score.", category: "abilityScore", multiplier: 0.5},
            {tier: 1, weight: 6, type: "armor", name: "of the Snail", property: "Cursed: While using this item, your speed is halved.    ", category: "abilityScore", multiplier: 0.5},
            {tier: 2, weight: 10, type: "armor", name: "of Atrophy", property: "Cursed: While using this item, you suffer a -2 to your Strength score.", category: "abilityScore", multiplier: 0.25},
            {tier: 2, weight: 10, type: "armor", name: "of Disease", property: "Cursed: While using this item, you suffer a -2 to your Constitution score.", category: "abilityScore", multiplier: 0.25},
            {tier: 2, weight: 10, type: "armor", name: "of Lumbering", property: "Cursed: While using this item, you suffer a -2 to your Dexterity score.", category: "moveSpeed", multiplier: 0.25},
            {tier: 2, weight: 10, type: "armor", name: "of the Oaf", property: "Cursed: While using this item, you suffer a -2 to your Intelligence score.", category: "abilityScore", multiplier: 0.25},
            {tier: 2, weight: 10, type: "armor", name: "of the Gullable", property: "Cursed: While using this item, you suffer a -2 to your Wisdom score.", category: "abilityScore", multiplier: 0.25},
            {tier: 2, weight: 10, type: "armor", name: "of Loathing", property: "Cursed: While using this item, you suffer a -2 to your Charisma score.", category: "abilityScore", multiplier: 0.25},
            {tier: 2, weight: 8, type: "armor", name: "of Trouble", property: "Cursed: While using this item, you suffer a -1 to all ability scores.  ", category: "abilityScore", multiplier: 0.25},
            {tier: 3, weight: 14, type: "armor", name: "of Tribulation", property: "Cursed: While using this item, you suffer a -2 to all ability scores.  ", category: "abilityScore", multiplier: 0.15},
            {tier: 1, weight: 7, type: "armor", name: "of Corruption", property: "Cursed: While in posession of this item, your maximum spell points cannot be more than twice your level.    ", category: "abilityScore", multiplier: 0.5},
            {tier: 1, weight: 6, type: "armor", name: "of the Fool", property: "Cursed: While in posession of this item, you can only prepare or know 1 spell.    ", category: "abilityScore", multiplier: 0.5},
            {tier: 2, weight: 10, type: "armor", name: "of Ruin", property: "Cursed: While using this item, you have disadvantage on all saving throws.    ", category: "abilityScore", multiplier: 0.25},
            {tier: 2, weight: 9, type: "both", name: "of Pox", property: "Cursed: While in posession of this item, you cannot regain hit points from spells, features, or items.    ", category: "spMax", multiplier: 0.25},
            {tier: 2, weight: 12, type: "both", name: "of Peril", property: "Cursed: While using this item, attacks against you are made at advantage.    ", category: "spellPrep", multiplier: 0.25},
            {tier: 2, weight: 10, type: "both", name: "of Sloth", property: "Cursed: While using this item, you can make only one attack roll per round, regardless of any additional features or effects.    ", category: "savingThrow", multiplier: 0.25},
            {tier: 2, weight: 10, type: "both", name: "of Passivity", property: "Cursed: While using this item, you cannot make any opportunity attacks.    ", category: "hpHealing", multiplier: 0.25},
        ];
const rareName1 = [
            "Beast", "Eagle", "Raven", "Viper", "Ghoul", "Skull", "Blood", "Dread", "Doom", "Grim", 
            "Bone", "Death", "Shadow", "Storm", "Rune", "Plague", "Stone", "Wraith", "Spirit", "Demon", "Cruel", "Brimstone",
            "Empyrian", "Bramble", "Pain", "Loath", "Glyph", "Imp", "Fiend", "Hailstone", "Gale", "Dire", "Soul",
            "Corpse", "Carrion", "Armageddon", "Havoc", "Bitter", "Entropy", "Chaos", "Order", "Rule", "Corruption"
        ];
const rareName2 = [
            "Bite", "Scalpel", "Gutter", "Razor", "Edge", "Splitter", "Sever", "Rend", "Slayer", "Spawn", "Star", 
            "Smasher", "Crusher", "Grinder", "Mallet", "Lance", "Impaler", "Prod", "Wand", "Barb", "Dart", "Quarrel", 
            "Flight", "Horn", "Quill", "Branch", "Song", "Cry", "Chant", "Gnarl", "Crest", "Veil", "Mask", "Casque", 
            "Cowl", "Pelt", "Coat", "Suit", "Shroud", "Mantle", "Badge", "Aegis", "Tower", "Wing", "Emblem", "Fist", 
            "Clutches", "Grasp", "Touch", "Knuckle", "Spur", "Stalker", "Blazer", "Trample", "Track", "Clasp", "Harness", 
            "Fringe", "Chain", "Lash", "Knot", "Loop", "Turn", "Coil", "Band", "Talisman", "Noose", "Collar", "Torc", 
            "Scarab", "Brand", "Cudgel", "Harp", "Barri", "Crook", "Shell", "Picket", "Flange", "Scratch", "Fang", 
            "Thirst", "Scythe", "Saw", "Cleaver", "Sunder", "Mangler", "Reaver", "Gnash", "Blow", "Bane", "Breaker", 
            "Crack", "Knell", "Spike", "Skewer", "Scourge", "Wrack", "Needle", "Bolt", "Fletch", "Nock", "Stinger", 
            "Goad", "Spire", "Call", "Spell", "Weaver", "Visage", "Circlet", "Hood", "Brow", "Visor", "Hide", "Wood", 
            "Carapace", "Wrap", "Cloak", "Jack", "Guard", "Rock", "Ward", "Shield", "Mark", "Hand", "Claw", "Grip", 
            "Hold", "Finger", "Shank", "Tread", "Greave", "Nails", "Brogues", "Slippers", "Buckle", "Lock", "Winding", 
            "Strap", "Cord", "Circle", "Eye", "Spiral", "Gyre", "Whorl", "Heart", "Necklace", "Beads", "Gorget",
            "Bludgeon", "Loom", "Master", "Hew", "Mar", "Stake"
        ];

        const uniqueTable = [
    // Unique Weapons
{baseItem: "Sandals", baseItemType: "armor", uniqueName: "Centurion's Caligae", properties: ["While wearing these sandals, your movement speed is increased by 5 feet.", "You can use these sandals as a weapon to make unarmed strikes. If you hit with your feet, you deal piercing damage equal to 1d6 + your Strength modifier.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Shoes", baseItemType: "armor", uniqueName: "Bruise Waders", properties: ["While wearing these shoes, you can pass through enemies as though they were allies.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Leather Boots", baseItemType: "armor", uniqueName: "Sander's Riff Raff", properties: ["While wearing these boots, your movement speed is increased by 10 feet.", "You gain a +1 bonus to attack rolls.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Sash", baseItemType: "armor", uniqueName: "Death's Guard", properties: ["When you take Cold damage, you can reduce it by 1d8, to a minimum of 1.", "When you take Poison damage, you can reduce it by 1d8, to a minimum of 1.", "You are immune to the Poisoned condition.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Heavy Leather Gloves", baseItemType: "armor", uniqueName: "Blacksmith's Work Gloves", properties: ["Your hands are immune to fire damage while wearing these gloves. Spells and attacks against you are not affected by this benefit.", "Once per day you can cast Heat Metal at 3rd level, targeting only a weapon you are holding.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Skull Helmet", baseItemType: "armor", uniqueName: "Blood Binder", properties: ["You are always considered bloodied, regardless of your current hit points.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Buckler", baseItemType: "armor", uniqueName: "Umbral Disk", properties: ["You maximum hit point value is increased by 7.", "While wearing this item, light sources you carry shed 5 feet less bright and dim light.", "When you hit a target, they are blinded until the end of their next turn.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Shield", baseItemType: "armor", uniqueName: "Reprisal", properties: ["When you take damage from a melee attack, you can use your reaction to make a melee weapon attack against the triggering enemy.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Cloak", baseItemType: "armor", uniqueName: "Cinder", properties: ["While wearing this armor, spells that deal fire damage have their spell point cost reduced by one.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Cape", baseItemType: "armor", uniqueName: "Smokeweave", properties: ["When you start your turn with 0 spell points, you regain 1d4+1 spell points.", "When you take elemental damage, you can reduce it by 1d6, to a minimum of 1.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Quilted Armor", baseItemType: "armor", uniqueName: "Arctic Furs", properties: ["You gain a +1 to AC.", "You gain resistance to cold damage.", "After you take elemental damage, your next attack deals 1d6 extra cold damage.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Leather Armor", baseItemType: "armor", uniqueName: "Gladiator's Bindings", properties: ["You gain a +2 to your Strength and Dexterity ability scores.", "While you are bloodied and still have hit points, you regain 1d4 hit points at the start of your turn.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Sudded Leather Armor", baseItemType: "armor", uniqueName: "Twitchthroe", properties: ["You gain a +2 to AC. This increases to a +3 if you are wielding a shield.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Sudded Leather Armor", baseItemType: "armor", uniqueName: "Runic Stealth", properties: ["While wearing this item, your speed increases by 5 feet.", "You gain a +1 bonus to your Dexterity saving throws.", "When you take a short rest, you can regain 1 spell point.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Hide Armor", baseItemType: "armor", uniqueName: "Laughing Death Armor", properties: ["When you drop to 0 hit points, spectral bones encase you, letting you remain conscious for 1 additional round before falling unconscious.", "When you take necrotic damage, you can reduce it by 1d8.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Chain Shirt", baseItemType: "armor", uniqueName: "Flexweave", properties: ["You gain resistance to physical damage.", "While wearing this armor, you gain advantage on Stealth checks.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Chain Mail", baseItemType: "armor", uniqueName: "Chthonic Vestments", properties: ["You gain resistance to Fire damage.", "Your weapon attacks deal an extra 1d6 fire damage.", ], multiplier: 7, tier: 1, weight: 4},
{baseItem: "Club", baseItemType: "weapon", uniqueName: "Deadwood", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 Necrotic damage.", "When you hit a creature with a melee attack, the creature is pushed 5 feet.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Dagger", baseItemType: "weapon", uniqueName: "Skinner", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "Your sneak attack damage with this weapon deals an extra 1d6 for each of your allies adjacent to the target.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Greatclub", baseItemType: "weapon", uniqueName: "Suicide Branch", properties: ["You gain a +1 to all attack and damage rolls.", "While using this weapon, you become vulnerable to all damage", "while you are wieldig this weapon, your hit point maximum increases by 45.", "When you take damage from a melee attack, the attacker takes 3d6+3 piercing damage.", "When you take damage from a melee attack, the attacker takes 3d6+3 piercing damage.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Handaxe", baseItemType: "weapon", uniqueName: "Brother", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "When you take glancing damage from a weapon attack (or are missed by 5 or fewer), your next weapon attack deals max weapon damage.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Javelin", baseItemType: "weapon", uniqueName: "Edea's Frost", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon's damage is Cold instead of piercing.", "This weapon has a does not have a minimum range.", "This weapon deals an additional 1d6 Cold damage.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Light Hammer", baseItemType: "weapon", uniqueName: "Blackfeather", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "When an enemy misses you with a ranged attack, you can use your reaction to make a ranged weapon attack at the triggering enemy.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Mace", baseItemType: "weapon", uniqueName: "Cracking Jack", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 bludgeoning damage on a hit.", "When you hit a target with this weapon, their speed is reduced by half until the end of your next turn.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Metal Knuckles", baseItemType: "weapon", uniqueName: "Demigod Bindings", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "When you hit an enemy with your Flurry of Blows, the first time an ally hits the target before the start of your net turn, the target takes an extra 1d6 force damage.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Quarterstaff", baseItemType: "weapon", uniqueName: "Razorswitch", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 slashing damage on a hit.", "When you take damage from a melee attack, the attacker takes 1d8 piercing damage.", "When you take elemental damage, you can reduce it by 1d4.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Sickle", baseItemType: "weapon", uniqueName: "Soul Flayer", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "While wielding this weapon, spells that deal fire damage have their spell point cost reduced by 1.", "Your speed is increased by 5 feet.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Spear", baseItemType: "weapon", uniqueName: "Sparkicus", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d12 lightning damage.", "Allies within 30 feet of you who can hear you gain a +1 bonus to dexterity saving throws.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Light Crossbow", baseItemType: "weapon", uniqueName: "Crow Talon", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "When you attack with this weapon, you can choose to expend spell points to enhance your shot. For every 2 spell points you spend in this way, the creature and each adjacent creature take 1d4 fire damage.", "You gain 4 spell points that are regained after a long rest.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Dart", baseItemType: "weapon", uniqueName: "Shell Piercer", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "Each time you deal damage to a creature with this weapon, subsequent damage rolls with this weapon against the target are increased by 2. This effect stacks.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Shortbow", baseItemType: "weapon", uniqueName: "Rift Bow", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "As a bonus action if you have not moved this turn, you can activate your bow until the end of your turn.", "While this weapon is activated, your speed is reduced to 0. Additionally, as an action, you can use your attack action to roll 1d6-1, and make that many attacks. This is not affected by the Haste or Slow spells.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Sling", baseItemType: "weapon", uniqueName: "Breaking Mourn", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "When you score a critical hit with this weapon, choose one expended class feature that recharges on a short or long rest, and regain its use.", ], multiplier: 7, tier: 1, weight: 6},
{baseItem: "Leather Boots", baseItemType: "armor", uniqueName: "The Groove", properties: ["Once per short rest, you can  take the Disengage or Dash action as a bonus action on your turn, and your jump distance is doubled for the turn.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Belt", baseItemType: "armor", uniqueName: "Goldwrap", properties: ["While not in combat, you can feed this belt up to 20 gold pieces. For every 5 gold spent, gain an additional 1 armor point for the next encounter.", "All gold loot from an encounter is increased by 30%", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Padded Armor", baseItemType: "armor", uniqueName: "Nettlespun", properties: ["You gain a bonus to attack rolls equal to the number of enemies adjacent to you.", "You gain a bonus to your AC equal to the number of enemies adjacent to you.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Ring", baseItemType: "armor", uniqueName: "Raven Frost", properties: ["You gain a +1 to all attack rolls.", "You gain 3 spell points that are regained after a long rest.", "After you take cold damage, as long as you have more than 0 hp, you gain 1d6 hp.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Ring", baseItemType: "armor", uniqueName: "Nagelring", properties: ["You gain a +1 to all attack rolls.", "You gain 1 extra loot roll per encounter.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Ring", baseItemType: "armor", uniqueName: "Broken Promise Ring", properties: ["Each time you hit an enemy, you increase your crit range by 1, up to  an increase of 10. This bonus resets to 0 if you score a critical hit or the encounterends.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Ring", baseItemType: "armor", uniqueName: "Countess's Wedding Band", properties: ["Whenever you end your turn next to a bloodied enemy, you regain 1 hit point if you are not bloodied, or 1d6 hit points if you are.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Ring", baseItemType: "armor", uniqueName: "Arcstone", properties: ["Special: Comes as a pair of rings to be worn by 2 characters.", "At the start of every round of combat, an arc of lightning connects the two ring wearers. Each creature between the two characters takes 1d10 lightning damage", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Amulet", baseItemType: "armor", uniqueName: "Taproot", properties: ["You gain 1 spell point at the start of each of your turns, up to an amount equal to your level.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Amulet", baseItemType: "armor", uniqueName: "Chain of Whispers", properties: ["At the start of your turn, choose one enemy within 30 feet of you. The target takes 1d6 necrotic damage, and you gain a +1 attack bonus against them until the end of your turn.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Amulet", baseItemType: "armor", uniqueName: "Scarab Pendant", properties: ["You gain a +1 bonus to AC.", "You gain a +1 bonus to attack rolls.", "You gain resistance to poison damage, and immunity to the poisoned condition.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Amulet", baseItemType: "armor", uniqueName: "The Cat's Eye", properties: ["You gain a +2 bonus to Dexterity saving throws.", "Melee weapon attacks deal an extra 1d4 slashing damage.", "You gain +30 feet of darkvision.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Heavy Leather Boots", baseItemType: "armor", uniqueName: "Comet Fall", properties: ["When you take the dash action, if you move at least 25 feet toward the enemy into an adjacent space, make an unarmed strike against them. On a hit, you crash into them and deal 3d6 fire and 3d6 thunder damage, and push them 5 feet and enter their vacated space. If the target cannot be pushed back, you and the target each take half of the damage dealt.", "While wearing these boots, your movement speed is increased by 10 feet.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Chain Boots", baseItemType: "armor", uniqueName: "Battalion Marchers", properties: ["You have disadvantage on stealth checks.", "You and any ally within 30' of you who can hear you gain a +2 to initiative rolls.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Heavy Leather Belt", baseItemType: "armor", uniqueName: "Heathan's Defense", properties: ["You gain a +1 to your AC.", "Once per encounter when you take elemental damage, you can reduce it by 3d8, to a minimum of 6.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Vambrace", baseItemType: "armor", uniqueName: "Beruna's Regalia", properties: ["You gain resistance to Cold and Necrotic damage.", "You gain heal 1d6 hit points when you hit with a weapon attack.", "You gain heal 1d4 spell points when you hit with a spell attack.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Chain Gloves", baseItemType: "armor", uniqueName: "Chance Guards", properties: ["You gain 1 extra loot roll per encounter.", "All gold loot from an encounter is increased by 50%", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Bone Mask", baseItemType: "armor", uniqueName: "Succubi Queen's Visage", properties: ["When you take fire damage, you take an additional 1d6 fire damage", "You gain heal 1d6 hit points when you hit with a weapon attack", "Melee weapon attacks deal an extra 1d6 damage.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Crown", baseItemType: "armor", uniqueName: "Vengeful Monarch", properties: ["The first time an encounter that you are bloodied, all creatures within 10 feet of you must make a Constitution saving throw. On a failure, they take 3d6 poison damage, or half as much on a success.", "While you are bloodied and still have hit points, you regain 1d6 hit points at the start of each of your turns.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Full Helm", baseItemType: "armor", uniqueName: "Juggernaut", properties: ["When you take the dash action, if you move 20 feet or more toward an enemy, you can make a melee weapon attack at the end of the movement as a free action.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Kite Shield", baseItemType: "armor", uniqueName: "Windward", properties: ["When you or an ally within 5 feet of you are targeted with a ranged weapon attack, you can use your reaction to spend 1 spell point do impose disadvantage on the attack.", "You gain 3 spell points that are regained after a long rest.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Large Shield", baseItemType: "armor", uniqueName: "Claw Brace", properties: ["You gain a +2 to weapon attacks while wielding this shield.", "Your critical hit range is increased by 1 while wielding this shield.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Hardened Leather Armor", baseItemType: "armor", uniqueName: "Steel Pelt", properties: ["When you take physical damage, you can reduce it by 1d8, to a minimum of 1.", "When you take damage from a melee attack, the attacker takes 1d4 piercing damage.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Serpentskin Armor", baseItemType: "armor", uniqueName: "Viper Magi's Sheddings", properties: ["While wearing this armor, spells that deal lightning damage have their spell point cost reduced by one.", "Once per long rest, when you are reduced to 0 hit points, you can expend all of your current Spell Points, and regain an equal number of hit points.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Cuirass", baseItemType: "armor", uniqueName: "Emperor's Guidance", properties: ["While wearing this armor, if your maximum Spell Point value is higher than 8, and you are missing no more than 2 spell points, you gain resistance to all elemental damage.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Field Plate", baseItemType: "armor", uniqueName: "Son of Thunder", properties: ["When you hit a demon with a weapon attack, you deal an extra 1d8 weapon damage.", "While wearing this armor, you can add the Thunderous Smite spell to your spells known list.", "You gain 8 spell points that are regained after a long rest.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Scale Mail", baseItemType: "armor", uniqueName: "Lightbranded Case", properties: ["You gain a +2 bonus to AC.", "While wielding a shield, you gain an additional +1 AC.", "While wearing this item, light sources you carry shed 10 feet more bright and dim light.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Ring Mail", baseItemType: "armor", uniqueName: "Letualle's Rig", properties: ["You gain resistance to Psychic damage.", "After you deal Psychic damage, the target is suffers a -1d6 penalty to all saving throws until the start of your next turn.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Wyrmhide Armor", baseItemType: "armor", uniqueName: "Imaginary King's Leathers", properties: ["Once per loot session, you can roll a d8. On a 5 or higher, you gain one additional loot drop.", "When you are hit with a melee attack, each enemy within 10 feet of you takes 1d4 lightning damage.", "Once per long rest when you are hit with a melee attack, you can cast a level 5 lightning bolt at the triggering creature for free as a reaction.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Splint Mail", baseItemType: "armor", uniqueName: "Iceblink", properties: ["Once per encounter, as a bonus action you can activate this armor for one round. Any creature that hits you with a melee attack while the armor is activated is incased in magical ice and restrained, Strength save ends.", "You have resistance to cold damage. If this armor is active, you are immune to cold damage instead.", ], multiplier: 12, tier: 2, weight: 8},
{baseItem: "Club", baseItemType: "weapon", uniqueName: "The Oculus", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "When you reduce an enemy to 0 hit points, you regain 2 spell points.", "When you take damage from an enemy attack, you can use your reaction to teleport up to 15 feet to an empty space you can see. After using this property, roll a d20. On a result of 14 or higher, you can use this property again, otherwise you must complete a Long Rest before you can use it again.", "You gain a +1 bonus to spell attack rolls and to the saving throw DCs of your spells.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Shortbow", baseItemType: "weapon", uniqueName: "HIdden Quip", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 fire damage.", "This weapon deals an extra 1d6 force damage.", "When you hit a creature with this weapon, any damage dice you roll that roll maximum can be rolled again and added to the result.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Battleaxe", baseItemType: "weapon", uniqueName: "Dregblaze", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "Enemies you kill while raging detonate, dealing 1d6 fire damage to all enemies within 5 feet of them.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Flail", baseItemType: "weapon", uniqueName: "Sonya's Dishonor", properties: ["You gain a +1 to attack rolls with this weapon.", "You gain a bonus to damage rolls equal to your missing hit points divided by 10 (minimum 1)", "while you are wielding this weapon, your hit point maximum increases by 15.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Glaive", baseItemType: "weapon", uniqueName: "Valkyrie", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "Once per encounter, when you are targeted by a ranged weapon attack, as a reaction you can increase your AC by your proficiency bonus.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Greataxe", baseItemType: "weapon", uniqueName: "Spellsteel", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "If you have made a melee weapon attack since the start of your last turn, you deal an extra 2d8 force damage", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Greatsword", baseItemType: "weapon", uniqueName: "Dragonsgold Blade", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 fire damage.", "As an action, you swing the blade in a wide arc in front of you. Make a melee attack against each creature in a 10' 180 degree arc centered on you. On a hit, the target takes fire damage of a number of d6's equal to your proficiency bonus. You regain this ability after a short or long rest.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Halberd", baseItemType: "weapon", uniqueName: "Flying Dragon", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "Once per short rest, you can cast Haste on yourself from this weapon and without concentration, lasting for 1d4 turns. When the effect ends, you do not become lethargic like the regular spell.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Lance", baseItemType: "weapon", uniqueName: "Mercurian Aspect", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "Once per short rest, as an action you can make a melee weapon attack using this lance against every creature within range.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Longsword", baseItemType: "weapon", uniqueName: "Pride", properties: ["When you use this weapon while you are not bloodied to attack a bloodied target, increase your critical strike range by 3.", "When you use this weapon while bloodied to attack a creature who is not blooied, you gain a +4 bonus to damage rolls.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Maul", baseItemType: "weapon", uniqueName: "Bonesnap", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "Your critical hit range increases by 2.", "You deal 2d6 extra bludgeoning damage to undead creatures.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Morningstar", baseItemType: "weapon", uniqueName: "Argument", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "Once per encounterwhen you take damage from a melee attack, you can use your reaction to make a melee attack with this weapon against the triggering creature.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Pike", baseItemType: "weapon", uniqueName: "Barracuda", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d10 piercing damage to living creatures", "While not wearing heavy armor, you gain 4 Armor Points.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Rapier", baseItemType: "weapon", uniqueName: "Volt", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "While you are not wielding any other weapons, you gain a +1 bonus to AC.", "This weapon deals an extra 1d8 lightning damage.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Scimitar", baseItemType: "weapon", uniqueName: "Crimson Fang", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "When you reduce a creature to 0 hit points with this weapon, you regain 1d8 hit points.", "As a bonus action, you can deal 1d12 slashing damage to yourself, and gain advantage on your next attack roll.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Scythe", baseItemType: "weapon", uniqueName: "Chiron's Reach", properties: ["You gain a +2 to damage rolls with this weapon.", "When you attack with this weapon, any d20 result 11 or higher hits the target, regardless of their AC", "This weapon deals an extra 1d8 cold damage.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Shortsword", baseItemType: "weapon", uniqueName: "Windseeker's Blade", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "On a hit, deal an extra 1d6 lightning damage to the target. You can also choose 1d4 creatures within 10 feet of the target. They must make a Dexterity saving throw with a DC of 12 + your proficiency bonus or take 1d6 lightning damage.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Trident", baseItemType: "weapon", uniqueName: "Fulminator", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "When you use this weapon to make a ranged weapon attack, the target and each creature within 5 feet of it take 1d6 lightning damage.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Warhammer", baseItemType: "weapon", uniqueName: "Heart of Iron", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon deals additional bludgeoning damage equal to your Consitution modifier.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "War pick", baseItemType: "weapon", uniqueName: "Bone Adze", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon deals an extra 2d6 piercing damage to undead targets.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Whip", baseItemType: "weapon", uniqueName: "Bramble", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "After you hit a creature with this weapon, the target takes 1d4 piercing damage for every 5 feet it willingly moves.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Hand Crossbow", baseItemType: "weapon", uniqueName: "Dead Drop", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "When you bloody an enemy with this weapon, you can make an additional ranged weapon attack as a free action.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Heavy Crossbow", baseItemType: "weapon", uniqueName: "Fable", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 poison damage.", "After hitting a creature with this weapon, the next time the target takes damage from a weapon attack, the target and each creature within five feet of it take an additional 1d6 poison damage.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Longbow", baseItemType: "weapon", uniqueName: "Calamity", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "Once per encounter, you can apply a 1st-level Hunter's Mark spell to the target of your ranged weapon attack as part of the attack.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Cudgel (Club)", baseItemType: "weapon", uniqueName: "Death's Web", properties: ["When you reduce a creature to 0 hit points, you regain 1d12 hit points", "When you reduce a creature to 0 hit points, you regain 1d6 spell points", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Dirk (Dagger)", baseItemType: "weapon", uniqueName: "Spectral Shard", properties: ["When you use your action to attack an enemy with this blade, you automatically hit. This attack cannot be a critical hit.", "You gain 8 spell points that are regained after a long rest.", "Once per encounter, you can cast a spell with a casting time of one action as a bonus action instead.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Gnarled Club (Greatclub)", baseItemType: "weapon", uniqueName: "Hellskull", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "When you hit a creature with this weapon, they take an additional 1d4 damage from any melee weapon attacks until the start of your next turn.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Hatchet (Handaxe)", baseItemType: "weapon", uniqueName: "Life Shear", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "When you hit a creature with this weapon that is not missing any hit points, you deal an extra 2d8 damage.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Harpoon (Javelin)", baseItemType: "weapon", uniqueName: "Holy Tether", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "As an action, each creature of your choice within 30 feet of you takes 1d6 radiant damage, and must stay within 30 feet of you until the start of your next turn, or you move further than 30 feet from them.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Knobkerrie (Light Hammer)", baseItemType: "weapon", uniqueName: "Long Arm", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "When you use this as a thrown weapon, you deal an extra 1d8 damage.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Mallet (Mace)", baseItemType: "weapon", uniqueName: "Simplicity", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "When you cast a cantrip that deals damage and target only a single creature, on their damage dice you can treat any 1 or 2 as a 3.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Claws (Metal Knuckles)", baseItemType: "weapon", uniqueName: "Iron Palm", properties: ["You gain a +4 to attack rolls with this weapon.", "After you take the attack action, you may role percentile dice. if the result is less than 5 plus your level, you may make one additional attack.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "War Staff (Quarterstaff)", baseItemType: "weapon", uniqueName: "Conversion", properties: ["You gain a +1 bonus to spell attack rolls and to the saving throw DCs of your spells.", "While wielding this staff, you can cast ranged cantrips as a bonus action with a range of Touch.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Hand Scythe (Sickle)", baseItemType: "weapon", uniqueName: "Shadow Talon", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 cold damage.", "This weapon deals an extra 1d6 necrotic damage.", "After hitting an enemy with this weapon, the are restrained until the start of their next turn.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Mancatcher (Spear)", baseItemType: "weapon", uniqueName: "Stormspire", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d12 lightning damage.", "After hitting a creature with this weapon, they take an additional 2d6 thunder damage at the end of their next turn.", "You gain resistance to lightning damage.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Arbalest (Light Crossbow)", baseItemType: "weapon", uniqueName: "Sunkeeper", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d8 radiant damage.", "While your hit points are less than your healing surge value, you gain resistance to all elemental damage.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Shuriken (Dart)", baseItemType: "weapon", uniqueName: "Shard Breaker", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "Once per short rest as part of an attack action with this weapon, you can target a number of creatures within your range up to your Wisdom modifier (minimum 1) and attack each of them with an attack.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Horse Bow (Shortbow)", baseItemType: "weapon", uniqueName: "Tempest", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d8 lightning damage.", "When you hit a creature with this weapon, you can push them 10 feet.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Hurler (Sling)", baseItemType: "weapon", uniqueName: "Pebble King", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "Once per short rest, as part of the attack action with this weapon, deal an extra 2d6 bludgeoning damage and push the target 10 feet.", ], multiplier: 12, tier: 2, weight: 11},
{baseItem: "Leather Gloves", baseItemType: "armor", uniqueName: "Cathma's Crest", properties: ["Whenever you spend Spell Points to cast a spell, you regain an equal number of hit points. If you are at full health, you instead gain that many temporary hit points.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Ring", baseItemType: "armor", uniqueName: "The Stone of Jordan", properties: ["You gain a +1 bonus to spell attack rolls and to the saving throw DCs of your spells.", "You gain 8 spell points that are regained after a long rest.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Ring", baseItemType: "armor", uniqueName: "Managwald", properties: ["When you deal damage with a weapon attack, you regain 3 spell points.", "When you deal damage with a weapon attack, you regain 1d4 hit points.", "While you are bloodied and still have hit points, you regain 1d6 hit points at the start of each of your turns.", "When you take damage from a melee weapon attack, you regain 1 spell point.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Amulet", baseItemType: "armor", uniqueName: "Liar's Bargain", properties: ["Once per encounter, when an effect would allow you to spend a healing surge, you can choose a creature within 30 feet of you that you can see. You expend the healing surge and the target takes damage equal to your healing surge value. Once you use this feature, you cannot regain hit points from any source until you finish a long rest.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Breast Plate", baseItemType: "armor", uniqueName: "Demon Shell", properties: ["You gain a bonus to your AC equal to your proficiency bonus.", "Once per encounter as a bonus action, each creature within 10 feet of you takes 2d4 cold damage", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Light Plate Boots", baseItemType: "armor", uniqueName: "Cautious Step", properties: ["While wearing these boots, you gain resistance to all damage effects caused by starting or ending your turn within a zone.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Light Plate Boots", baseItemType: "armor", uniqueName: "Shadow Dancer", properties: ["Increase your Speed by 5 feet.", "You gain a +1 bonus to Dexterity saving throws.", "When you deal damage with spells that deal necrotic damage, increase the damage by 1d8.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Greaves", baseItemType: "armor", uniqueName: "Gore Riders", properties: ["While wearing these boots, your weapon attacks deal and addtional 1d6 damage.", "Your crit range increases by 1.", "Your movement speed increases by 5 feet.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Mithril Coil", baseItemType: "armor", uniqueName: "Necromancer's Toolbelt", properties: ["When you deal necrotic damage with a spell, you regain 1d6 hit points.", "When you take necrotic damage, you gain 1d6 spell points.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Plated Belt", baseItemType: "armor", uniqueName: "Colossus Baldric", properties: ["Once per long rest, you can use an action to cast the Enlarge/Reduce spell on yourself (enlarge only), with no concentration. When you do, you also increase you Strength score to 18 or by one, whichever is higher.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Light Plate Gloves", baseItemType: "armor", uniqueName: "Magefist", properties: ["Spells that deal fire damage deal an extra 1d6 fire damage, and ignore fire resistance.", "You gain 6 spell points that are regained after a long rest.", "When you take a short rest, you can regain 1 spell point.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Diadem", baseItemType: "armor", uniqueName: "Griffon's Eye", properties: ["Enemies have disadvantage on saves against spells you cast that deal lightning damage.", "Any lightning damage you deal is increased by 1d10.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Circlet", baseItemType: "armor", uniqueName: "Thorn Wreath", properties: ["As a bonus action, you can activate this helm to decrease your AC by 1d4+1 until the end of your next turn. This effect can stack with itself.", "When you take damage from an attack while this item is activated, each enemy within 5 feet of you takes piercing damage equal to the amount your AC is reduced by.", "You gain 5 Armor Points.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Great Helm", baseItemType: "armor", uniqueName: "Veil of Steel", properties: ["While wearing this helm and not in daylight, you treat anything further than 10 feet away as though it was in total darkness, regardless of darkvision or light sources.", "You gain a +2 bonus to AC.", "You gain resistance to elemental damage.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Tower Shield", baseItemType: "armor", uniqueName: "Paizo Shield", properties: ["This shield has a number of hit points equal to your healing surge value. You can repair the shield by spending 25 x (your level) gold during a long rest, restoring any of the shield's missing hit points. If the shield has 0 hit points, you cannot use it, and the repair cost increases to 50 x (your level).", "When you take damage from an attack, you can use your reaction to absorb the damage with your shield. Any damage above the shield's current hit point value carries over to you.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Shroud", baseItemType: "armor", uniqueName: "Grave Ward", properties: ["You gain resistance to necrotic damage.", "When you deal damage with a weapon attack, you deal an extra 2d8 necrotic damage.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Grand Robe", baseItemType: "armor", uniqueName: "Dawn Priest's Drapery", properties: ["You gain a +1 bonus to your AC.", "Once per long rest, as an action you can unleash a brilliant flash of light from the robe that counts as daylight. The light deals 6d6 radiant damage to enemies within 5 feet of you, and 2d6 radiant damage to enemies within 20 feet of you.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Light Plate", baseItemType: "armor", uniqueName: "Angelic Battlegear", properties: ["When you make an attack roll against an undead, any d20 result of 5 or higher hits the target, regardless of their AC", "When you hit with a weapon attack, you regain 1d6 spell points.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Half Plate", baseItemType: "armor", uniqueName: "Wrath's Finery", properties: ["After you take damage from an attack, your next weapon attack deals 1d6 extra weapon damage.", "When you take Physical damage, you can reduce it by 1d8, to a minimum of 1.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Demonhide Armor", baseItemType: "armor", uniqueName: "Devil's Teeth", properties: ["You gain a +1 bonus to your Saving Throws", "When you reduce an enemy to 0 hit points and you have fewer than 10 hit points, you recover hit points equal to your healing surge value.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Archon Plate", baseItemType: "armor", uniqueName: "Legacy", properties: ["At the start of each day, choose one of the following benefits:", "RED: Your maximum hit points are increased by 25. While you are bloodied and still have hit points, you regain 1d8 hit points at the start of each of your turns.", "YELLOW: Once per loot session, you can roll a d8. On a 5 or higher, you gain one additional loot drop. Your speed increases by 5 feet. This armor does not have any proficiency or ability score requirements to wear effectively.", "BLUE: You gain 15 Spell Points. Spells cost 1 fewer spell points to cast.", "PURPLE: You gain a +1 to all of your ability scores, and a +1 to all of your saving throws.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Mesh Armor", baseItemType: "armor", uniqueName: "Sparkmail", properties: ["When you hit with a melee weapon attack, you deal an extra 1d12 lightning damage.", "When you take damage from a melee attack, the attacker takes 2d12 lightning damage.", "When you take damage from a melee attack, you take an extra 2d4 lightning damage.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Tigulated Mail", baseItemType: "armor", uniqueName: "Corpse Wail", properties: ["As a bonus action, you can cast fireball with a 5 foot radius from the body of a creature killed this encounter. When you do, you lose the loot roll for that creature, and cannot cast the spell from this body again.", "while you are wearing this armor, your hit point maximum increases by 10.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Full Plate Mail", baseItemType: "armor", uniqueName: "Castle of Stone", properties: ["Once per short rest, as an action you can activate the armor gaining several benefits until the end of your next turn: \nYou gain resistance to all damage.\n Enemies that can see you and attack one of your allies makes the attack at disadvantage.\n Your speed is reduced to 5 feet.\n You are immune to any forced movement or being knocked prone.", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Ancient Plate", baseItemType: "armor", uniqueName: "Goldskin", properties: ["While not in combat, you can feed this armor up to 200 gold pieces. For every 10 gold spent, gain an additional 1 armor point for the next encounter.", "All gold loot from an encounter is increased by 50%", ], multiplier: 18, tier: 3, weight: 16},
{baseItem: "Dagger", baseItemType: "weapon", uniqueName: "Temper", properties: ["You gain a +2 bonus to spell attack rolls and to the saving throw DCs of your spells.", "After you take damage from a spell or attack roll, spells you cast that deal damage have their cost reduced by 1 spell point, and the amount of their damage dice increased by 2.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Bearded Axe (Battleaxe)", baseItemType: "weapon", uniqueName: "Bastion of Frenzy", properties: ["You gain a +2 to attack  rolls with this weapon.", "Each time you hit an enemy, you gain a stacking +1 bonus to damage rolls, up to +10. This bonus resets to 0 if you miss or the encounter ends.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Shredder (Flail)", baseItemType: "weapon", uniqueName: "Ripper", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an additional 1d10 slashing damage.", "After you deal a critical hit with this weapon, the target takes 1d6 piercing damage at the start of each of its turns, Constituion save ends.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Bardiche (Glaive)", baseItemType: "weapon", uniqueName: "Harvest", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 2d4 necrotic damage.", "You gain advantage on attack rolls with this weapon against bloodied creatures.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Executioner (Greataxe)", baseItemType: "weapon", uniqueName: "Sever", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "You can double your Athletics score when making an attack to knock a creature prone.", "When you hit a prone creature with this weapon, it counts as a critical hit.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Claymore (Greatsword)", baseItemType: "weapon", uniqueName: "Oathbound Blade", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "As a bonus action, target one enemy within 60' of you and swear an oath against them. For the next minute, or until the target drops to 0 hit points, you have advantage on melee attack rolls against the target, and disadvantage on attacks against all other creatures. You can only have one oath at a time.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Poleaxe (Halberd)", baseItemType: "weapon", uniqueName: "Ruin", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra1d8 force damage.", "Once per short rest, when you hit a creature with this weapon, you can deal maximum damage instead of rolling.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Ranseur (Lance)", baseItemType: "weapon", uniqueName: "Rolling Thunder", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 2d10 thunder damage.", "Once per short rest  as part of an attack, if you have moved at least 25 feet closer to the target this turn, the target must make a Constitution saving throw or be stunned until the end of its next turn.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Broad Sword (Longsword)", baseItemType: "weapon", uniqueName: "Azurewrath", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "deal 1d6 extra force damage", "1d6 extra cold damage", "As a bonus action, deal 1d6 radiant damage to all demons and undead within 10 feet of you.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Broad Sword (Longsword)", baseItemType: "weapon", uniqueName: "Steward of Judgement", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "When you hit a creature using a paladin smite, you can choose one additional creature within 5 feet of the target to also take the smite's additional radiant damage.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Sledge (Maul)", baseItemType: "weapon", uniqueName: "Black King's March", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "As a bonus action, you can cast fireball with a 5 foot radius from the body of a creature killed this encounter. When you do, you lose the loot roll for that creature, and cannot cast the spell from this body again.", "As a bonus action, you can cast fireball with a 5 foot radius from the body of a creature killed this encounter. When you do, you lose the loot roll for that creature, and cannot cast the spell from this body again.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Flanged Mace (Morningstar)", baseItemType: "weapon", uniqueName: "Shred of Life", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "When you kill an undead enemy, you gain 1d10 temporary hit points.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Partisan (Pike)", baseItemType: "weapon", uniqueName: "Phalanx", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "Once per encounter as a bonus action, you can activate this weapon, lasting until the end of your next turn. While activated, you gain a bonus to damage rolls with this weapon equal to 3 x the number of allies within 5 feet of you.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Spadroon (Rapier)", baseItemType: "weapon", uniqueName: "Tensazan", properties: ["Once per long rest as an action you can activate this weapon until the end of the encounter, so long as you continue to wield this weapon. While activated, you gain the following benefits.\n You gain a +4 bonus to weapon attack rolls.\n When you take the attack action, you can use your bonus action to make a melee weapon attack.\n You gain a +2 bonus to Dexterity saving throws.\n Your movement speed increases by 5 feet.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Sabre (Scimitar)", baseItemType: "weapon", uniqueName: "Bloodmoon", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "When you deal damage with this weapon, you regain 1d6 hit points.", "After you hit a living creature with this weapon, the target takes an additional 2d6 damage at the end of their next turn.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Giant Thresher (Scythe)", baseItemType: "weapon", uniqueName: "Vitality Clutch", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d4 necrotic damage.", "Once per long rest, as an action you can use this weapon to make a melee weapon attack against each enemy within 10 feet of you. While using this ability, you also regain 1d4 hit points with each hit.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Gladius (Shortsword)", baseItemType: "weapon", uniqueName: "The Crucible", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d8 force damage.", "When you reduce an undead creature to 0 hit points with this weapon, you regain 1d6 hit points and restore 2 armor points.", "When you reduce a demon creature to 0 hit points with this weapon, you regain 2d6 hit points and restore up to 4 armor points.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Brandistock (Trident)", baseItemType: "weapon", uniqueName: "Arcane Coil", properties: ["You gain a +1 to attack and damage rolls with this weapon.", "Your spell attacks gain a +3 to damage rolls.", "Once per short rest, when you take elemental damage, you can use your reaction to regain 1d6 spell points.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Battle Gavel (Warhammer)", baseItemType: "weapon", uniqueName: "Earthshatter", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an additional 1d10 bludgeoning damage.", "Once per long rest as an action, each creature of your choice must make a Dexterity saving throw or be knocked prone and take 4d8 thunder damage, or half as much on a save and not be knocked prone.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Crowbill (War pick)", baseItemType: "weapon", uniqueName: "Steel Surge", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 2d4 piercing damage.", "Once per short rest when you hit a creature with this weapon,", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Flog (Whip)", baseItemType: "weapon", uniqueName: "Incense Torch", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "Once per short rest, you can cast the Fog Cloud spell from this weapon at no cost.", "While wielding this weapon, spells that deal fire or radiant damage have their spell point cost reduced by 2.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Stake Thrower (Hand Crossbow)", baseItemType: "weapon", uniqueName: "Venomspitter", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d8 acid damage.", "This weapon deals an extra 1d8 poison damage.", "Oncer per short rest when you hit a creature with this weapon, the target is poisoned, Constitution save ends.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Ballista (Heavy Crossbow)", baseItemType: "weapon", uniqueName: "Echo", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 thunder damage.", "Once per long rest, when you are hit with a melee weapon attack, you can use your reaction and gain resistance to all damage for the triggering attack. Each creature adjacent to you then takes half damage from the triggering attack as thunder damage.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "War Bow (Longbow)", baseItemType: "weapon", uniqueName: "Hail", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d10 cold damage.", "Once per long rest, as an action you can make a ranged weapon attack against every creature in a 60 foot cone.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Truncheon (Club)", baseItemType: "weapon", uniqueName: "Bloodtree", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "While wielding this weapon, you deal an extra 1d6 force damage with alll weapon attacks.", "While you are wielding this weapon, your hit point maximum increases by 10.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Truncheon (Club)", baseItemType: "weapon", uniqueName: "Convergence", properties: ["When you cast a spell that can target multiple creatures but only target one, your crit range for the spell is increased by 2.", "Your spell attacks gain a +2 to damage rolls.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Stiletto (Dagger)", baseItemType: "weapon", uniqueName: "Shard of Infinity", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "Once per short rest, you can cast the Fog Cloud spell from this weapon at no cost.", "Once per long rest, as an action you can consume up to 50 gold pieces to regain health. For every 5 gold spent, lose 5 hit points. At the start of your next turn, you regain 1d12+5 hit points for every 5 gold spent.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Tyrant (Greatclub)", baseItemType: "weapon", uniqueName: "Megabonker", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "Once per turn, when you hit a creature with an attack, you can choose one of the following effects:\n BONK!: Each creature within 5 feet of the target (excluding you) takes 2d6 bludgeoning damage.\n BOOM, Haha!: Each creature within 5 feet of the target (excluding you) is pushed 5 feet away from the target.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Cleaver (Handaxe)", baseItemType: "weapon", uniqueName: "Carnage", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an additional 1d8 slashing damage.", "When you hit the same creature twice in once turn with this weapon, they take 1d8 piercing damage at the start of each of their turns, Constitution save ends.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Dardo (Javelin)", baseItemType: "weapon", uniqueName: "Lightning's Fury", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "Once per long rest, when you throw this weapon and hit a target, you can cast a level 3 Lightning Bolt from the weapon, starting from the target's square, including them in the spell's line.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Hurlbat (Light Hammer)", baseItemType: "weapon", uniqueName: "Shadowstone", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "when you make a ranged weapon attack with this weapon, you can shift up to 10 feet as a free action.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Scepter (Mace)", baseItemType: "weapon", uniqueName: "The Magister", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "While you are missing hit points and still conscious, you regain 1d4+1 hit points at the start of each of your turns.", "When you hit a creature with this weapon, they cannot regain hit points from any source until the start of your next turn.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Kaiser Fist (Metal Knuckles)", baseItemType: "weapon", uniqueName: "Night Knight Knuckles", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "After you take the attack action, you may role percentile dice. if the result is less than 5 plus your level, you may make one additional attack.", "Oncer per encounter, if you hit a single target with 3 or more melee weapon attacks, you can cast a level 4 sleep spell affecting only the target you attacked as a free action.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Rune Staff (Quarterstaff)", baseItemType: "weapon", uniqueName: "Serpent Lord", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "Attacks with this weapon deal an extra 1d6 Poison damage.", "When you hit an enemy with this weapon, you gain a number of spell points equal to the bludgeoning damage dice result", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Thresher (Sickle)", baseItemType: "weapon", uniqueName: "The Reaper's Toll", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "Your critical hit range is increased by 1.", "Attacks with this weapon deal an extra 1d10 cold damage.", "When you deal damage with this weapon, you regain 1d10 hit points.", "When you hit a creature with this weapon, the target makes a Wisdom save throw or be affected  by the Slow spell, Wisdom save ends.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Yari (Spear)", baseItemType: "weapon", uniqueName: "Ripfang", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "When you hit a creature with this weapon, you can use your reaction to make an opportunity attack against them if they move more than 5 feet before the end of their next turn.", "When you hit a creature with this weapon, you can use your reaction to make an opportunity attack against them if they move more than 5 feet before the end of their next turn.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Battle Crossbow (Light Crossbow)", baseItemType: "weapon", uniqueName: "Ember of Hellfire", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 fire damage.", "Once per encounter when you hit a creature with this weapon, they catch fire and take 1d6 fire damage at the start of each of their turns until they use an action to extinguish the flames.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Kunai (Dart)", baseItemType: "weapon", uniqueName: "Ghostflame", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "When you attack with this weapon, any d20 result 11 or higher hits the target, regardless of their AC", "This weapon deals force damage instead of piercing damage.", "You gain 1 spell point after hitting an enemy with this weapon.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Composite Bow (Shortbow)", baseItemType: "weapon", uniqueName: "Frozen Thorn", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 cold damage.", "Once per long rest, when you hit a creature with this weapon, you can deal 1d8 necrotic and 1d8 cold damage to all creatures of your choice within 10 feet of the target. Affected creatures must make a Strength save throw, or be grappled by shadowy hands, Strength save ends.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Hand Trebuchet (Sling)", baseItemType: "weapon", uniqueName: "Goliath's Bane", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "Your critical hit range increases by 3.", "You gain advantage when you use this weapon to attack a large or larger creature.", "Critical hits with this weapon deal an additional 3d8 bludgeoning damage.", ], multiplier: 18, tier: 3, weight: 22},
{baseItem: "Sash", baseItemType: "armor", uniqueName: "String of Ears", properties: ["When you deal damage with a weapon attack while bloodied, you regain 1d6 hit points.", "You gain 5 Armor Points", ], multiplier: 25, tier: 4, weight: 26},
{baseItem: "Leather Cap", baseItemType: "armor", uniqueName: "Shako", properties: ["You gain a +1 bonus to all ability scores.", "You gain 10 maximum hit points.", "You gain 10 spell points that return on a long rest.", ], multiplier: 25, tier: 4, weight: 26},
{baseItem: "Gambeson", baseItemType: "armor", uniqueName: "Scholar's Virtue", properties: ["When you cast a spell that deals damage, you can increase the amount of damage dice you roll by 2.", "Once per short rest, you can cast a spell with a casting time of one action as a bonus action instead.", ], multiplier: 25, tier: 4, weight: 26},
{baseItem: "Plate Gauntlets", baseItemType: "armor", uniqueName: "Frostburn", properties: ["You gain 12 spell points that are regained after a long rest.", "When you deal cold damage, the target is is affected by the Slow spell until the start of your next turn.", ], multiplier: 25, tier: 4, weight: 26},
{baseItem: "Armet", baseItemType: "armor", uniqueName: "Watchtower", properties: ["While wearing this helmet, your speed increases by 5 feet.", "You gain a +1 to all your ability scores.", ], multiplier: 25, tier: 4, weight: 26},
{baseItem: "Gothic Shield", baseItemType: "armor", uniqueName: "Dragon's Scale", properties: ["While using this shield, you gain resistance to fire damage.", "Your weapon attacks deal an extra 1d6 fire damage.", "Once per day, as an action you can cast Scorching Ray at 4th level.", ], multiplier: 25, tier: 4, weight: 26},
{baseItem: "Aegis", baseItemType: "armor", uniqueName: "Spirit Ward", properties: ["When you take damage from an attack, roll a d20. On a 20, you become intangible for 1d4 rounds, gaining resistance to physical, cold, necrotic, and radiant damage.", ], multiplier: 25, tier: 4, weight: 26},
{baseItem: "Gothic Plate", baseItemType: "armor", uniqueName: "Horadric Wrappings", properties: ["This armor does not have any proficiency or ability score requirements to wear effectively.", "Once per encounter, you can cast a spell with a casting time of one action as a bonus action instead.", "You gain a +1 bonus to spell attack rolls and to the saving throw DCs of your spells.", ], multiplier: 25, tier: 4, weight: 26},
{baseItem: "Templar Plate", baseItemType: "armor", uniqueName: "Seraph's Might", properties: ["This armor does not have any proficiency or ability score requirements to wear effectively.", "You gain a +2 bonus to your Strength ability score.", "When you deal damage to demons while wearing this armor, you can add 2d6 radiant damage to the roll.", ], multiplier: 25, tier: 4, weight: 26},
{baseItem: "Tabar (Battleaxe)", baseItemType: "weapon", uniqueName: "Bloodmoon Crescent", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d8 necrotic damage.", "While you are bloodied, this weapon deals an additional 2d8 radiant damage.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Scorpion Flail (Flail)", baseItemType: "weapon", uniqueName: "Blight Stinger", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "When a creature is hit by this weapon, they take 1d4 poison damage at the start of each of their turns, Constitution save ends.", "Once per turn, this weapon deals an extra 3d8 poison damage to creatures with an ongoing effect.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Kwan Dao (Glaive)", baseItemType: "weapon", uniqueName: "Whirlwind Blade", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "Once per short rest, as part of your movement, you can move up to your speed in a straight line to an unoccupied space you can see. You hit each enemy you pass within your weapon’s reach, dealing glancing damage plus any additional effects that may trigger. This movement does not provoke opportunity attacks.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Gothic Axe (Greataxe)", baseItemType: "weapon", uniqueName: "Skysplitter", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "Once per encounter as an action, you can make a melee weapon attack against each adjacent creature. On a hit, this weapon deals an extra 1d10 radiant and 1d10 lightning damage. Then, until the end of the encounter, you can reroll any damage rolls yo make, but must use the second result.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Zweihander (Greatsword)", baseItemType: "weapon", uniqueName: "Death's Flame", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals 2d8 extra fire damage.", "While wielding this weapon, you can add Firebolt to your spells known list.", "While wielding this weapon, you can add Wall of Fire to your spells known list.", "While wielding this weapon, you can add Holy Weapon to your spells known list. When casting this version of the spell, change the spells damage from radiant to fire damage.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Zweihander (Greatsword)", baseItemType: "weapon", uniqueName: "The Grandfather", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "while you are wearing this armor, your hit point maximum increases by 20.", "You gain a +3 to you Constitution ability modifier.", "Special: If your Strength ability score is 19 or higher, you can wield this weapon in one hand.", "Special: This weapon's base damage is 2d20 slashing damage.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Bec de Corbin (Halberd)", baseItemType: "weapon", uniqueName: "Eulogy", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 2d6 necrotic damage.", "Once per long rest, when you reduce a living creature to 0 hit points with this weapon, you can raise them as a skeleton under your control until the end of the next encounter.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Spetum (Lance)", baseItemType: "weapon", uniqueName: "Caber", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals bludgeoning instead of piercing damage.", "This weapon gains the Thrown property, with a range of 20/60", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Bastard Sword (Longsword)", baseItemType: "weapon", uniqueName: "Hellplague", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals 1d10 extra fire damage.", "This weapon deals 1d10 extra poison damage.", "When you deal damage with a weapon attack, you regain 1d4 hit points.", "When you deal damage with a weapon attack, you regain 1 spell point.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Bastard Sword (Longsword)", baseItemType: "weapon", uniqueName: "Samurai's Edge", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "Sheath: \n As an action you sheathe your sword and infuse it with magic from the sword sheath. This action can be done outside of combat, lasting until the sword is drawn.\n Single-Stroke Strike:\n As an action, you stare down an opponent for a brief moment. Target a creature within 20 feet of you. You move to an adjacent empty space behind them, and make an attack roll. This movement does not provoke opportunity attacks. The target must then use their reaction if available to counter it with their own melee attack.\n If your attack roll is higher than theirs, you deal an extra 8d12 slashing damage and they are knocked prone.\n If their attack is higher, but you still hit, the attack deals regular damage.\n If their attack is higher and you miss, you take damage from their melee attack.\n If the target does not have a reaction, you automatically hit and deal an extra 8d12 slashing damage and they are knocked prone.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Driver (Maul)", baseItemType: "weapon", uniqueName: "The Gavel of Pain", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "When you hit a creature with this weapon, the next time they hit with a melee weapon attack before the end of their next turn, they take piercing damage equal to the amount of damage they deal.", "When you hit a creature with this weapon, the next attack against them before the end of your next turn deals 2d8 extra damage.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Guisarme (Pike)", baseItemType: "weapon", uniqueName: "Troll Skewer", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d8 piercing damage.", "Once per encounter when you hit with this weapon, make an Athletics check. You can move the target a number of feet equal to your result, rounded down to the nearest 5 (minimum 5). The target must remain within your reach for the entire movement.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Epee (Rapier)", baseItemType: "weapon", uniqueName: "Duelist", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 piercing damage.", "When you hit a creature with this weapon and no other creatures are within 5 feet of you or the target, you deal an additional 2d6 damage.", "When a creature misses you with a melee attack, you can use your reaction to make an attack against them with this weapon.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Falchion (Scimitar)", baseItemType: "weapon", uniqueName: "Kraken Tooth", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 2d6 cold damage.", "While wielding this weapon, you can add the spells Armor of Agaths, Blink, and Shadow of Moil to your spells known.", "You gain 6 spell points that are regained after a long rest.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Grimm (Scythe)", baseItemType: "weapon", uniqueName: "Creed", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals 2d4 extra cold damage.", "This weapon deals 2d4 extra necrotic damage.", "Once per short rest, you can cast a level 3 Counter Spell spell from this weapon.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Tulwar (Shortsword)", baseItemType: "weapon", uniqueName: "Blade Of Ali Baba", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "All gold loot from an encounter is doubled.", "Gives 2 extra loot rolls per encounter.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "War Fork (Trident)", baseItemType: "weapon", uniqueName: "Ghom's Fork", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 2d6 poison damage to living creatures.", "When you reduce an enemy to 0 hit points with this weapon, you can lose the loot roll for that creature, and each creature of your choice within 10 feet of the target must make a Consititution saving throw or be poisoned, Constitution save ends.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Skullcracker (Warhammer)", baseItemType: "weapon", uniqueName: "Iron Tide", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals 1d6 extra bludgeoning damage against creatures that are a larger size category than you.", "Once per round when you hit a creature with this weapon, you can push them 5 feet, and immediately shift into the spot they just left.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Mattock (War pick)", baseItemType: "weapon", uniqueName: "Skullpiercer", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "When you hit a creature with this weapon and roll damage dice, if you roll the maximum number, you may roll that die again and add the result to your damage. You can repeat this process as long as you continue to roll the maximum value on the die", "Once per short rest, you can cast a level 6 Counter Spell spell from this weapon with a range of 5 feet.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Scourge (Whip)", baseItemType: "weapon", uniqueName: "Ashen Warrior Bindings", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d6 fire damage.", "When attacking a creature within 5 feet of you, the base weapon damage changes to 2d8 slashing damage. If you score a critical hit, the target is knocked 10' into the air, and you can leap up and make an additional melee attack as a free action. You each then must make a DC 15 acrobatics check or take 1d6 bludgeoning fall damage.", "Cursed: Once equipped, a spiked leather length wraps itself around your forearm, digging into your flesh. You initially take 1d6 piercing damage, and the weapon cannot be unequipped. It can only be removed by casting the wish spell, or if the wielder dies.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Bolt Pistol (Hand Crossbow)", baseItemType: "weapon", uniqueName: "Beguiler", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d8 radiant damage.", "When you hit with this weapon, you can move up to 10 feet. This movement does not affect your regular movement for the turn.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Colossus Crossbow (Heavy Crossbow)", baseItemType: "weapon", uniqueName: "Hellrack", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "deals 1d8 extra cold damage", "deals 1d8 extra fire damage", "deals 1d8 extra lightning damage", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Siege Bow (Longbow)", baseItemType: "weapon", uniqueName: "Wizendraw", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals an extra 1d10 cold damage.", "You gain 12 spell points that are regained after a long rest.", "When you hit a creature with this weapon, you can choose to spend up to 4 spell points, adding 1d6 cold damage for each spell point spent.", ], multiplier: 25, tier: 4, weight: 30},
{baseItem: "Leather Cap", baseItemType: "armor", uniqueName: "Fool's Crest", properties: ["When you don this hat, increase your max hit points by 40 and heal by the same amount. When you remove the hat, you take 40 damage, then reduce your maximum hit points by 40.", "You gain a +1 to all ability scores.", "Attacks that deal damage to you deal an extra 1d4 damage.", "When you make an attack roll, you take 1d4 psychic damage.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Leather Cap", baseItemType: "armor", uniqueName: "Harlequin's Crest", properties: ["Your spell save DC and spell attacks are each increased by +2", "You gain a +1 to all ability scores.", "Your AC decreases by 1.", "Your maximum hit points decrease by 10", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Cape", baseItemType: "armor", uniqueName: "Nightscape", properties: ["While not wearing any accoutremont armor, you gain a +6 to your AC.", "While not wearing any accoutremont armor, you gain a +2 to all ability scores.", "While wearing this item, light sources you carry shed 5 feet less bright and dim light.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Ring", baseItemType: "armor", uniqueName: "Ring of Truth", properties: ["You gain a +1 bonus to your AC and saving throws.", "You gain 10 maximum hit points.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Ring", baseItemType: "armor", uniqueName: "Empyrean Band", properties: ["You gain a +1 to all ability scores.", "Light sources you carry shed 5 feet more bright and dim light.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Ring", baseItemType: "armor", uniqueName: "Constricting Ring", properties: ["You gain a +5 bonus to all saving throws.", "You take no damage from effects that would cause you to take half damage on a save.", "When you first put this ring on, and then at the start of every round of combat, your maximum HP is permanently reduced by 1. This HP reduction can only be undone by Divine Intervention or the Wish spell.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Amulet", baseItemType: "armor", uniqueName: "Optic Amulet", properties: ["Light sources you carry shed 10 feet more bright and dim light.", "You gain a +3 to saving throws against effects that deal lightning damage.", "While wearing this amulet, you can increase your total known or prepared spells by 1.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Crown", baseItemType: "armor", uniqueName: "Undead Crown", properties: ["When you deal damage with a weapon attack, you can restore 1 hit point for every 10 damage dealt. This amount is not additive between attacks.", "You can cast the Animate Dead spell as an action. Undead raised this way last for a maximum of 1 minute, then the corpse cannot be raised again. You may control a number of raised creatures equal to your Intelligence or Wisdom modifier (minimum 1) plus your Proficiency Bonus.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Splint Mail", baseItemType: "armor", uniqueName: "Arkaine's Valor", properties: ["You gain a +2 to your AC.", "You gain a +1 to your constitution ability score.", "You gain 12 Armor Points.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Tower Shield", baseItemType: "armor", uniqueName: "Stormshield", properties: ["You gain an additional +2 bonus to your AC.", "You gain 15 Armor Points", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Club", baseItemType: "weapon", uniqueName: "Civerb's Cudgel", properties: ["This weapon deals an additional 1d4 bludgeoning damage against demon targets.", "Any hit against demons with this weapon counts as a critical hit.", "Cursed: After attacking with this weapon for one minute, you have disadvantage on all Strength and Dexterity saving throws. Additionally, any non-demon has advantage on attack rolls against you.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Battleaxe", baseItemType: "weapon", uniqueName: "The Butcher's Cleaver", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "This weapon deals an additional 2d6 slashing damage against living targets.", "Has 6 charges, and starts missing 1d4+1 charges. Whenever you roll a natural 1 on an attack roll, lose 1 charge. When it has no more charges, the axe breaks.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Greataxe", baseItemType: "weapon", uniqueName: "Stone Cleaver", properties: ["You gain a +1 to attack rolls and a +3 to damage rolls with this weapon.", "You gain 20 maximum hit points.", "When you are subjected to an effect that deals lightning damage and allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Scimitar", baseItemType: "weapon", uniqueName: "Falcon's Talon", properties: ["You gain a +2 to attack and damage rolls with this weapon.", "When you use this weapon and take the attack action, you can make 1 additional melee weapon attack.", "This delicate weapon is fragile, and using your strength modifier to attack with it can break it. When attacking using strength, on a roll of a natural 1, roll a d20 with a DC of 10. On a failure, the weapon breaks. On a success, the DC permanently increases by 1.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "War Staff (Quarterstaff)", baseItemType: "weapon", uniqueName: "Mindcry", properties: ["You gain a +2 to all saving throws.", "You gain 10 spell points that return on a long rest.", "When you cast a spell that deals damage, you can increase the amount of damage dice you roll by 1.", "Once per encounter as a bonus action, you can cast the Guardian of Faith spell for free, which has a duration of 1 minute.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Executioner (Greataxe)", baseItemType: "weapon", uniqueName: "Mangler", properties: ["This weapon deals an additional 3d8 slashing damage", "You can only prepare or know 1 spell.", "You suffer a -3 to your dexterity ability score.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Sledge (Maul)", baseItemType: "weapon", uniqueName: "Cranium Basher", properties: ["You gain a +10 to damage rolls with this weapon.", "When a creature you can see within your reach starts to cast a spell, you can make an opportunity attack against that creature.", "You can only prepare or know 1 spell.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Rune Staff (Quarterstaff)", baseItemType: "weapon", uniqueName: "Naj's Puzzler", properties: ["When you cast a spell that deals damage, you can increase the amount of damage dice you roll by 2.", "Once per turn, you can cast Misty Step as an action.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Rune Staff (Quarterstaff)", baseItemType: "weapon", uniqueName: "Staff of Lazarus", properties: ["You gain a +2 bonus to spell attack rolls and to the saving throw DCs of your spells.", "At the start of each of your turns, as a free action, you can choose to take 1d10+10 damage, and increase your primary spellcasting ability score by 4 until the start of your next turn. The damage from this feature cannot be reduced in any way.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Scorpion Flail (Flail)", baseItemType: "weapon", uniqueName: "Celestial Star", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "You gain a +2 to your AC.", "While wearing this item, light sources you carry shed 20 feet less bright and dim light.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Devil Star (Morningstar)", baseItemType: "weapon", uniqueName: "Inferno", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "This weapon deals 1d8 extra fire damage.", "When you cast a spell that deals fire damage, you can increase the amount of damage dice you roll by 2.", "You gain immunity to fire damage.", ], multiplier: 10, tier: 5, weight: 0},
{baseItem: "Mattock (War pick)", baseItemType: "weapon", uniqueName: "Ursus Major", properties: ["You gain a +3 to attack and damage rolls with this weapon.", "When you hit a creature with a melee attack, the creature is pushed 20 feet.", "Once per long rest, you can use a bonus action to cast the Enlarge/Reduce spell on yourself (enlarge only), with no concentration.", ], multiplier: 10, tier: 5, weight: 0},
];

const prowessTable = [
{prowessName: "Anchored", prowessFeature: "Forced movement from a push or pull is reduced by 5 feet", prowessGearType: "Armor"},
{prowessName: "Braced", prowessFeature: "You may use your move action to instead gain the effect of partial cover.", prowessGearType: "Armor"},
{prowessName: "Dashing", prowessFeature: "When you use the Dash action, your speed increases by 10 feet for that movement", prowessGearType: "Armor"},
{prowessName: "Fortified", prowessFeature: "When you take the dodge action, you gain temporary hit points equal to your Proficiency Bonus", prowessGearType: "Armor"},
{prowessName: "Reinforced", prowessFeature: "When you are hit with a melee attack, you can use your reaction to reduce the attack roll by 1d4", prowessGearType: "Armor"},
{prowessName: "Aim", prowessFeature: "You may use your move action to instead gain advantage on your next attack roll", prowessGearType: "Weapon"},
{prowessName: "Bleed", prowessFeature: "After a hit, the target takes an additional 1d4 damage at the end of their next turn", prowessGearType: "Weapon"},
{prowessName: "Brutal ", prowessFeature: "Treat any 1's rolled with this weapon as a 2 instead", prowessGearType: "Weapon"},
{prowessName: "Cleave", prowessFeature: "After a hit, you can deal glancing damage to an adjacent target within reach", prowessGearType: "Weapon"},
{prowessName: "Debilitate", prowessFeature: "After a hit, the target has -1 to all attack rolls until the start of your next turn", prowessGearType: "Weapon"},
{prowessName: "Hinder", prowessFeature: "After a hit, your target's speed is reduced by half or by 20 feet, whichever is higher", prowessGearType: "Weapon"},
{prowessName: "Skewer", prowessFeature: "After a hit, you can deal glancing damage to an additional creature behind the target", prowessGearType: "Weapon"},
{prowessName: "Stagger", prowessFeature: "After a hit, the target cannot take reactions until the start of your next turn", prowessGearType: "Weapon"},
{prowessName: "Sunder", prowessFeature: "After a hit, the target has a -1 to their AC until the start of your next turn", prowessGearType: "Weapon"},
{prowessName: "Wide Critical", prowessFeature: "Your critical hit range is increased by 1", prowessGearType: "Weapon"},
]
