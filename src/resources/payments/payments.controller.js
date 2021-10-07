const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.createSession = async (req, res) => {
  if(!req.body.priceId){
    res.status(400).send({message: 'priceId must be provided', code: 61})
  }
  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    payment_method_types: ['card'],
    line_items: [
      {
        price: req.body.priceId,
        // For metered billing, do not pass quantity
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/checkout/?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout/?canceled=true`,
  });
  res.send({url:session.url})
}