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
    },
    'what-if': {
      'If I Was Famous': "In another universe, I'm living my best celebrity life! 🌟📸 #WhatIf #FamousLife",
      'If I Was Royal': "What if I was born royal? Now I know! 👑✨ #WhatIf #RoyalLife",
      'If I Was a Superhero': "My superhero alter ego just dropped! 🦸‍♀️💥 #WhatIf #SuperheroMode",
      'If I Was in a Band': "Living my rock star dreams in an alternate timeline! 🎸🔥 #WhatIf #RockStar",
      'If I Was an Athlete': "Olympic champion in another life! 🏅💪 #WhatIf #AthleteLife",
      'If I Was a Billionaire': "Billionaire lifestyle unlocked! 💰🚁 #WhatIf #BillionaireVibes"
    },
    'avatar-creator': {
      'LinkedIn Professional': "Just updated my LinkedIn headshot! Time to level up my career game 💼✨ #AvatarCreator #LinkedInReady",
      'Discord Avatar': "New Discord avatar just dropped! Gaming in style 🎮🔥 #AvatarCreator #DiscordVibes",
      'Zoom Ready': "Zoom meetings will never be the same! Professional from the waist up 💻😎 #AvatarCreator #ZoomReady",
      'Memoji Style': "My Memoji twin is here! Too cute or too accurate? 🎭💫 #AvatarCreator #MemojiLife",
      'Anime Avatar': "My anime transformation is complete! Notice me senpai! 🌸⚔️ #AvatarCreator #AnimeAvatar",
      'Pixar Character': "Just found out I'm a Pixar character! What's my movie called? 🎬✨ #AvatarCreator #PixarStyle"
    },
    'vibe-check': {
      'Dark Academia': "Reading ancient texts in my secret library 📚🕯️ #VibeCheck #DarkAcademia",
      'Cottagecore': "Living my best cottage life! Who needs wifi when you have wildflowers? 🌻🏡 #VibeCheck #Cottagecore",
      'Y2K Aesthetic': "The year 2000 called, they want their vibe back! 💿✨ #VibeCheck #Y2KAesthetic",
      'Clean Girl': "That 5am morning routine is finally paying off! 🧘‍♀️💫 #VibeCheck #CleanGirl",
      'E-Girl/E-Boy': "Alt vibes only! Chains and platforms required 🖤⛓️ #VibeCheck #EGirlEBoy",
      'Old Money': "Born into wealth (in this filter at least) 🥂💎 #VibeCheck #OldMoney"
    },
    'meme-machine': {
      'Gigachad': "Yes, I lift... filters 💪🗿 #MemeMachine #Gigachad",
      'Anime Protagonist': "My power level is over 9000! ⚡🔥 #MemeMachine #AnimeProtagonist",
      'NPC Mode': "I used to be an adventurer like you... 🎮🤖 #MemeMachine #NPCMode",
      'Wojak Feels': "That feel when your transformation is too real 😔✊ #MemeMachine #WojakFeels",
      'Based Department': "Hello, Based Department? You're gonna wanna see this 📞😎 #MemeMachine #BasedDepartment",
      'Touch Grass': "Finally touched grass! Achievement unlocked! 🌱☀️ #MemeMachine #TouchGrass"
    },
    'interior-design': {
      'Modern Minimalist': "Less is more! Check out my minimalist transformation 🏠✨ #InteriorDesign #MinimalistLiving",
      'Cozy Bohemian': "Boho vibes only! My space is now a cozy paradise 🌿🕯️ #InteriorDesign #BohemianStyle",
      'Industrial Chic': "Exposed brick and Edison bulbs? Yes please! 🏭💡 #InteriorDesign #IndustrialChic",
      'Scandinavian': "Hygge home achieved! So clean, so cozy 🕊️🏡 #InteriorDesign #ScandinavianDesign",
      'Mid-Century Modern': "Mad Men called, they want their aesthetic back! 🥃🎨 #InteriorDesign #MidCenturyModern",
      'Luxury Penthouse': "Living my best penthouse life! 🏙️💎 #InteriorDesign #LuxuryLiving"
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
    'glow-up': `Player ${playerNum} glowing up with ${category}! ${emoji} Who's serving more looks? #GlowUpDuel #Player${playerNum}`,
    'what-if': `Player ${playerNum} living their best ${category} life! ${emoji} Which reality wins? #WhatIfDuel #Player${playerNum}`,
    'avatar-creator': `Player ${playerNum} created their ${category} avatar! ${emoji} Which profile pic wins? #AvatarDuel #Player${playerNum}`,
    'vibe-check': `Player ${playerNum} serving ${category} vibes! ${emoji} Who passes the vibe check? #VibeDuel #Player${playerNum}`,
    'meme-machine': `Player ${playerNum} became the ${category} meme! ${emoji} Which meme reigns supreme? #MemeDuel #Player${playerNum}`,
    'interior-design': `Player ${playerNum} redesigned their space in ${category} style! ${emoji} Which room wins? #InteriorDuel #Player${playerNum}`
  };

  return baseCaptions[mode] || `Player ${playerNum} transformed into ${category}! ${emoji} #TimeTravelDuel #Player${playerNum}`;
}

