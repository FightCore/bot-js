export class Normalizer {
  static normalize(input: string): string {
    return input.replace(/[^a-z0-9]/gi, '').toLowerCase();
  }
}
