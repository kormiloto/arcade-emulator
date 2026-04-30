export interface Game {
  id: string;
  title: string;
  system: 'sega' | 'neogeo';
  core: string;
  description: string;
  romUrl: string;
  thumbnail?: string;
}

// Switching to GitHub-hosted ROMs for much faster download speeds
export const games: Game[] = [
  {
    id: 'neogeo-metal-slug',
    title: 'Metal Slug',
    system: 'neogeo',
    core: 'fbneo',
    description: 'Classic run-and-gun arcade action',
    romUrl: 'https://github.com/linuxguist/retro-arcade-game-roms/raw/master/mslug.zip',
  },
  {
    id: 'neogeo-kof98',
    title: 'King of Fighters 98',
    system: 'neogeo',
    core: 'fbneo',
    description: 'The legendary fighting tournament',
    romUrl: 'https://github.com/linuxguist/retro-arcade-game-roms/raw/master/kof98.zip',
  },
  {
    id: 'neogeo-samurai-shodown',
    title: 'Samurai Shodown',
    system: 'neogeo',
    core: 'fbneo',
    description: 'Weapons-based fighting action',
    romUrl: 'https://github.com/linuxguist/retro-arcade-game-roms/raw/master/samsho.zip',
  },
  {
    id: 'sega-sonic',
    title: 'Sonic the Hedgehog',
    system: 'sega',
    core: 'genesis_plus_gx',
    description: 'Speed through loops and collect rings',
    romUrl: 'https://github.com/Alizer/Sega-Genesis-ROMs/raw/master/Sonic%20the%20Hedgehog%20(USA%2C%20Europe).zip',
  },
  {
    id: 'sega-streets-of-rage',
    title: 'Streets of Rage',
    system: 'sega',
    core: 'genesis_plus_gx',
    description: 'Classic beat-em-up adventure',
    romUrl: 'https://github.com/Alizer/Sega-Genesis-ROMs/raw/master/Streets%20of%20Rage%20(USA%2C%20Europe).zip',
  },
  {
    id: 'sega-altered-beast',
    title: 'Altered Beast',
    system: 'sega',
    core: 'genesis_plus_gx',
    description: 'Rise from your grave and fight',
    romUrl: 'https://github.com/Alizer/Sega-Genesis-ROMs/raw/master/Altered%20Beast%20(USA%2C%20Europe).zip',
  },
];
