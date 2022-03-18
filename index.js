const mongoose = require("mongoose");
const profile = require("./models/economy");
const ms = require('ms')
const EventEmitter = require('events')
class TerrosEco extends EventEmitter {
  constructor({ URI, SpecialCoin }) {
    if (!URI) return console.log("Invalid URI");
    this.URI = URI;
    this.SpecialCoin = SpecialCoin || false;
  }

  // Connect function which connects to database
  async connect() {
    mongoose.connect(this.URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).then(() => this.emit('ready'));
  }

  // Register function which registers the user
  async register({ UserID, DefaultWallet, DefaultBank, DefaultBankSpace }) {
    const data = await profile.findOne({ UserID });
    if (data) return "REGISTERED";
    if (!this.SpecialCoin) {
      new UserSchema({
        UserID,
        CreatedAt: Date.now(),
        Wallet: DefaultWallet,
        Bank: DefaultBank,
        BankSpace: DefaultBankSpace,
      }).save();
      return "DONE";
    } else if (this.SpecialCoin) {
      new UserSchema({
        UserID,
        CreatedAt: Date.now(),
        Wallet: DefaultWallet,
        Bank: DefaultBank,
        BankSpace: DefaultBankSpace,
        SpecialCoin: 0,
      }).save();
      return "DONE";
    }
  }

