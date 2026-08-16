export class CharacterEmoji {
  static getEmoteId(normalizedName: string): string | undefined {
    const emotes = [
      { id: '1253321851405467710', name: 'bowser' },
      { id: '1253321852504510464', name: 'captainfalcon' },
      { id: '1253321853536047225', name: 'donkeykong' },
      { id: '1253321854924357674', name: 'drmario' },
      { id: '1253321856753209426', name: 'falco' },
      { id: '1253321858057769111', name: 'fwireframe' },
      { id: '1253321859181842442', name: 'fox' },
      { id: '1253321860721016832', name: 'ganondorf' },
      { id: '1253321863988383764', name: 'jigglypuff' },
      { id: '1253321866840510555', name: 'link' },
      { id: '1253321868946182164', name: 'luigi' },
      { id: '1253321872628514868', name: 'marth' },
      { id: '1253321876722421882', name: 'mrgame&watch' },
      { id: '1253321880006299699', name: 'peach' },
      { id: '1253321883663859722', name: 'pikachu' },
      { id: '1253321888068010064', name: 'samus' },
      { id: '1253321891884695675', name: 'yoshi' },
      { id: '1253321895458111568', name: 'zelda' },
      { id: '1253322051796598797', name: 'iceclimbers' },
      { id: '1253322053424124065', name: 'kirby' },
      { id: '1253322054523162634', name: 'mario' },
      { id: '1253322178330628148', name: 'mewtwo' },
      { id: '1253322179169353809', name: 'ness' },
      { id: '1253322180473786561', name: 'pichu' },
      { id: '1253322182118080512', name: 'roy' },
      { id: '1253322183569178705', name: 'sheik' },
      { id: '1253322184290467861', name: 'younglink' },
    ];
    const id = emotes.find((emote) => emote.name === normalizedName)?.id;
    if (id) {
      return `<:a:${id}>`;
    }

    return undefined;
  }
}
