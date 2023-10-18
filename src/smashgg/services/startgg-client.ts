import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { Tournament } from '../models/tournament';
import { Data, RootList } from '../models/result';

export class StartggClient {
  async request(name: string): Promise<Tournament> {
    const query = gql`
      query getTournaments($name: String) {
        result: tournaments(query: { filter: { name: $name, videogameIds: [1] }, perPage: 1 }) {
          nodes {
            id
            name
            slug
            events {
              id
              name
              type
              standings(query: { perPage: 10 }) {
                nodes {
                  placement
                  player {
                    prefix
                    gamerTag
                    user {
                      genderPronoun
                    }
                  }
                }
              }

              state
            }
            numAttendees
            startAt
            venueAddress
            images {
              url
              type
            }
          }
        }
      }
    `;

    const variables = {
      name,
    };

    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          authorization: `Bearer woops, that token was invalid anyways`,
        },
      };
    });

    const httpLink = createHttpLink({
      uri: 'https://api.start.gg/gql/alpha',
    });

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: authLink.concat(httpLink),
    });

    const result = await client.query<Data<Tournament>>({ query, variables });
    console.log(result);
    return result.data.result.nodes[0];
  }
}
