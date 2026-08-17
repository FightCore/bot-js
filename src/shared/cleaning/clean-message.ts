export class CleanMessage {
  public static execute(query: string): string {
    return this.removeEmotes(query);
  }

  private static removeEmotes(query: string): string {
    // Regex on emotes to remove them and keep the main "word" in them
    // Format for a typical emote is <:WORD:ID>
    return query.replace(/<:(\w+):\d+>/g, '$1');
  }
}
