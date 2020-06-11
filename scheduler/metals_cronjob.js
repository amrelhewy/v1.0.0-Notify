const Job = require("cron").CronJob;
const MetalTrack = require("../model/MetalTrack");
const metal = require("../websites/PreciousMetals.js");
async function MetalPriceTrack(newMetalTrack, info, reqPrice) {
  return new Job(
    "*/2 * * * *",
    async function () {
      const dis = this;

      //starting a new cron job (scheduled task)... something to keep track of the products price
      const pro = await MetalTrack.findOne({
        user_id: newMetalTrack.user_id,
        metal_type: newMetalTrack.metal_type,
        weight: newMetalTrack.weight,
        currency: newMetalTrack.currency,
      });
      if (pro) {
        //getting old price from db.
        //scrape the link again to find the current price..
        metal(pro.currency,pro.weight,pro.metal_type)
          .then((values) => {
            giveresults(values).then(() =>
              console.log(`Checked MetalPrice for today for user ${pro.user_id}`)
            );
          })
          .catch(() => {});
        function giveresults(res) {
          console.log(`Checking metal price for ${info.userEmail}`);
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
                  subject: `The ${pro.metal_type} price you were tracking in ${pro.currency} has dropped!`, // Subject line
                  html: `<h2>This Price has dropped to ${currentPrice} ${pro.currency} for 1 ${pro.weight}!! </h2><br>
                    `, // html body
                })
                .then(() => {
                  console.log(`metals email sent to ${info.userEmail}`);
                  dis.stop();
                  MetalTrack.deleteOne({
                    user_id: _id,
                    metal_type: newMetalTrack.name,
                    weight: newMetalTrack.weight,
                    currency: newMetalTrack.currency,
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
      } else {
        dis.stop();
        console.log(
          `stopped cronjob automatically on ${info.userEmail} for metal ${info.name} in ${info.currency}`
        );
      }
    },
    null,
    true
  );
}
module.exports = MetalPriceTrack;
