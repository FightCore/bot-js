import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { BaseEmbedCreator } from '../embeds/base-embed-creator';
import { Tournament } from './models/tournament';

export class StartggEmbedCreator extends BaseEmbedCreator {
  create(tournament: Tournament): EmbedBuilder[] {
    const embed = this.baseEmbed();
    embed.setTitle(tournament.name);
    const fields: APIEmbedField[] = [];
    fields.push({
      name: 'Tournament info',
      value: `**Entrants**: ${tournament.numAttendees}
        **Venue:** ${tournament.venueAddress}`,
    });

    if (tournament.events) {
      for (const event of tournament.events) {
        if (event.standings) {
          let standingsString = '';
          for (const placement of event.standings.nodes) {
            standingsString += `**${placement.placement}**:`;
            if (placement.player?.prefix) {
              standingsString += ` ${placement.player.prefix} |`;
            }
            standingsString += ` ${placement.player?.gamerTag}`;
            if (placement.player?.user?.genderPronoun) {
              standingsString += ` (${placement.player.user.genderPronoun})`;
            }

            standingsString += '\n';
          }

          fields.push({
            name: event.name,
            value: standingsString,
            inline: true,
          });
        }
      }
    }

    if (tournament.images) {
      const profile = tournament.images.find((image) => image.type === 'profile');
      if (profile) {
        embed.setThumbnail(profile.url);
      }

      const banner = tournament.images.find((image) => image.type === 'banner');
      if (banner) {
        embed.setImage(banner.url);
      }
    }

    embed.addFields(fields);

    return [embed];
  }
}
