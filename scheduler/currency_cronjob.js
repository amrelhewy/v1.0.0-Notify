const Job = require("cron").CronJob;
const CurrencyTrack=require('../model/CurrencyTrack');
const Currency =require('../websites/Currency')
async function CurrencyPriceTrack(newCurrencyTrack, info, reqPrice) {
    return new Job(
      "*/2 * * * *",
      async function () {
        const dis = this;
  
        //starting a new cron job (scheduled task)... something to keep track of the products price
        const pro= await CurrencyTrack.findOne({
          user_id: newCurrencyTrack.user_id,
          from_currency:newCurrencyTrack.from_currency,
          to_currency:newCurrencyTrack.to_currency
        });
        if (pro) {
          //getting old price from db.
          //scrape the link again to find the current price..
          Currency(pro.from_currency,pro.to_currency).then((values)=>{giveresults(values).then(()=>console.log(`Checked currency for today for user ${pro.user_id}`))}).catch(()=>{});
          function giveresults(res) {
            console.log(`Checking currency for ${info.userEmail}`);
            return new Promise((resolve, reject) => {
              let currentPrice = res.price;
              let requiredPrice;
              reqPrice
                ? (requiredPrice = reqPrice)
                : (requiredPrice = pro.current_price);
              if (currentPrice < requiredPrice) {
                let email = transporter
                  .sendMail({
                    from: "notifyapp96@gmail.com", // sender address
                    to: info.userEmail, // list of receivers
                    subject: `The Currency rate from ${info.from_currency} to ${info.to_currency} has dropped!`, // Subject line
                    html: `<h2>This Rate has dropped to ${currentPrice} ${info.from_currency} for 1 ${info.to_currency}!! </h2><br>
                    `, // html body
                  })
                  .then(() => {
                    console.log(`currency email sent to ${info.userEmail}`);
                    dis.stop();
                    CurrencyTrack.deleteOne({
                      user_id: _id,
                      from_currency:info.from_currency,
                      to_currency:info.to_currency
                    }).then(() => {
                      resolve("done");
                    });
                  })
                  .catch(() => {
                    reject(new Error("failed to send email"));
                  });
              } else {
                resolve("no price drop");
              }
            });
          }
        }
        else
        {
          dis.stop();
          console.log(`stopped cronjob automatically on ${info.userEmail} for currency ${info.from_currency} to ${info.to_currency}`)
        }
      },
      null,
      true
    );
  }
module.exports=CurrencyPriceTrack;