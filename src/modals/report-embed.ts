import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export class ReportModal {
  create(): ModalBuilder {
    const modal = new ModalBuilder().setCustomId('fc_report').setTitle('Report a move');

    // Create the text input components
    const characterInput = new TextInputBuilder()
      .setCustomId('report_character_input')
      // The label is the prompt the user sees for this input
      .setLabel('What character has the incorrect data?')
      // Short means only a single line of text
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const moveInput = new TextInputBuilder()
      .setCustomId('report_move_input')
      // The label is the prompt the user sees for this input
      .setLabel('What move has the incorrect data?')
      // Short means only a single line of text
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const issueInput = new TextInputBuilder()
      .setCustomId('report_issue_input')
      .setLabel('What is the issue with the move?')
      // Paragraph means multiple lines of text.
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    // An action row only holds one text input,
    // so you need one action row per text input.
    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(characterInput);
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(moveInput);
    const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(issueInput);

    // Add inputs to the modal
    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
    return modal;
  }
}
