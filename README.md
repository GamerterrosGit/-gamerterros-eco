<h1 align="center">
    💸 TerrosEco 💸
</h1>

A Discord.js v13 Module that allows you to Create an Basic Economy System for Your Discord Bot Easily.

[![NPM](https://nodei.co/npm/terros-eco.png)](https://www.npmjs.com/package/terros-eco)

[![Downloads](https://img.shields.io/npm/dt/terros-eco?logo=npm&style=flat-square)](https://www.npmjs.com/package/terros-eco)

## Features

- 🌎 <b>Seperate Cluster</b> | You can use a cluster for your project and another mongodb cluster for your economy system.That means you can use more than 1 Cluster for your bot

- ⚡️ <b>Quick & Easy Setup</b> | Its really easy to set up a economy system with this package!

## Install Package

Let's take a look at how you can install this package into your Discord Bot Project.

`npm i terros-eco --save`

## New Changes

- 💸 <b>Job System<b> | You can give users Jobs and Salaries.

- 💸 <b>Timed Payouts<b> | Added daily, weekly, monthly and yearly function.

- 💸 <b>New Features<b> | Added utility functions like delete(deletes the user from the database), profile(returns all the properties stored by the user like wallet, bank, bankSpace, job, salary, lastDaily, id(the users id), created(the date when the user was created)) and finally the progressBar function takes values such as value(the current progress),maxValue, size(example 5, returns 5 progress bars with 20% and 40% and so on progress if the max value is 100).

## Coming Soon

- 🛒 <b>Shop System<b> | A system with buy,sell and trade functions and inventories

## Example Code

```js
const { Client, Intents } = require("discord.js");
const TerrosEco = require("terros-eco");
const PREFIX = "!";
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", () => {
  console.log("Bot is Online");
});

client.eco = new TerrosEco({
  notify: true, //console logs "Connected to database" if its true
  URI: "YOUR MONGODB URI",
  SpecialCoin: true, //enables the special coin system
});
client.eco.connect(); //Connects the package to the mongodb cluster

client.on("interactionCreate", async (i) => {
  if (i.isCommand()) {
    const { commandName } = i;
    if (commandName === "bal") {
      const wallet = await client.eco.wallet({ UserID: i.user.id });
      const bank = await client.eco.bank({ UserID: i.user.id });
      const bankSpace = await client.eco.bankSpace({
        UserID: i.user.id,
      });
      const SpecialCoin = await client.eco.specialCoin({
        UserID: i.user.id,
      });
      if (wallet || bank || bankSpace || SpecialCoin === "UNREGISTERED_USER")
        return i.reply({
          content: "you havent registered please register",
        });
      i.reply({
        content: `Wallet: ${wallet}\nBank: ${bank}/${bankSpace}\nTerrosCoins: ${SpecialCoin}`,
      });
    }
    if (commandName === "register") {
      const result = await client.eco.register({
        UserID: i.user.id,
        DefaultWallet: 0,
        DefaultBank: 0,
        DefaultBankSpace: 5000,
      });
      if (result === "REGISTERED")
        return i.reply({ content: "you have already registered" });
      if (result === "DONE")
        return i.reply({ content: `You have successfully registered` });
    }
  }
});

client.login("Discord Bot Token");
```
