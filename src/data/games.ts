export interface Game {
  id: string;
  title: string;
  system: 'sega' | 'neogeo';
  core: string;
  description: string;
  romUrl: string;
  thumbnail?: string;
}

// Note: Some Archive.org links may return 503 errors during high traffic
// The app uses a proxy (/api/rom) to handle CORS and improve reliability

export const games: Game[] = [
  {
    id: 'neogeo-metal-slug',
    title: 'Metal Slug',
    system: 'neogeo',
    core: 'fbneo',
    description: 'Classic run-and-gun arcade action',
    romUrl: 'https://archive.org/download/mame-merged/mslug.zip',
  },
  {
    id: 'neogeo-kof98',
    title: 'King of Fighters 98',
    system: 'neogeo',
    core: 'fbneo',
    description: 'The legendary fighting tournament',
    romUrl: 'https://archive.org/download/mame-merged/kof98.zip',
  },
  {
    id: 'neogeo-samurai-shodown',
    title: 'Samurai Shodown',
    system: 'neogeo',
    core: 'fbneo',
    description: 'Weapons-based fighting action',
    romUrl: 'https://archive.org/download/mame-merged/samsho.zip',
  },
  {
    id: 'sega-sonic',
    title: 'Sonic the Hedgehog',
    system: 'sega',
    core: 'genesis_plus_gx',
    description: 'Speed through loops and collect rings',
    // Using direct archive.org download with correct filename
    romUrl: 'https://archive.org/download/nointro.sega-genesis/Sonic_the_Hedgehog_(USA,_Europe).zip',
  },
  {
    id: 'sega-streets-of-rage',
    title: 'Streets of Rage',
    system: 'sega',
    core: 'genesis_plus_gx',
    description: 'Classic beat-em-up adventure',
    romUrl: 'https://archive.org/download/nointro.sega-genesis/Streets_of_Rage_(USA,_Europe).zip',
  },
  {
    id: 'sega-altered-beast',
    title: 'Altered Beast',
    system: 'sega',
    core: 'genesis_plus_gx',
    description: 'Rise from your grave and fight',
    romUrl: 'https://archive.org/download/nointro.sega-genesis/Altered_Beast_(USA,_Europe).zip',
  },
];