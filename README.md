# FightCore bot

The FightCore bot provides frame data based on Super Smash Bros Melee's characters.
The data is pulled from the FightCore API which combines multiple sources into
one standardized format.

## Running the bot locally

You can run the bot locally within a few steps:

- Install the latest LTS version of Node.
- Run `npm install` in the root folder of the project.
- Create a copy of the `env-template` and rename it to `.env`
- Fill the `TOKEN` field with your Discord bot's token.
- Either run `npm run debug` or press F5 within Visual Studio Code.

## Running the bot within Docker

You can also run the bot using the included Dockerfile
Simply run using the following two commands:

- `docker build -t fightcore-bot .`
- `docker run -it --env TOKEN="XXXXX-XXXX-XXXX" fightcore-bot`

## Unit tests

The `tests` folder contains some unit tests for the bot to ensure it is functional.
This is currently one of the most lacking areas of the code base.

## Data

The data is loaded from the `/src/assets/framedata.json` file. This is a generated
file from the [frame-data](https://www.github.com/fightcore/frame-data) repository.
This file should never be manually edited.

There is also an environment variable to gather the data from an URL.
This will be used in the future to support automatic data updates.

## Commands

The bot supports the following commands

- `/framedata`: Lets the user pick a character and move and then
  shows the frame data of that move as an embed.
- `/cc` or `/crouchcancel`: Lets the user pick a character and move and a possible target.
  Shows the percentage at which crouch cancel breaks and is no longer possible.
- `/asdi`: Lets the user pick a character and move and a possible target.
  Shows the percentage at which ASDI down breaks and is no longer possible.
- `/character`: Lets the user pick a character and displays some statistics about
  that character as an embed.
- `/report`: Opens the report modal to report bad frame data back to FightCore.

There also exists a `/tournament` but this is currently disabled as its a WIP
feature.

The FightCore bot also supports direct messages and @mentions.
These act the same as the `/framedata` command and use a search algorithm to find
the best matching character and or move.

If there is a `PREFIX` defined in the .env file, the bot will also respond to text
messages with that prefix. This prefix does not have a set length.

> When using the prefix, the MessageContent permission is required. This is NOT
> available on larger bots due to privacy concerns. I highly recommend not using
> a prefix.
