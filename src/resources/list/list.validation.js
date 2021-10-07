const Joi = require('joi');

exports.createOne = Joi.object({
  name: Joi.string()
    .max(40)
    .required(),
  ref: Joi.string()
    .max(30)
    .required(),
  showPix: Joi.boolean(),
  showAddress: Joi.boolean(),
  private: Joi.boolean()
}).options({
  abortEarly: true,
  stripUnknown: true,
})

exports.deleteList = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .max(4294967295)
    .required()
}).options({
  abortEarly: true,
  stripUnknown: true,
})
