import { InfoLine } from './info-line';
import { LineProperty } from './line-property';

export class BodyFormatter {
  /**
   * Formats the provided properties into a full body that can be sent to the user.
   * @param properties the properties to convert.
   * @returns the formatted message or undefined if all properties value are falsely.
   */
  public static create(properties: LineProperty[]): string | undefined {
    if (!properties || properties.length === 0 || properties.every((property) => !property.value)) {
      return undefined;
    }

    properties = properties.filter((property) => property.value !== undefined && property.value !== null);
    return properties.map(InfoLine.createLine).join('\n');
  }
}
