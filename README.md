# FightCore bot

The FightCore bot provides frame data based on Super Smash Bros Melee's characters.
The data is pulled from the FightCore API which combines multiple sources into
one standardized format.

## Running the bot locally

You can run the bot locally within a few easy steps:

- Install the latest LTS version of Node.
- Run `npm install` in the root folder of the project.
- Create a `.env` file within the root of the project.
- Fill the `.env` file with the token of your Discord bot.

```env
TOKEN=XXXXX-XXXX-XXXX
```

- Either run `npm run debug` or press F5 within Visual Studio Code.

## Running the bot within Docker

You can also run the bot using the included Dockerfile
Simply run using the following two commands:

- `docker build -t fightcore-bot .`
- `docker run -it --env TOKEN="XXXXX-XXXX-XXXX" fightcore-bot`