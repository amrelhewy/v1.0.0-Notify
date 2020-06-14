const express = require("express");
const router = express.Router();
const User = require("../model/User");
const CurrencyTrack = require("../model/CurrencyTrack");
const MetalTrack = require("../model/MetalTrack");
const ProductTrack = require("../model/ProductTrack");
const Feedback=require('../model/feedback')
router.get("/users", async (req, res) => {
  const users = await User.countDocuments();
  res.status(202).send(users.toString());

});

router.get("/items", async (req, res) => {
  let currencycount = await CurrencyTrack.countDocuments();
  let metalcount = await MetalTrack.countDocuments();
  let productcount = await ProductTrack.countDocuments();
  let total = currencycount + metalcount + productcount;
  res.status(202).send(total.toString());
});

router.get('/feedback',async(req,res)=>{
// let feedbacks=await Feedback.find();
// res.status(200).send(feedbacks);

});

module.exports = router;
