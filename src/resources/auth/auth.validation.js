const Joi = require('joi');

//Signup data model
exports.signup = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .max(45)
    .required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,100}$/)
    .required(),
  name: Joi.string()
    .max(50)
    .required()
}).options({
  abortEarly: true,
  stripUnknown: true,
})

//Signin data model
exports.signin = Joi.object({
  email: Joi.string()
    .email()
    .max(45)
    .lowercase()
    .required(),
  password: Joi.string()
    .max(100)
    .required(),
}).options({
  abortEarly: true,
  stripUnknown: true
})