import { LineProperty } from './line-property';
import { PropertyType } from './property-type';

export class InfoLine {
  /**
   * Creates a line to display within the discord chat
   * In the format of **title**: value
   * If the value is falsely, will return undefined instead.
   * @param lineProperty the property to convert.
   * @returns the converted line.
   */
  public static createLineWithTitle(title: string, value: PropertyType): string | undefined {
    if (!value) {
      return undefined;
    }

    if (typeof value === 'string' && value.indexOf('/') === 0) {
      return undefined;
    }

    return `**${title}**: ${value}`;
  }

  /**
   * Creates a line to display within the discord chat
   * In the format of **title**: value
   * If the value is falsely, will return undefined instead.
   * @param lineProperty the property to convert.
   * @returns the converted line.
   */
  public static createLine(lineProperty: LineProperty): string | undefined {
    return InfoLine.createLineWithTitle(lineProperty.title, lineProperty.value);
  }
}
