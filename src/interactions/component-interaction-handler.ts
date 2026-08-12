import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols.js';
import { FailureStore } from '../data/failure-store.js';
import { Search } from '../data/search.js';
import { MoveEmbedCreator } from '../embeds/move-embed-creator.js';
import { BaseInteractionHandler } from './base-interaction-handler.js';
import { LogSingleton } from '../utils/logs-singleton.js';

@injectable()
export class ComponentInteractionHandler extends BaseInteractionHandler {
  constructor(search: Search, @inject(Symbols.Logger) logger: Logger, failureStore: FailureStore) {
    super(search, logger, failureStore);
  }

  public async handle(interaction: ButtonInteraction | StringSelectMenuInteraction): Promise<void> {
    const logger = LogSingleton.createContextLogger(interaction);
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
      logger.error('Move not found for interaction');
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
