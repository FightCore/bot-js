import { Move } from '../src/models/move';
import { Character } from '../src/models/character';

export function getMarth(): Character {
  return {
    name: 'Marth',
    normalizedName: 'marth',
    fightCoreId: 222,
    characterStatistics: {
      id: 48,
      weight: 87,
      gravity: 2.2,
      walkSpeed: 1.6,
      runSpeed: 1.8,
      waveDashLengthRank: 4,
      plaIntangibilityFrames: 4,
      jumpSquat: 4,
      canWallJump: false,
      notes: '',
      initialDash: 1.56,
      dashFrames: 15,
      waveDashLength: 44.37,
    },
    // Moves is removed due to being unneeded.
    moves: [],
    characterInfo: {
      discord: 'https://discord.com/invite/01352PHCHms6PyCv9',
      meleeFrameData: 'http://meleeframedata.com/marth',
      ssbWiki: 'https://www.ssbwiki.com/Marth_(SSBM)',
    },
    id: 48,
  };
}

export function getMarthFTilt(): Move {
  return {
    name: 'Up Tilt',
    normalizedName: 'utilt',
    hits: [
      {
        hitboxes: [
          {
            name: 'id0',
            damage: 9,
            angle: 110,
            knockbackGrowth: 120,
            setKnockback: 0,
            baseKnockback: 40,
            effect: 'Slash',
            hitlagAttacker: 6,
            hitlagDefender: 6,
            hitlagAttackerCrouched: 4,
            hitlagDefenderCrouched: 4,
            shieldstun: 6,
            isWeightIndependent: false,
            id: 9431,
          },
          {
            name: 'id1',
            damage: 9,
            angle: 361,
            knockbackGrowth: 118,
            setKnockback: 0,
            baseKnockback: 40,
            effect: 'Slash',
            hitlagAttacker: 6,
            hitlagDefender: 6,
            hitlagAttackerCrouched: 4,
            hitlagDefenderCrouched: 4,
            shieldstun: 6,
            isWeightIndependent: false,
            id: 9432,
          },
          {
            name: 'id2',
            damage: 8,
            angle: 361,
            knockbackGrowth: 116,
            setKnockback: 0,
            baseKnockback: 40,
            effect: 'Slash',
            hitlagAttacker: 6,
            hitlagDefender: 6,
            hitlagAttackerCrouched: 4,
            hitlagDefenderCrouched: 4,
            shieldstun: 5,
            isWeightIndependent: false,
            id: 9433,
          },
          {
            name: 'id3',
            damage: 12,
            angle: 110,
            knockbackGrowth: 100,
            setKnockback: 0,
            baseKnockback: 50,
            effect: 'Slash',
            hitlagAttacker: 7,
            hitlagDefender: 7,
            hitlagAttackerCrouched: 5,
            hitlagDefenderCrouched: 5,
            shieldstun: 7,
            isWeightIndependent: false,
            id: 9434,
          },
        ],
        start: 6,
        end: 8,
        moveId: 828,
        id: 2520,
      },
      {
        hitboxes: [
          {
            name: 'id0',
            damage: 10,
            angle: 85,
            knockbackGrowth: 120,
            setKnockback: 0,
            baseKnockback: 40,
            effect: 'Slash',
            hitlagAttacker: 6,
            hitlagDefender: 6,
            hitlagAttackerCrouched: 4,
            hitlagDefenderCrouched: 4,
            shieldstun: 6,
            isWeightIndependent: false,
            id: 9435,
          },
          {
            name: 'id1',
            damage: 9,
            angle: 361,
            knockbackGrowth: 118,
            setKnockback: 0,
            baseKnockback: 30,
            effect: 'Slash',
            hitlagAttacker: 6,
            hitlagDefender: 6,
            hitlagAttackerCrouched: 4,
            hitlagDefenderCrouched: 4,
            shieldstun: 6,
            isWeightIndependent: false,
            id: 9436,
          },
          {
            name: 'id2',
            damage: 9,
            angle: 361,
            knockbackGrowth: 116,
            setKnockback: 0,
            baseKnockback: 30,
            effect: 'Slash',
            hitlagAttacker: 6,
            hitlagDefender: 6,
            hitlagAttackerCrouched: 4,
            hitlagDefenderCrouched: 4,
            shieldstun: 6,
            isWeightIndependent: false,
            id: 9437,
          },
          {
            name: 'id3',
            damage: 13,
            angle: 85,
            knockbackGrowth: 100,
            setKnockback: 0,
            baseKnockback: 50,
            effect: 'Slash',
            hitlagAttacker: 7,
            hitlagDefender: 7,
            hitlagAttackerCrouched: 5,
            hitlagDefenderCrouched: 5,
            shieldstun: 7,
            isWeightIndependent: false,
            id: 9438,
          },
        ],
        start: 9,
        end: 12,
        moveId: 828,
        id: 2521,
      },
    ],
    totalFrames: 39,
    iasa: 32,
    start: 6,
    end: 12,
    type: 1,
    source: 'http://meleeframedata.com/',
    gifUrl: 'https://i.fightcore.gg/beta/marth/utilt.gif',
    isInterpolated: false,
    sources: [
      {
        name: 'Hitboxes from I KneeData',
        url: 'http://ikneedata.com/',
        id: 4,
      },
      {
        name: 'GIF by Emilia "ReelDino" H',
        url: 'https://drive.google.com/drive/folders/14rcZ8ed43hWOJaxQhHsB-hcAgxWubRaz?usp=sharing',
        id: 1,
      },
      {
        name: 'Framedata software by @NeilHarbin0',
        url: 'https://github.com/NeilHarbin0',
        id: 2,
      },
      {
        name: 'Base frame data by MeleeFrameData.com',
        url: 'https://meleeframedata.com/',
        id: 3,
      },
    ],
    id: 828,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEmbedJson(): any {
  return {
    footer: {
      text: 'FightCore Bot Version 2.5.3',
      icon_url: 'https://i.fightcore.gg/clients/fightcore.png',
    },
    timestamp: '2024-08-11T12:22:23.399Z',
    title: 'Marth - Up Tilt',
    url: 'https://fightcore.gg/characters/222/marth/moves/828/utilt?referer=fightcore_bot',
    color: 11134461,
    fields: [
      {
        name: 'Frames 6 - 8',
        value:
          '**Name**: id0/id1/id2/id3\n' +
          '**Damage**: 9/9/8/12\n' +
          '**Angle**: 110/361/361/110\n' +
          '**Effect**: Slash/Slash/Slash/Slash\n' +
          '**Base knockback**: 40/40/40/50\n' +
          '**Knockback growth**: 120/118/116/100\n' +
          '**Set knockback**: 0/0/0/0\n' +
          '**Shieldstun**: 6/6/5/7\n' +
          '**Hitlag attacker & defender**: 6/6/6/7\n' +
          '**Hitlag attacker & defender (crouch canceled)**: 4/4/4/5\n' +
          '**Shield advantage**: -19/-19/-20/-18',
        inline: true,
      },
      {
        name: 'Frames 9 - 12',
        value:
          '**Name**: id0/id1/id2/id3\n' +
          '**Damage**: 10/9/9/13\n' +
          '**Angle**: 85/361/361/85\n' +
          '**Effect**: Slash/Slash/Slash/Slash\n' +
          '**Base knockback**: 40/30/30/50\n' +
          '**Knockback growth**: 120/118/116/100\n' +
          '**Set knockback**: 0/0/0/0\n' +
          '**Shieldstun**: 6/6/6/7\n' +
          '**Hitlag attacker & defender**: 6/6/6/7\n' +
          '**Hitlag attacker & defender (crouch canceled)**: 4/4/4/5\n' +
          '**Shield advantage**: -19/-19/-19/-18',
        inline: true,
      },
      {
        name: 'Hitbox Colors',
        value: 'id0=Red, id1=Green, id2=Purple, id3=Orange',
      },
    ],
    description: '**Total frames**: 39\n**Hit**: 6-12\n**IASA**: 32',
    image: { url: 'https://i.fightcore.gg/beta/marth/utilt.gif?version=2.5.3' },
  };
}
