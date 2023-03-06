import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { FailureStore } from '../data/failure-store';
import { Search } from '../data/search';
import { MoveEmbedCreator } from '../embeds/move-embed-creator';
import { BaseInteractionHandler } from './base-interaction-handler';

@injectable()
export class ComponentInteractionHandler extends BaseInteractionHandler {
  constructor(search: Search, @inject(Symbols.Logger) logger: Logger, failureStore: FailureStore) {
    super(search, logger, failureStore);
  }

  public async handle(interaction: ButtonInteraction | StringSelectMenuInteraction): Promise<void> {
    let isFromOriginalUser = false;
    const messageMentions = interaction.message.mentions;
    if (messageMentions === null || messageMentions.repliedUser?.id === interaction.user.id) {
      isFromOriginalUser = true;
    }

    if (interaction.message.interaction && interaction.message.interaction.user?.id === interaction.user.id) {
      isFromOriginalUser = true;
    }

    const characterMove = this.search.search(interaction.isStringSelectMenu() ? interaction.values[0] : interaction.customId);
    if (!characterMove || !characterMove.move) {
      this.logger.error('Move not found for interaction');
      return;
    }

    const embedCreator = new MoveEmbedCreator(characterMove.move, characterMove.character);

    if (isFromOriginalUser) {
      await interaction.update({
        embeds: embedCreator.createEmbed(),
        components: [],
      });
      this.failureStore.remove(interaction.message.id);
    } else {
      await interaction.deferUpdate();
      await interaction.followUp({
        ephemeral: true,
        embeds: embedCreator.createEmbed(),
        components: embedCreator.createButtons(),
      });
    }
  }
}
