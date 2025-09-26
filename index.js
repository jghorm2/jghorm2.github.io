

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
                value: potion.value || 0
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
            let isArmor, enchantRoll, isRare = false;
            if (guarantee && guarantee.includes('armor')) {
                isArmor = true;
            } else if (guarantee && guarantee.includes('weapon')) {
                isArmor = false;
            } else {
                isArmor = rollDie(20) <= 10;
            }
            const baseItem = isArmor ? 
                getWeightedRandomItem(armorTable, tier) : 
                getWeightedRandomItem(weaponTable, tier);
            let item = {
                name: baseItem.name,
                property: "",
                value: baseItem.value,
                multiplier: 1
            };
            if (!guarantee || !guarantee.includes('mundane')) {
                if (guarantee && guarantee.includes('rare')) {
                    isRare = true;
                } else if (rollPercentage() >= 95) {
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
                        }
                    }
                }
                
                item.property = properties.join('<br>');
            } else {
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
            else if (guarantee && guarantee.includes('gear') || guarantee && guarantee.includes('weapon') || guarantee && guarantee.includes('armor')) roll = 13;
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
                return [result, extraLoot].filter(item => item && item.type !== 'no-loot');
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
           
            results.forEach(item => {
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
                } else if (item.isRare) {
                    className += ' rare';
                } else if (item.isCursed) {
                    className += ' cursed';
                } else if (item.property && item.property.trim() !== '') {
                    className += ' enchanted';
                } else {
                    className += ' mundane';
                }
               
                html += `
                    <div class="${className}">
                        <button class="delete-btn" onclick="this.parentElement.remove(); updateTotalValue();">&times;</button>
                        <button class="copy-btn" onclick="copyLootItem(this);">⧉</button>
                        <h3>${item.name}</h3>
                        <div class="loot-properties">${item.property} </div>
                        <div class="loot-value">Value: ${item.value || 0} gp</div>
                    </div>
                `;
            });
           
            html += `<div class="total-value">
                Total Value: ${totalValue} gp
            </div>`;
           
            resultsDiv.innerHTML = html;
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
                row.innerHTML = `
                    <td>${item.spellLevel}</td>
                    <td>${item.name}</td>
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
                type: 'gear'
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
                    
                    if (type === 'normal') {
                        prefix = prefixTable[parseInt(index)];
                    } else if (type === 'cursed') {
                        prefix = cursedPrefixTable[parseInt(index)];
                        isCursed = true;
                    }
                    
                    if (prefix) {
                        item.name = `${prefix.name} ${item.name}`;
                        properties.push(`• ${prefix.property}`);
                        item.multiplier += prefix.multiplier;
                    }
                }
                
                if (suffixValue) {
                    const [type, index] = suffixValue.split('_');
                    let suffix;
                    
                    if (type === 'normal') {
                        suffix = suffixTable[parseInt(index)];
                    } else if (type === 'cursed') {
                        suffix = cursedSuffixTable[parseInt(index)];
                        isCursed = true;
                    }
                    
                    if (suffix) {
                        item.name = `${item.name} ${suffix.name}`;
                        properties.push(`• ${suffix.property}`);
                        item.multiplier += suffix.multiplier;
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
                });
                
                item.property = properties.join('<br>');
                if (isCursed) className = className.replace('preview-rare', 'preview-cursed');
                
            } else {
                className += ' preview-mundane';
            }
            
            // Set cursed flag for proper styling in results
            if (isCursed) item.isCursed = true;
            if (quality === 'rare') item.isRare = true;
            
            // Calculate final value
            item.value = Math.max(1, Math.floor(item.value * Math.max(0.1, item.multiplier)));
            
            // Display the preview
            updateItemPreview(item, className);
            
            // Return the item for adding to results
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
            {name: "Acid Splash", value:10, spellLevel: 0},
            {name: "Blade Ward", value:10, spellLevel: 0},
            {name: "Booming Blade", value:10, spellLevel: 0},
            {name: "Chill Touch", value:10, spellLevel: 0},
            {name: "Eldritch Blast", value:10, spellLevel: 0},
            {name: "Fire Bolt", value:10, spellLevel: 0},
            {name: "Frostbite", value:10, spellLevel: 0},
            {name: "Green-Flame Blade", value:10, spellLevel: 0},
            {name: "Guidance", value:10, spellLevel: 0},
            {name: "Gust", value:10, spellLevel: 0},
            {name: "Infestation", value:10, spellLevel: 0},
            {name: "Lightning Lure", value:10, spellLevel: 0},
            {name: "Mage Hand", value:10, spellLevel: 0},
            {name: "Magic Stone", value:10, spellLevel: 0},
            {name: "Mind Sliver", value:10, spellLevel: 0},
            {name: "Poison Spray", value:10, spellLevel: 0},
            {name: "Primal Savagery", value:10, spellLevel: 0},
            {name: "Produce Flame", value:10, spellLevel: 0},
            {name: "Ray of Frost", value:10, spellLevel: 0},
            {name: "Sacred Flame", value:10, spellLevel: 0},
            {name: "Shillelagh", value:10, spellLevel: 0},
            {name: "Shocking Grasp", value:10, spellLevel: 0},
            {name: "Spare the Dying", value:10, spellLevel: 0},
            {name: "Sword Burst", value:10, spellLevel: 0},
            {name: "Thorn Whip", value:10, spellLevel: 0},
            {name: "Thunderclap", value:10, spellLevel: 0},
            {name: "Toll the Dead", value:10, spellLevel: 0},
            {name: "True Strike", value:10, spellLevel: 0},
            {name: "Vicious Mockery", value:10, spellLevel: 0},
            {name: "Word of Radiance", value:10, spellLevel: 0},
            {name: "Armor of Agathys", value:60, spellLevel: 1},
            {name: "Arms of Hadar", value:60, spellLevel: 1},
            {name: "Bane", value:60, spellLevel: 1},
            {name: "Bless", value:60, spellLevel: 1},
            {name: "Burning Hands", value:60, spellLevel: 1},
            {name: "Catapult", value:60, spellLevel: 1},
            {name: "Chaos Bolt", value:60, spellLevel: 1},
            {name: "Chromatic Orb", value:60, spellLevel: 1},
            {name: "Compelled Duel", value:60, spellLevel: 1},
            {name: "Cure Wounds", value:60, spellLevel: 1},
            {name: "Detect Magic", value:60, spellLevel: 1},
            {name: "Detect Poison and Disease", value:60, spellLevel: 1},
            {name: "Dissonant Whispers", value:60, spellLevel: 1},
            {name: "Divine Favor", value:60, spellLevel: 1},
            {name: "Earth Tremor", value:60, spellLevel: 1},
            {name: "Ensnaring Strike", value:60, spellLevel: 1},
            {name: "Entangle", value:60, spellLevel: 1},
            {name: "Expeditious Retreat", value:60, spellLevel: 1},
            {name: "Faerie Fire", value:60, spellLevel: 1},
            {name: "False Life", value:60, spellLevel: 1},
            {name: "Find Familiar", value:60, spellLevel: 1},
            {name: "Fog Cloud", value:60, spellLevel: 1},
            {name: "Frost Fingers", value:60, spellLevel: 1},
            {name: "Gift of Alacrity", value:60, spellLevel: 1},
            {name: "Goodberry", value:60, spellLevel: 1},
            {name: "Grease", value:60, spellLevel: 1},
            {name: "Guiding Bolt", value:60, spellLevel: 1},
            {name: "Hail of Thorns", value:60, spellLevel: 1},
            {name: "Healing Word", value:60, spellLevel: 1},
            {name: "Hellish Rebuke", value:60, spellLevel: 1},
            {name: "Heroism", value:60, spellLevel: 1},
            {name: "Hex", value:60, spellLevel: 1},
            {name: "Hunter's Mark", value:60, spellLevel: 1},
            {name: "Ice Knife", value:60, spellLevel: 1},
            {name: "Inflict Wounds", value:60, spellLevel: 1},
            {name: "Mage Armor", value:60, spellLevel: 1},
            {name: "Magic Missile", value:60, spellLevel: 1},
            {name: "Protection from Evil and Good", value:60, spellLevel: 1},
            {name: "Ray of Sickness", value:60, spellLevel: 1},
            {name: "Sanctuary", value:60, spellLevel: 1},
            {name: "Searing Smite", value:60, spellLevel: 1},
            {name: "Shield", value:60, spellLevel: 1},
            {name: "Shield of Faith", value:60, spellLevel: 1},
            {name: "Sleep", value:60, spellLevel: 1},
            {name: "Tasha's Caustic Brew", value:60, spellLevel: 1},
            {name: "Tasha's Hideous Laughter", value:60, spellLevel: 1},
            {name: "Thunderous Smite", value:60, spellLevel: 1},
            {name: "Thunderwave", value:60, spellLevel: 1},
            {name: "Wrathful Smite", value:60, spellLevel: 1},
            {name: "Zephyr Strike", value:60, spellLevel: 1},
            {name: "Aganazzar's Scorcher", value:120, spellLevel: 2},
            {name: "Aid", value:120, spellLevel: 2},
            {name: "Barkskin", value:120, spellLevel: 2},
            {name: "Blindness/Deafness", value:120, spellLevel: 2},
            {name: "Blur", value:120, spellLevel: 2},
            {name: "Branding Smite", value:120, spellLevel: 2},
            {name: "Calm Emotions", value:120, spellLevel: 2},
            {name: "Cloud of Daggers", value:120, spellLevel: 2},
            {name: "Cordon of Arrows", value:120, spellLevel: 2},
            {name: "Crown of Madness", value:120, spellLevel: 2},
            {name: "Darkness", value:120, spellLevel: 2},
            {name: "Darkvision", value:120, spellLevel: 2},
            {name: "Dragon's Breath", value:120, spellLevel: 2},
            {name: "Enlarge/Reduce", value:120, spellLevel: 2},
            {name: "Flame Blade", value:120, spellLevel: 2},
            {name: "Flaming Sphere", value:120, spellLevel: 2},
            {name: "Healing Spirit", value:120, spellLevel: 2},
            {name: "Heat Metal", value:120, spellLevel: 2},
            {name: "Hold Person", value:120, spellLevel: 2},
            {name: "Invisibility", value:120, spellLevel: 2},
            {name: "Kinetic Jaunt", value:120, spellLevel: 2},
            {name: "Lesser Restoration", value:120, spellLevel: 2},
            {name: "Magic Weapon", value:120, spellLevel: 2},
            {name: "Melf's Acid Arrow", value:120, spellLevel: 2},
            {name: "Mind Spike", value:120, spellLevel: 2},
            {name: "Mirror Image", value:120, spellLevel: 2},
            {name: "Misty Step", value:120, spellLevel: 2},
            {name: "Phantasmal Force", value:120, spellLevel: 2},
            {name: "Prayer of Healing", value:120, spellLevel: 2},
            {name: "Pyrotechnics", value:120, spellLevel: 2},
            {name: "Ray of Enfeeblement", value:120, spellLevel: 2},
            {name: "Scorching Ray", value:120, spellLevel: 2},
            {name: "Shadow Blade", value:120, spellLevel: 2},
            {name: "Shatter", value:120, spellLevel: 2},
            {name: "Silence", value:120, spellLevel: 2},
            {name: "Spike Growth", value:120, spellLevel: 2},
            {name: "Spiritual Weapon", value:120, spellLevel: 2},
            {name: "Tasha's Mind Whip", value:120, spellLevel: 2},
            {name: "Web", value:120, spellLevel: 2},
            {name: "Wither and Bloom", value:120, spellLevel: 2},
            {name: "Animate Dead", value:200, spellLevel: 3},
            {name: "Aura of Vitality", value:200, spellLevel: 3},
            {name: "Beacon of Hope", value:200, spellLevel: 3},
            {name: "Blinding Smite", value:200, spellLevel: 3},
            {name: "Blink", value:200, spellLevel: 3},
            {name: "Conjure Barrage", value:200, spellLevel: 3},
            {name: "Counterspell", value:200, spellLevel: 3},
            {name: "Crusader's Mantle", value:200, spellLevel: 3},
            {name: "Daylight", value:200, spellLevel: 3},
            {name: "Dispel Magic", value:200, spellLevel: 3},
            {name: "Elemental Weapon", value:200, spellLevel: 3},
            {name: "Erupting Earth", value:200, spellLevel: 3},
            {name: "Fear", value:200, spellLevel: 3},
            {name: "Fireball", value:200, spellLevel: 3},
            {name: "Flame Arrows", value:200, spellLevel: 3},
            {name: "Fly", value:200, spellLevel: 3},
            {name: "Glyph of Warding", value:200, spellLevel: 3},
            {name: "Haste", value:200, spellLevel: 3},
            {name: "Hunger Of Hadar", value:200, spellLevel: 3},
            {name: "Hypnotic Pattern", value:200, spellLevel: 3},
            {name: "Intellect Fortress", value:200, spellLevel: 3},
            {name: "Life Transference", value:200, spellLevel: 3},
            {name: "Lightning Arrow", value:200, spellLevel: 3},
            {name: "Lightning Bolt", value:200, spellLevel: 3},
            {name: "Major Image", value:200, spellLevel: 3},
            {name: "Mass Healing Word", value:200, spellLevel: 3},
            {name: "Meld into Stone", value:200, spellLevel: 3},
            {name: "Melf's Minute Meteors", value:200, spellLevel: 3},
            {name: "Pulse Wave", value:200, spellLevel: 3},
            {name: "Remove Curse", value:200, spellLevel: 3},
            {name: "Revivify", value:200, spellLevel: 3},
            {name: "Slow", value:200, spellLevel: 3},
            {name: "Spirit Guardians", value:200, spellLevel: 3},
            {name: "Summon Lesser Demons", value:200, spellLevel: 3},
            {name: "Summon Shadowspawn", value:200, spellLevel: 3},
            {name: "Summon Undead", value:200, spellLevel: 3},
            {name: "Thunder Step", value:200, spellLevel: 3},
            {name: "Vampiric Touch", value:200, spellLevel: 3},
            {name: "Wall of Water", value:200, spellLevel: 3},
            {name: "Wind Wall", value:200, spellLevel: 3},
            {name: "Aura of Life", value:320, spellLevel: 4},
            {name: "Aura of Purity", value:320, spellLevel: 4},
            {name: "Banishment", value:320, spellLevel: 4},
            {name: "Blight", value:320, spellLevel: 4},
            {name: "Confusion", value:320, spellLevel: 4},
            {name: "Conjure Minor Elementals", value:320, spellLevel: 4},
            {name: "Death Ward", value:320, spellLevel: 4},
            {name: "Dimension Door", value:320, spellLevel: 4},
            {name: "Dominate Beast", value:320, spellLevel: 4},
            {name: "Evard's Black Tentacles", value:320, spellLevel: 4},
            {name: "Fire Shield", value:320, spellLevel: 4},
            {name: "Grasping Vine", value:320, spellLevel: 4},
            {name: "Gravity Sinkhole", value:320, spellLevel: 4},
            {name: "Greater Invisibility", value:320, spellLevel: 4},
            {name: "Guardian of Faith", value:320, spellLevel: 4},
            {name: "Guardian of Nature", value:320, spellLevel: 4},
            {name: "Otiluke's Resilient Sphere", value:320, spellLevel: 4},
            {name: "Phantasmal Killer", value:320, spellLevel: 4},
            {name: "Polymorph", value:320, spellLevel: 4},
            {name: "Raulothim's Psychic Lance", value:320, spellLevel: 4},
            {name: "Shadow Of Moil", value:320, spellLevel: 4},
            {name: "Staggering Smite", value:320, spellLevel: 4},
            {name: "Stone Shape", value:320, spellLevel: 4},
            {name: "Stoneskin", value:320, spellLevel: 4},
            {name: "Storm Sphere", value:320, spellLevel: 4},
            {name: "Summon Aberration", value:320, spellLevel: 4},
            {name: "Summon Construct", value:320, spellLevel: 4},
            {name: "Summon Elemental", value:320, spellLevel: 4},
            {name: "Summon Greater Demon", value:320, spellLevel: 4},
            {name: "Wall of Fire", value:320, spellLevel: 4},
            {name: "Animate Objects", value:640, spellLevel: 5},
            {name: "Banishing Smite", value:640, spellLevel: 5},
            {name: "Bigby's Hand", value:640, spellLevel: 5},
            {name: "Circle of Power", value:640, spellLevel: 5},
            {name: "Cloudkill", value:640, spellLevel: 5},
            {name: "Cone of Cold", value:640, spellLevel: 5},
            {name: "Conjure Elemental", value:640, spellLevel: 5},
            {name: "Conjure Volley", value:640, spellLevel: 5},
            {name: "Contagion", value:640, spellLevel: 5},
            {name: "Danse Macabre", value:640, spellLevel: 5},
            {name: "Dawn", value:640, spellLevel: 5},
            {name: "Destructive Wave", value:640, spellLevel: 5},
            {name: "Dispel Evil and Good", value:640, spellLevel: 5},
            {name: "Far Step", value:640, spellLevel: 5},
            {name: "Flame Strike", value:640, spellLevel: 5},
            {name: "Hold Monster", value:640, spellLevel: 5},
            {name: "Holy Weapon", value:640, spellLevel: 5},
            {name: "Immolation", value:640, spellLevel: 5},
            {name: "Insect Plague", value:640, spellLevel: 5},
            {name: "Negative Energy Flood", value:640, spellLevel: 5},
            {name: "Passwall", value:640, spellLevel: 5},
            {name: "Steel Wind Strike", value:640, spellLevel: 5},
            {name: "Summon Celestial", value:640, spellLevel: 5},
            {name: "Swift Quiver", value:640, spellLevel: 5},
            {name: "Synaptic Static", value:640, spellLevel: 5},
            {name: "Telekinesis", value:640, spellLevel: 5},
            {name: "Temporal Shunt", value:640, spellLevel: 5},
            {name: "Wall of Force", value:640, spellLevel: 5},
            {name: "Wall of Light", value:640, spellLevel: 5},
            {name: "Wall of Stone", value:640, spellLevel: 5},
            {name: "Blade Barrier", value:1280, spellLevel: 6},
            {name: "Bones of the Earth", value:1280, spellLevel: 6},
            {name: "Chain Lightning", value:1280, spellLevel: 6},
            {name: "Circle of Death", value:1280, spellLevel: 6},
            {name: "Disintegrate", value:1280, spellLevel: 6},
            {name: "Gravity Fissure", value:1280, spellLevel: 6},
            {name: "Harm", value:1280, spellLevel: 6},
            {name: "Heal", value:1280, spellLevel: 6},
            {name: "Investiture of Flame", value:1280, spellLevel: 6},
            {name: "Investiture of Ice", value:1280, spellLevel: 6},
            {name: "Investiture of Stone", value:1280, spellLevel: 6},
            {name: "Mental Prison", value:1280, spellLevel: 6},
            {name: "Scatter", value:1280, spellLevel: 6},
            {name: "Soul Cage", value:1280, spellLevel: 6},
            {name: "Summon Fiend", value:1280, spellLevel: 6},
            {name: "Sunbeam", value:1280, spellLevel: 6},
            {name: "Tasha's Otherworldly Guise", value:1280, spellLevel: 6},
            {name: "True Seeing", value:1280, spellLevel: 6},
            {name: "Wall of Ice", value:1280, spellLevel: 6},
            {name: "Wall of Thorns", value:1280, spellLevel: 6},
            {name: "Crown of Stars", value:2560, spellLevel: 7},
            {name: "Finger of Death", value:2560, spellLevel: 7},
            {name: "Fire Storm", value:2560, spellLevel: 7},
            {name: "Forcecage", value:2560, spellLevel: 7},
            {name: "Mordenkainen's Sword", value:2560, spellLevel: 7},
            {name: "Power Word: Pain", value:2560, spellLevel: 7},
            {name: "Prismatic Spray", value:2560, spellLevel: 7},
            {name: "Regenerate", value:2560, spellLevel: 7},
            {name: "Reverse Gravity", value:2560, spellLevel: 7},
            {name: "Whirlwind", value:2560, spellLevel: 7},
            {name: "Abi-Dalzim's Horrid Wilting", value:5120, spellLevel: 8},
            {name: "Animal Shapes", value:5120, spellLevel: 8},
            {name: "Antipathy/Sympathy", value:5120, spellLevel: 8},
            {name: "Dark Star", value:5120, spellLevel: 8},
            {name: "Dominate Monster", value:5120, spellLevel: 8},
            {name: "Earthquake", value:5120, spellLevel: 8},
            {name: "Holy Aura", value:5120, spellLevel: 8},
            {name: "Mind Blank", value:5120, spellLevel: 8},
            {name: "Power Word: Stun", value:5120, spellLevel: 8},
            {name: "Sunburst", value:5120, spellLevel: 8},
            {name: "Blade of Disaster", value:10000, spellLevel: 9},
            {name: "Foresight", value:10000, spellLevel: 9},
            {name: "Invulnerability", value:10000, spellLevel: 9},
            {name: "Mass Heal", value:10000, spellLevel: 9},
            {name: "Meteor Swarm", value:10000, spellLevel: 9},
            {name: "Prismatic Wall", value:10000, spellLevel: 9},
            {name: "Psychic Scream", value:10000, spellLevel: 9},
            {name: "Ravenous Void", value:10000, spellLevel: 9},
            {name: "Time Stop", value:10000, spellLevel: 9},
            {name: "Wish", value:10000, spellLevel: 9},
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
            {tier:1, weight:4, name:"Dart", quality:"Normal", class:"Dart", damage:"1d4 Piercing", proficiency:"Simple Ranged", strReq:"9", dexReq:"15", weaponProperties:"Loading, Two-handed, Range (80/320)", prowessBonus:"Aim", value:4}, 
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
            {tier:2, weight:8, name:"Blowgun", quality:"Normal", class:"Blowgun", damage:"1d6 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"13", weaponProperties:"Loading, Two-handed, Range (25/100)", prowessBonus:"Aim", value:50}, 
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
            {tier:2, weight:7, name:"Shuriken", quality:"Exceptional", class:"Dart", damage:"1d6 Piercing", proficiency:"Simple Ranged", strReq:"10", dexReq:"16", weaponProperties:"Loading, Two-handed, Range (80/320)", prowessBonus:"Aim", value:15}, 
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
            {tier:3, weight:11, name:"Sarbacan", quality:"Exceptional", class:"Blowgun", damage:"1d8 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"14", weaponProperties:"Loading, Two-handed, Range (25/100)", prowessBonus:"Aim", value:185}, 
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
            {tier:3, weight:10, name:"Kunai", quality:"Elite", class:"Dart", damage:"1d8 Piercing", proficiency:"Simple Ranged", strReq:"12", dexReq:"18", weaponProperties:"Loading, Two-handed, Range (80/320)", prowessBonus:"Aim", value:68}, 
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
            {tier:4, weight:16, name:"Sumpitan", quality:"Elite", class:"Blowgun", damage:"1d10 Piercing", proficiency:"Martial Ranged", strReq:"-", dexReq:"16", weaponProperties:"Loading, Two-handed, Range (25/100)", prowessBonus:"Aim", value:833}, 
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

