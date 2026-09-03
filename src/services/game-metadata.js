/**
 * SteamSquad — Game Metadata Service
 * Curated knowledge base of multiplayer capacities, game modes, and download size tiers.
 */

export const GAME_MODES = {
  COOP: 'coop',
  PVP: 'pvp',
  PARTY: 'party',
  SURVIVAL: 'survival',
  SOLO: 'solo'
};

export const SIZE_TIERS = {
  SMALL: 'small',   // < 5 GB ("Hemen İndir Başla")
  MEDIUM: 'medium', // 5 - 20 GB
  LARGE: 'large'    // > 20 GB
};

/**
 * Curated metadata dictionary for popular games keyed by Steam AppID
 */
export const KNOWN_GAMES = {
  // Co-Op / PvE Staples
  1966720: { name: 'Lethal Company', maxPlayers: 4, mode: 'coop', size: 'small', tags: ['Co-Op', 'Horror', 'Funny'] },
  553850:  { name: 'HELLDIVERS™ 2', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['Co-Op', 'Action', 'Shooter'] },
  739630:  { name: 'Phasmophobia', maxPlayers: 4, mode: 'coop', size: 'medium', tags: ['Co-Op', 'Horror', 'VR'] },
  892970:  { name: 'Valheim', maxPlayers: 10, mode: 'survival', size: 'small', tags: ['Survival', 'Co-Op', 'Open World'] },
  550:     { name: 'Left 4 Dead 2', maxPlayers: 8, mode: 'coop', size: 'medium', tags: ['Co-Op', 'Zombies', 'Shooter'] },
  105600:  { name: 'Terraria', maxPlayers: 8, mode: 'survival', size: 'small', tags: ['Survival', 'Co-Op', 'Sandbox'] },
  548430:  { name: 'Deep Rock Galactic', maxPlayers: 4, mode: 'coop', size: 'small', tags: ['Co-Op', 'Dwarf', 'Mining'] },
  440:     { name: 'Team Fortress 2', maxPlayers: 32, mode: 'pvp', size: 'medium', tags: ['PvP', 'Shooter', 'Free to Play'] },
  252490:  { name: 'Rust', maxPlayers: 100, mode: 'survival', size: 'large', tags: ['Survival', 'PvP', 'Open World'] },
  381210:  { name: 'Dead by Daylight', maxPlayers: 5, mode: 'pvp', size: 'large', tags: ['Asymmetric', 'PvP', 'Horror'] },
  286160:  { name: 'Tabletop Simulator', maxPlayers: 10, mode: 'party', size: 'small', tags: ['Board Game', 'Party', 'Moddable'] },
  881100:  { name: 'Noita', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Roguelike', 'Pixel'] },
  1086940: { name: 'Baldur\'s Gate 3', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['RPG', 'Story Rich', 'Turn-Based'] },
  1623730: { name: 'Palworld', maxPlayers: 32, mode: 'survival', size: 'medium', tags: ['Survival', 'Creature Collector', 'Co-Op'] },
  322330:  { name: 'Don\'t Starve Together', maxPlayers: 6, mode: 'survival', size: 'small', tags: ['Survival', 'Co-Op', 'Crafting'] },
  431960:  { name: 'Wallpaper Engine', maxPlayers: 1, mode: 'utility', size: 'small', tags: ['Utility'] },
  
  // Party & Casual Games
  880940:  { name: 'Pummel Party', maxPlayers: 8, mode: 'party', size: 'small', tags: ['Party', 'Minigames', 'Funny'] },
  945360:  { name: 'Among Us', maxPlayers: 15, mode: 'party', size: 'small', tags: ['Social Deduction', 'Party', 'Casual'] },
  431240:  { name: 'Golf With Your Friends', maxPlayers: 12, mode: 'party', size: 'small', tags: ['Mini Golf', 'Party', 'Casual'] },
  570:     { name: 'Dota 2', maxPlayers: 10, mode: 'pvp', size: 'large', tags: ['MOBA', 'Strategy', 'Competitive'] },
  730:     { name: 'Counter-Strike 2', maxPlayers: 10, mode: 'pvp', size: 'large', tags: ['PvP', 'Competitive', 'Shooter'] },
  251570:  { name: '7 Days to Die', maxPlayers: 8, mode: 'survival', size: 'medium', tags: ['Survival', 'Zombies', 'Crafting'] },
  291550:  { name: 'Brawlhalla', maxPlayers: 8, mode: 'pvp', size: 'small', tags: ['Fighter', 'PvP', 'Free to Play'] },
  477160:  { name: 'Human Fall Flat', maxPlayers: 8, mode: 'party', size: 'small', tags: ['Physics', 'Funny', 'Co-Op'] },
  346110:  { name: 'ARK: Survival Evolved', maxPlayers: 64, mode: 'survival', size: 'large', tags: ['Survival', 'Dinosaurs', 'Open World'] },
  648800:  { name: 'Raft', maxPlayers: 8, mode: 'survival', size: 'small', tags: ['Survival', 'Co-Op', 'Crafting'] },
  242760:  { name: 'The Forest', maxPlayers: 8, mode: 'survival', size: 'small', tags: ['Survival', 'Horror', 'Co-Op'] },
  1326470: { name: 'Sons Of The Forest', maxPlayers: 8, mode: 'survival', size: 'medium', tags: ['Survival', 'Horror', 'Co-Op'] },
  2881650: { name: 'Content Warning', maxPlayers: 4, mode: 'coop', size: 'small', tags: ['Co-Op', 'Funny', 'Horror'] },
  281990:  { name: 'Stellaris', maxPlayers: 32, mode: 'pvp', size: 'medium', tags: ['Strategy', 'Sci-Fi', 'Space'] },
  394360:  { name: 'Hearts of Iron IV', maxPlayers: 32, mode: 'pvp', size: 'small', tags: ['Grand Strategy', 'History', 'Military'] },
  285900:  { name: 'Gang Beasts', maxPlayers: 8, mode: 'party', size: 'small', tags: ['Party', 'Funny', 'Physics'] },
  674940:  { name: 'Stick Fight: The Game', maxPlayers: 4, mode: 'party', size: 'small', tags: ['Party', 'Fighting', 'Physics'] },
  602960:  { name: 'Barotrauma', maxPlayers: 16, mode: 'coop', size: 'small', tags: ['Co-Op', 'Submarine', 'Survival'] },
  108600:  { name: 'Project Zomboid', maxPlayers: 32, mode: 'survival', size: 'small', tags: ['Survival', 'Zombies', 'Sandbox'] },
  1260320: { name: 'Party Animals', maxPlayers: 8, mode: 'party', size: 'medium', tags: ['Party', 'Funny', 'Physics'] },
  312530:  { name: 'Duck Game', maxPlayers: 4, mode: 'party', size: 'small', tags: ['Party', '2D', 'Action'] },
  632360:  { name: 'Risk of Rain 2', maxPlayers: 4, mode: 'coop', size: 'small', tags: ['Co-Op', 'Roguelike', 'Third Person'] },
  230410:  { name: 'Warframe', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['Co-Op', 'Free to Play', 'Action'] },
  1172470: { name: 'Apex Legends', maxPlayers: 3, mode: 'pvp', size: 'large', tags: ['Battle Royale', 'Shooter', 'FPS'] },
  271590:  { name: 'Grand Theft Auto V', maxPlayers: 30, mode: 'pvp', size: 'large', tags: ['Open World', 'Action', 'Multiplayer'] },
  582010:  { name: 'Monster Hunter: World', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['Action', 'Co-Op', 'Hunting'] },
  1203620: { name: 'Enshrouded', maxPlayers: 16, mode: 'survival', size: 'medium', tags: ['Survival', 'Action RPG', 'Co-Op'] },
  218620:  { name: 'PAYDAY 2', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['Co-Op', 'Heist', 'Action'] },
  552500:  { name: 'Warhammer: Vermintide 2', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['Co-Op', 'Action', 'First-Person'] },
  1361210: { name: 'Warhammer 40,000: Darktide', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['Co-Op', 'Action', 'Shooter'] },
  435150:  { name: 'Divinity: Original Sin 2', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['RPG', 'Turn-Based', 'Co-Op'] },
  341800:  { name: 'Keep Talking and Nobody Explodes', maxPlayers: 4, mode: 'party', size: 'small', tags: ['Puzzle', 'Co-Op', 'Party'] },
  571740:  { name: 'Golf It!', maxPlayers: 8, mode: 'party', size: 'medium', tags: ['Golf', 'Party', 'Casual'] },
  1599600: { name: 'PlateUp!', maxPlayers: 4, mode: 'party', size: 'small', tags: ['Co-Op', 'Management', 'Cooking'] },
  207140:  { name: 'SpeedRunners', maxPlayers: 4, mode: 'party', size: 'small', tags: ['Party', 'Platformer', 'Competitive'] },
  440520:  { name: 'Overcooked! 2', maxPlayers: 4, mode: 'party', size: 'small', tags: ['Co-Op', 'Cooking', 'Party'] },
  361420:  { name: 'ASTRONEER', maxPlayers: 4, mode: 'coop', size: 'small', tags: ['Space', 'Survival', 'Open World'] },
  1282100: { name: 'Remnant II', maxPlayers: 3, mode: 'coop', size: 'large', tags: ['Co-Op', 'Souls-like', 'Shooter'] },
  962130:  { name: 'Grounded', maxPlayers: 4, mode: 'survival', size: 'medium', tags: ['Survival', 'Co-Op', 'Crafting'] },
  578080:  { name: 'PUBG: BATTLEGROUNDS', maxPlayers: 4, mode: 'pvp', size: 'large', tags: ['Battle Royale', 'Shooter', 'FPS'] },
  359550:  { name: 'Tom Clancy\'s Rainbow Six Siege', maxPlayers: 5, mode: 'pvp', size: 'large', tags: ['Tactical', 'Shooter', 'PvP'] },
  252950:  { name: 'Rocket League', maxPlayers: 8, mode: 'pvp', size: 'medium', tags: ['Sports', 'PvP', 'Football'] },
  1426210: { name: 'It Takes Two', maxPlayers: 2, mode: 'coop', size: 'large', tags: ['Co-Op', 'Puzzle', 'Adventure'] },
  1604030: { name: 'V Rising', maxPlayers: 40, mode: 'survival', size: 'medium', tags: ['Vampire', 'Survival', 'Action RPG'] },
  1172620: { name: 'Sea of Thieves 2024 Edition', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['Pirates', 'Adventure', 'Co-Op'] },
  594650:  { name: 'Hunt: Showdown 1896', maxPlayers: 3, mode: 'pvp', size: 'large', tags: ['PvP', 'Shooter', 'Horror'] },
  1144200: { name: 'Ready or Not', maxPlayers: 5, mode: 'coop', size: 'large', tags: ['Tactical', 'FPS', 'Co-Op'] },
  526870:  { name: 'Satisfactory', maxPlayers: 8, mode: 'coop', size: 'medium', tags: ['Base Building', 'Automation', 'Co-Op'] },
  427520:  { name: 'Factorio', maxPlayers: 100, mode: 'coop', size: 'small', tags: ['Base Building', 'Automation', 'Co-Op'] },
  1245620: { name: 'ELDEN RING', maxPlayers: 3, mode: 'coop', size: 'large', tags: ['Souls-like', 'Action RPG', 'Dark Fantasy'] },
  413150:  { name: 'Stardew Valley', maxPlayers: 8, mode: 'coop', size: 'small', tags: ['Farming Sim', 'Co-Op', 'Relaxing'] },
  306130:  { name: 'The Elder Scrolls Online', maxPlayers: 24, mode: 'coop', size: 'large', tags: ['MMORPG', 'RPG', 'Open World'] },
  107410:  { name: 'Arma 3', maxPlayers: 64, mode: 'coop', size: 'large', tags: ['Military Sim', 'Tactical', 'FPS'] },
  4000:    { name: 'Garry\'s Mod', maxPlayers: 64, mode: 'party', size: 'small', tags: ['Sandbox', 'Multiplayer', 'Funny'] },
  221100:  { name: 'DayZ', maxPlayers: 60, mode: 'survival', size: 'medium', tags: ['Survival', 'Zombies', 'Open World'] },
  1085660: { name: 'Destiny 2', maxPlayers: 6, mode: 'coop', size: 'large', tags: ['Looter Shooter', 'FPS', 'Free to Play'] },
  1281930: { name: 'tModLoader', maxPlayers: 8, mode: 'coop', size: 'small', tags: ['Modding', 'Sandbox'] },
  242920:  { name: 'Squad', maxPlayers: 50, mode: 'pvp', size: 'large', tags: ['Tactical', 'FPS', 'Military'] },
  686810:  { name: 'Hell Let Loose', maxPlayers: 50, mode: 'pvp', size: 'large', tags: ['WWII', 'Tactical', 'FPS'] },
  275850:  { name: 'No Man\'s Sky', maxPlayers: 8, mode: 'coop', size: 'medium', tags: ['Space', 'Open World', 'Survival'] },
  227300:  { name: 'Euro Truck Simulator 2', maxPlayers: 8, mode: 'coop', size: 'medium', tags: ['Simulation', 'Driving', 'Co-Op'] },
  1063730: { name: 'New World', maxPlayers: 50, mode: 'coop', size: 'large', tags: ['MMORPG', 'Open World'] },
  1240440: { name: 'Halo Infinite', maxPlayers: 24, mode: 'pvp', size: 'large', tags: ['FPS', 'Shooter', 'Multiplayer'] },
  238960:  { name: 'Path of Exile', maxPlayers: 6, mode: 'coop', size: 'large', tags: ['Action RPG', 'Free to Play'] },
  239140:  { name: 'Dying Light', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['Zombies', 'Parkour', 'Co-Op'] },
  534380:  { name: 'Dying Light 2 Stay Human', maxPlayers: 4, mode: 'coop', size: 'large', tags: ['Zombies', 'Parkour', 'Co-Op'] },
  620:     { name: 'Portal 2', maxPlayers: 2, mode: 'coop', size: 'small', tags: ['Puzzle', 'Co-Op', 'Comedy'] },

  // Curated Single Player / Story Classics
  960910:  { name: 'Heavy Rain', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Story Rich', 'Choices Matter', 'Thriller'] },
  1222140: { name: 'Detroit: Become Human', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Story Rich', 'Sci-Fi', 'Choices Matter'] },
  960990:  { name: 'Beyond: Two Souls', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Story Rich', 'Sci-Fi'] },
  1593500: { name: 'God of War', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Action', 'Story Rich', 'Mythology'] },
  292030:  { name: 'The Witcher 3: Wild Hunt', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['RPG', 'Open World'] },
  1091500: { name: 'Cyberpunk 2077', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Cyberpunk', 'RPG', 'Open World'] },
  1817070: { name: 'Marvel\'s Spider-Man Remastered', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Action', 'Open World'] },
  489830:  { name: 'The Elder Scrolls V: Skyrim Special Edition', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['RPG', 'Open World'] },
  72850:   { name: 'The Elder Scrolls V: Skyrim', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['RPG', 'Open World'] },
  377160:  { name: 'Fallout 4', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['RPG', 'Post-Apocalyptic'] },
  22370:   { name: 'Fallout: New Vegas', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['RPG', 'Open World'] },
  814380:  { name: 'Sekiro™: Shadows Die Twice', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['Souls-like', 'Action'] },
  1145360: { name: 'Hades', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Roguelike', 'Action'] },
  1145350: { name: 'Hades II', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Roguelike', 'Action'] },
  367520:  { name: 'Hollow Knight', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Metroidvania', 'Souls-like'] },
  504230:  { name: 'Celeste', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Platformer', 'Pixel Graphics'] },
  588650:  { name: 'Dead Cells', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Roguelike', 'Action'] },
  646570:  { name: 'Slay the Spire', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Deckbuilder', 'Roguelike'] },
  2379780: { name: 'Balatro', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Roguelike', 'Card Game', 'Casual'] },
  2050650: { name: 'Resident Evil 4', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Action', 'Horror'] },
  883710:  { name: 'Resident Evil 2', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Survival Horror', 'Zombies'] },
  208650:  { name: 'Batman™: Arkham Knight', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Action', 'Open World', 'Superhero'] },
  200260:  { name: 'Batman: Arkham City - GOTY', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['Action', 'Open World'] },
  35140:   { name: 'Batman: Arkham Asylum GOTY', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Action', 'Stealth'] },
  203160:  { name: 'Tomb Raider', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['Adventure', 'Action'] },
  391220:  { name: 'Rise of the Tomb Raider', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Adventure', 'Action'] },
  750920:  { name: 'Shadow of the Tomb Raider', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Adventure', 'Action'] },
  412020:  { name: 'Metro Exodus', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Post-Apocalyptic', 'FPS', 'Story Rich'] },
  286690:  { name: 'Metro 2033 Redux', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Post-Apocalyptic', 'FPS'] },
  287390:  { name: 'Metro: Last Light Redux', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Post-Apocalyptic', 'FPS'] },
  205100:  { name: 'Dishonored', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Stealth', 'First-Person'] },
  403640:  { name: 'Dishonored 2', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Stealth', 'First-Person'] },
  1328670: { name: 'Mass Effect™ Legendary Edition', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['RPG', 'Sci-Fi', 'Story Rich'] },
  524220:  { name: 'NieR:Automata™', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Action RPG', 'Story Rich'] },
  638970:  { name: 'Yakuza 0', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Story Rich', 'Action', 'Beat em up'] },
  264710:  { name: 'Subnautica', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['Open World Survival Craft', 'Underwater'] },
  848450:  { name: 'Subnautica: Below Zero', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['Open World Survival Craft', 'Underwater'] },
  1363080: { name: 'Manor Lords', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['City Builder', 'Medieval', 'Strategy'] },
  70:      { name: 'Half-Life', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['FPS', 'Classic'] },
  220:     { name: 'Half-Life 2', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['FPS', 'Story Rich'] },
  400:     { name: 'Portal', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Puzzle', 'First-Person'] },
  8870:    { name: 'BioShock Infinite', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['FPS', 'Story Rich'] },
  7670:    { name: 'BioShock Remastered', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['FPS', 'Atmospheric'] },
  1850570: { name: 'DEATH STRANDING DIRECTOR\'S CUT', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Open World', 'Story Rich'] },
  1190460: { name: 'DEATH STRANDING', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Open World', 'Story Rich'] },
  108710:  { name: 'Alan Wake', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Horror', 'Story Rich'] },
  870780:  { name: 'Control Ultimate Edition', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Action', 'Third Person', 'Sci-Fi'] },
  379720:  { name: 'DOOM', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['FPS', 'Action', 'Gore'] },
  782330:  { name: 'DOOM Eternal', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['FPS', 'Action', 'Fast-Paced'] },
  570940:  { name: 'DARK SOULS™: REMASTERED', maxPlayers: 1, mode: 'solo', size: 'small', tags: ['Souls-like', 'Dark Fantasy'] },
  335300:  { name: 'DARK SOULS™ II: Scholar of the First Sin', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['Souls-like', 'Dark Fantasy'] },
  374320:  { name: 'DARK SOULS™ III', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Souls-like', 'Dark Fantasy'] },
  1172380: { name: 'STAR WARS Jedi: Fallen Order™', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Action', 'Adventure', 'Sci-Fi'] },
  1774580: { name: 'STAR WARS Jedi: Survivor™', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Action', 'Adventure', 'Sci-Fi'] },
  2208920: { name: 'Assassin\'s Creed Valhalla', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Open World', 'RPG', 'Vikings'] },
  812140:  { name: 'Assassin\'s Creed Odyssey', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Open World', 'RPG', 'Historical'] },
  582160:  { name: 'Assassin\'s Creed Origins', maxPlayers: 1, mode: 'solo', size: 'large', tags: ['Open World', 'Action', 'Historical'] },
  242050:  { name: 'Assassin\'s Creed IV Black Flag', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['Pirates', 'Open World'] },
  1222670: { name: 'The Sims™ 4', maxPlayers: 1, mode: 'solo', size: 'medium', tags: ['Simulation'] }
};

/**
 * Keyword-based heuristic guessing for games not in the KNOWN_GAMES list
 */
const HEURISTIC_KEYWORDS = {
  solo: [
    'story', 'singleplayer', 'single-player', 'heavy rain', 'detroit', 'beyond', 'witcher', 
    'cyberpunk', 'skyrim', 'fallout', 'bioshock', 'tomb raider', 'batman', 'assassin', 
    'god of war', 'spiderman', 'spider-man', 'hades', 'hollow knight', 'celeste', 'dead cells',
    'resident evil', 'silent hill', 'alan wake', 'control', 'death stranding', 'metro',
    'dishonored', 'mass effect', 'nier', 'yakuza', 'persona', 'final fantasy', 'balatro',
    'slay the spire', 'subnautica', 'manor lords', 'sims', 'civilization', 'cities: skylines',
    'hitman', 'wolfenstein', 'deus ex', 'crysis', 'quantum break', 'life is strange', 'until dawn',
    'dark souls', 'sekiro', 'jedi', 'starfield', 'outlast', 'amnesia', 'alien: isolation'
  ],
  party: ['party', 'golf', 'trivia', 'board', 'brawl', 'worms', 'fall flat', 'gang', 'stick', 'overcooked', 'plateup', 'among us', 'duck game', 'minigame', 'jackbox'],
  coop: ['co-op', 'coop', 'survive', 'craft', 'raft', 'forest', 'phasmophobia', 'lethal', 'dead by', 'left 4', 'deep rock', 'payday', 'zomboid', 'vermintide', 'darktide', 'remnant', 'valheim'],
  pvp: ['arena', 'siege', 'counter-strike', 'cs:go', 'cs2', 'battle', 'warfare', 'deathmatch', 'tournament', 'dota', 'league', 'apex', 'pubg', 'rivals', 'strike'],
  survival: ['survival', 'ark', 'rust', 'craft', 'stranded', 'colony', 'terrafirma', 'zombie', 'apocalypse', 'wilderness']
};

/**
 * Get enriched metadata for a game
 * @param {number|string} appId 
 * @param {string} gameName 
 * @returns {object}
 */
export function getGameMetadata(appId, gameName = '') {
  const idNum = Number(appId);
  const known = KNOWN_GAMES[idNum];

  if (known) {
    return {
      appId: idNum,
      name: known.name || gameName,
      maxPlayers: known.maxPlayers,
      mode: known.mode,
      size: known.size,
      tags: known.tags || [],
      isMultiplayer: known.mode !== 'solo' && known.mode !== 'utility' && known.maxPlayers > 1
    };
  }

  // Heuristic analysis based on game name
  const lower = (gameName || '').toLowerCase();
  let mode = GAME_MODES.COOP;
  let maxPlayers = 4;
  let size = SIZE_TIERS.MEDIUM;
  let isMultiplayer = true;

  if (HEURISTIC_KEYWORDS.solo.some(k => lower.includes(k))) {
    mode = GAME_MODES.SOLO;
    maxPlayers = 1;
    size = SIZE_TIERS.LARGE;
    isMultiplayer = false;
  } else if (HEURISTIC_KEYWORDS.party.some(k => lower.includes(k))) {
    mode = GAME_MODES.PARTY;
    maxPlayers = 8;
    size = SIZE_TIERS.SMALL;
  } else if (HEURISTIC_KEYWORDS.survival.some(k => lower.includes(k))) {
    mode = GAME_MODES.SURVIVAL;
    maxPlayers = 8;
    size = SIZE_TIERS.MEDIUM;
  } else if (HEURISTIC_KEYWORDS.pvp.some(k => lower.includes(k))) {
    mode = GAME_MODES.PVP;
    maxPlayers = 10;
    size = SIZE_TIERS.LARGE;
  } else if (HEURISTIC_KEYWORDS.coop.some(k => lower.includes(k))) {
    mode = GAME_MODES.COOP;
    maxPlayers = 4;
  }

  return {
    appId: idNum,
    name: gameName,
    maxPlayers,
    mode,
    size,
    tags: [mode.toUpperCase()],
    isMultiplayer
  };
}