async function dataURLtoBlob(dataURL: string): Promise<Blob> {
  const response = await fetch(dataURL);
  return response.blob();
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  try {
    // Convert data URL to blob
    const blob = await dataURLtoBlob(imageUrl);
    
    // Check if Web Share API is available (better for mobile)
    if (navigator.share && blob.type.startsWith('image/')) {
      try {
        const file = new File([blob], filename, { type: blob.type });
        await navigator.share({
          files: [file],
          title: 'Time Traveler Photo',
        });
        return;
      } catch (err) {
        console.log('Web Share failed, falling back to download');
      }
    }
    
    // For iOS, open image in new tab
    if (isIOS()) {
      const blobUrl = URL.createObjectURL(blob);
      const newTab = window.open(blobUrl, '_blank');
      
      // Clean up after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      // Show instruction for iOS users
      if (newTab) {
        alert('Long press the image and select "Save Image" to save to your photos');
      }
    } else {
      // Desktop and Android download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
    }
  } catch (error) {
    console.error('Download failed:', error);
    alert('Unable to download image. Please try taking a screenshot instead.');
  }
}

export function getFusionShareCaption(mode: string, category: string, fusionType: 'combine' | 'merge' | 'wallpaper'): string {
  const action = fusionType === 'wallpaper' ? 'applied' : fusionType === 'merge' ? 'merged' : 'combined';
  const emoji = fusionType === 'wallpaper' ? '🖼️' : fusionType === 'merge' ? '🔀' : '➕';
  
  const baseCaptions: Record<string, string> = {
    'time-traveler': `Two souls ${action} in the ${category}! ${emoji} Time travel fusion at its finest! #TimeTravelerFusion #${category}`,
    'style-sculptor': `Art meets art! Two styles ${action} into one ${category} masterpiece! ${emoji} #StyleFusion #${category}`,
    'world-wanderer': `Double the adventure! We ${action} our journey in ${category}! ${emoji} #WorldWandererFusion`,
    'character-creator': `Two looks ${action} into one amazing ${category} transformation! ${emoji} #CharacterFusion`,
    'glow-up': `Double glow up! We ${action} our best selves into ${category}! ${emoji}✨ #GlowUpFusion`,
    'what-if': `What if we ${action}? ${category} fusion edition! ${emoji} #WhatIfFusion`,
    'avatar-creator': `Two avatars ${action} into one ${category} masterpiece! ${emoji} #AvatarFusion`,
    'vibe-check': `Vibes ${action}! Double the ${category} aesthetic! ${emoji} #VibeFusion`,
    'meme-machine': `Memes ${action}! Ultimate ${category} fusion unlocked! ${emoji} #MemeFusion`,
    'interior-design': fusionType === 'wallpaper' ? `New wallpaper ${action}! My ${category} room looks amazing! ${emoji} #InteriorDesign #WallpaperMagic` : `Design fusion! Two styles ${action} into one ${category} dream space! ${emoji} #InteriorFusion`
  };
  
  return baseCaptions[mode] || `Check out this amazing ${category} fusion! ${emoji} #Fusion`;
}

export async function shareToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    // Fallback for iOS
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err2) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

export async function shareImage(imageUrl: string, caption: string, filename: string): Promise<boolean> {
  try {
    if (navigator.share) {
      const blob = await dataURLtoBlob(imageUrl);
      const file = new File([blob], filename, { type: blob.type });
      
      await navigator.share({
        files: [file],
        title: 'Time Traveler Photo',
        text: caption
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Share failed:', error);
    return false;
  }
}