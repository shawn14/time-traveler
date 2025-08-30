/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getShareCaption(mode: string, category: string): string {
  const captions: Record<string, Record<string, string>> = {
    'time-traveler': {
      '1950s': "Just discovered I would've been a total heartthrob in the 1950s! 🕰️✨ #TimeTraveler #1950sStyle",
      '1960s': "Peace, love, and time travel! Check out my groovy 1960s look 🌸☮️ #TimeTraveler #60sVibes",
      '1970s': "Disco never died, it was just waiting for me! 🕺✨ #TimeTraveler #70sStyle",
      '1980s': "The 80s called and said I totally belong there! 🎸🌈 #TimeTraveler #80sVibes",
      '1990s': "Y2K who? Living my best 90s life! 📼💿 #TimeTraveler #90sNostalgia",
      '2000s': "Bringing back the 2000s one transformation at a time! 📱✨ #TimeTraveler #2000sThrowback"
    },
    'style-sculptor': {
      'Cyberpunk': "Welcome to the neon future! 🌃⚡ #StyleSculptor #Cyberpunk2077",
      'Film Noir': "Every shadow tells a story... 🎬🚬 #StyleSculptor #FilmNoir",
      'Vogue Cover': "Serving looks that could grace any magazine! 📸✨ #StyleSculptor #VogueVibes",
      'Anime': "My anime transformation is complete! 🌸⚔️ #StyleSculptor #AnimeLife",
      'Streetwear Hype': "Drip check: PASSED ✅🔥 #StyleSculptor #Streetwear",
      'Baroque Painting': "Renaissance called, they want their masterpiece back! 🎨👑 #StyleSculptor #ClassicArt"
    },
    'world-wanderer': {
      'Tokyo Crossing': "Lost in translation but found in Tokyo! 🗾🌸 #WorldWanderer #TokyoVibes",
      'Parisian Café': "Sipping dreams in the City of Light ☕🥐 #WorldWanderer #ParisianLife",
      'Sahara Expedition': "Desert wanderer seeking golden horizons 🐪🌅 #WorldWanderer #SaharaAdventure",
      'Amazon Rainforest': "Deep in the jungle, finding my wild side! 🌿🦜 #WorldWanderer #AmazonExplorer",
      'Venetian Gondola': "Living la dolce vita in Venice! 🚣‍♂️🎭 #WorldWanderer #VeniceVibes",
      'Himalayan Peak': "On top of the world! 🏔️❄️ #WorldWanderer #HimalayanHigh"
    },
    'character-creator': {
      'Long Hair': "New hair, who dis? 💁‍♀️✨ #CharacterCreator #LongHairDontCare",
      'Short Hair': "Short hair, big energy! 💇‍♀️⚡ #CharacterCreator #ShortHairStyle",
      'Curly Hair': "Embracing the curls! 🌀💕 #CharacterCreator #CurlyHairGoals",
      'Vibrant Hair Color': "Life's too short for boring hair! 🌈✨ #CharacterCreator #ColorfulHair",
      'Full Beard': "Beard game strong! 🧔‍♂️💪 #CharacterCreator #BeardLife",
      'Mustache': "Mustache game on point! 👨‍🦱🎩 #CharacterCreator #MustacheStyle"
    },
    'glow-up': {
      'Red Carpet Ready': "Just discovered my red carpet alter ego! ✨🎬 #GlowUp #RedCarpetReady",
      'Model Moment': "Serving looks that could grace any magazine! 📸💫 #GlowUp #ModelMoment",
      'Golden Hour Glow': "That golden hour glow hits different! 🌅✨ #GlowUp #GoldenHour",
      'Business Elite': "CEO vibes activated! 💼🔥 #GlowUp #BusinessElite",
      'Fitness Influencer': "Fitness goals unlocked! 💪✨ #GlowUp #FitnessMotivation",
      'Main Character Energy': "Main character energy is REAL! 🌟💯 #GlowUp #MainCharacter"
    }
  };

  const modeCaption = captions[mode]?.[category];
  if (modeCaption) return modeCaption;

  // Fallback for random/surprise mode
  return `The Time Machine sent me to ${category}! 🎰✨ Check out this surprise transformation! #TimeTraveler #SurpriseMe`;
}

export function getDuelShareCaption(mode: string, category: string, isPlayer1: boolean): string {
  const playerNum = isPlayer1 ? '1' : '2';
  const emoji = isPlayer1 ? '🥇' : '🥈';
  
  const baseCaptions: Record<string, string> = {
    'time-traveler': `Player ${playerNum} time traveled to the ${category}! ${emoji} Who wore it better? #TimeTravelDuel #Player${playerNum}`,
    'style-sculptor': `Player ${playerNum} sculpted into ${category} style! ${emoji} Vote for your favorite! #StyleDuel #Player${playerNum}`,
    'world-wanderer': `Player ${playerNum} wandering through ${category}! ${emoji} Which adventurer wins? #WorldDuel #Player${playerNum}`,
    'character-creator': `Player ${playerNum} rocking the ${category} look! ${emoji} Cast your vote! #CharacterDuel #Player${playerNum}`,
    'glow-up': `Player ${playerNum} glowing up with ${category}! ${emoji} Who's serving more looks? #GlowUpDuel #Player${playerNum}`
  };

  return baseCaptions[mode] || `Player ${playerNum} transformed into ${category}! ${emoji} #TimeTravelDuel #Player${playerNum}`;
}

export function downloadImage(imageUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function shareToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}