  async delete({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED";
    data.delete();
    return "DONE"
  }

  async add({ UserID, Amount, Property }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (
      Property != "Wallet" ||
      Property != "Bank" ||
      Property != "SpecialCoin" ||
      Property != "BankSpace"
    )
      throw new TypeError(
        "Invalid Property: the properties can only be Wallet, Bank, BankSpace or SpecialCoin"
      );
    switch (Property) {
      case "Wallet":
        {
          data.Wallet = data.Wallet + Amount;
          data.save();
          return "DONE";
        }
        break;

        case "Bank":
        {
          data.Bank = data.Bank + Amount;
          data.save();
          return "DONE";
        }
        break;

        case "BankSpace":
        {
          data.BankSpace = data.BankSpace + Amount;
          data.save();
          return "DONE";
        }
        break;

        case "SpecialCoin":
        {
          data.SpecialCoin = data.SpecialCoin + Amount;
          data.save();
          return "DONE";
        }
        break;
    }
  }

  async remove({ UserID, Amount, Property }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (
      Property != "Wallet" ||
      Property != "Bank" ||
      Property != "SpecialCoin" ||
      Property != "BankSpace"
    )
      throw new TypeError(
        "Invalid Property: the properties can only be Wallet, Bank, BankSpace or SpecialCoin"
      );
    switch (Property) {
      case "Wallet":
        {
          data.Wallet = data.Wallet - Amount;
          data.save();
          return "DONE";
        }
        break;

        case "Bank":
        {
          data.Bank = data.Bank - Amount;
          data.save();
          return "DONE";
        }
        break;

        case "BankSpace":
        {
          data.BankSpace = data.BankSpace - Amount;
          data.save();
          return "DONE";
        }
        break;

        case "SpecialCoin":
        {
          data.SpecialCoin = data.SpecialCoin - Amount;
          data.save();
          return "DONE";
        }
        break;
    }
  }

  async withdraw({ UserID, Amount }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (data.Bank == 0 || data.Bank < Amount) return "USER_BROKE";

    data.Bank = data.Bank - Amount;
    data.Wallet = data.Wallet + Amount;
    data.save();
    return "DONE";
  }

  async deposit({ UserID, Amount }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (data.Wallet == 0 || data.Wallet < Amount) return "USER_BROKE";
    if (data.Wallet + Amount > data.BankSpace) return "NOT_ENOUGH_SPACE";
    data.Bank = data.Wallet + Amount;
    data.Wallet = data.Wallet - Amount;
    data.save();
    return "DONE";
  }

  async rob({ robberid, victimid, Amount }) {
    const robberdata = await profile.findOne({ UserID: robberid });
    const victimdata = await profile.findOne({ UserID: victimid });
    if (!robberdata) return "UNREGISTERED_ROBBER";
    if (!victimdata) return "UNREGISTERED_VICTIM";
    if (victimdata.Wallet == 0 || victimdata.Wallet < Amount)
      return "VICTIM_IS_BROKE";
    robberdata.Wallet = robberdata.Wallet + Amount;
    victimdata.Wallet = victimdata.Wallet - Amount;
    robberdata.save();
    victimdata.save();
    return "DONE";
  }

  async pay({ payerid, recieverid, Amount }) {
    const robberdata = await profile.findOne({ UserID: recieverid });
    const victimdata = await profile.findOne({ UserID: payerid });
    if (!victimdata) return "UNREGISTERED_PAYER";
    if (!robberdata) return "UNREGISTERED_RECIEVER";
    if (victimdata.Wallet == 0 || victimdata.Wallet < Amount)
      return "PAYER_IS_BROKE";
    robberdata.Wallet = robberdata.Wallet + Amount;
    victimdata.Wallet = victimdata.Wallet - Amount;

    robberdata.save();
    victimdata.save();
    return "DONE";
  }

  async daily({ UserID, Amount }) {
    const data = await profile.findOne({ UserID })
    if (!data) return "UNREGISTERED_USER";
    let timeout = 86400000
    let reward = Amount
    if(timeout -(Date.now()-data.LastWeekly)>0) return { result:"TIMEOUT", time:ms(timeout-(Data.now()-data.LastWeekly)) };
    data.Wallet +=reward
    data.LastWeekly = Date.now()
    data.save()
    return { result:"DONE" };
  }

  async weekly({ UserID, Amount }) {
    const data = await profile.findOne({ UserID })
    if (!data) return "UNREGISTERED_USER";
    let timeout = 604800000
    let reward = Amount
    if(timeout -(Date.now()-data.LastWeekly)>0) return { result:"TIMEOUT", time:ms(timeout-(Data.now()-data.LastWeekly)) };
    data.Wallet +=reward
    data.LastWeekly = Date.now()
    data.save()
    return { result:"DONE" };
  }

  async monthly({ UserID, Amount }) {
    const data = await profile.findOne({ UserID })
    if (!data) return "UNREGISTERED_USER";
    let timeout = 2629800000
    let reward = Amount
    if(timeout -(Date.now()-data.LastMonthly)>0) return { result:"TIMEOUT", time:ms(timeout-(Data.now()-data.LastMonthly)) };
    data.Wallet +=reward
    data.LastMonthly = Date.now()
    data.save()
    return { result:"DONE" };
  }

  async yearly({ UserID, Amount }) {
    const data = await profile.findOne({ UserID })
    if (!data) return "UNREGISTERED_USER";
    let timeout = 31556952000
    let reward = Amount
    if(timeout -(Date.now()-data.LastYearly)>0) return { result:"TIMEOUT", time:ms(timeout-(Data.now()-data.LastYearly)) };
    data.Wallet +=reward
    data.LastYearly = Date.now()
    data.save()
    return { result:"DONE" };
  }
  /* Job System */

  async job({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return { job:data.Job, salary:data.Salary };
  }

  async assignJob({ UserID, Job, Salary, Cooldown, MinWorkPerDay }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    data.Job = Job || data.Job;
    data.Salary = Salary || data.Salary;
    data.WorkCooldown = Cooldown;
    data.MinWorks = MinWorkPerDay;
    data.FirstWork = Date.now();
    data.save();
    return "DONE";
  }
  
  async work({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if(data.Job === "Unemployed") return "NO_JOB";
    if(data.MinWorks > data.TimesWorked && data.FirstWork > new Date().setHours(23,59,59,999)) {
      data.Job = "Unemployed";
      data.Salary = 0;
      data.save();
      return "RESIGNED"
    } else {
      if(data.WorkCooldown -(Date.now()-data.LastWorked)>0) return { result:"TIMEOUT", time:ms(timeout-(Data.now()-data.LastWorked)) };
      data.Wallet += data.Salary
      data.TimesWorked += 1
      data.LastWorked = Date.now()
      data.save();
    }
  }

  async resignJob({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if(data.Job === "Unemployed") return "NO_JOB";
    data.Job = Unemployed
    data.Salary = data.Salary;
    data.save();
    return "DONE";
  }

  /**/

  /* Shop System */
  
  /**/

  async profile({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return { wallet:data.Wallet, bank:data.Bank, bankSpace:data.BankSpace, id:data.UserID, created:data.CreatedAt, specialCoin:data.SpecialCoin, job:data.Job, salary:data.Salary, lastDaily:data.LastDaily, lastWeekly:data.LastWeekly, lastMonthly:data.LastMonthly, lastYearly:data.LastYearly }
  }

  async progressBar({ value, maxValue, size }) {
  
    let barArray = [];
    let bar = {
      fillStart: 'https://cdn.discordapp.com/emojis/937428162797797418.gif',
      fillBar: 'https://cdn.discordapp.com/emojis/937428161950519366.gif',
      fillEnd: 'https://cdn.discordapp.com/emojis/937428160889376828.gif',
      emptyStart: 'https://cdn.discordapp.com/emojis/937428162369970196.webp',
      emptyBar: 'https://cdn.discordapp.com/emojis/937428160109224006.webp',
      emptyEnd: 'https://cdn.discordapp.com/emojis/937428160188928081.webp'
    }
  
    let fill = Math.round(size * (value / maxValue > 1 ? 1 : value / maxValue));
    let empty = size - fill > 0 ? size - fill : 0;
  
    for (let i = 1; i <= fill; i++) barArray.push(bar.fillBar);
    for (let i = 1; i <= empty; i++) barArray.push(bar.emptyBar);
  
    barArray[0] = barArray[0] == bar.fillBar ? bar.fillStart : bar.emptyStart;
    barArray[barArray.length -1] = barArray[barArray.length -1] == bar.fillBar ? bar.fillEnd : bar.emptyEnd;
  
    return barArray.join(``);
  }

  async wallet({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return data.Wallet;
  }

  async bank({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return data.Bank;
  }

  // async test(id) {
  //   return id;
  // }

  async bankSpace({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return data.BankSpace;
  }

  async specialCoin({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return data.SpecialCoin;
  }
};

module.exports = TerrosEco;
