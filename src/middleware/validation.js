const Joi = require('joi');

const validateContract = (req, res, next) => {
  const schema = Joi.object({
    contract_number: Joi.string().required(),
    title: Joi.string().required(),
    type: Joi.string().valid('service', 'product', 'construction', 'consulting', 'other').required(),
    status: Joi.string().valid('draft', 'pending_approval', 'approved', 'active', 'expired', 'terminated'),
    parties: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      role: Joi.string().required(),
      contact: Joi.object({
        email: Joi.string().email(),
        phone: Joi.string()
      })
    })).required(),
    start_date: Joi.date(),
    end_date: Joi.date().greater(Joi.ref('start_date')),
    value: Joi.number().positive(),
    currency: Joi.string().length(3),
    terms: Joi.string(),
    attachments: Joi.array().items(Joi.object())
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateTender = (req, res, next) => {
  const schema = Joi.object({
    tender_number: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string(),
    budget: Joi.number().positive(),
    status: Joi.string().valid('draft', 'published', 'bidding', 'closed', 'awarded', 'cancelled'),
    start_date: Joi.date(),
    end_date: Joi.date().greater(Joi.ref('start_date')),
    bid_opening_date: Joi.date()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateVendor = (req, res, next) => {
  const schema = Joi.object({
    company_name: Joi.string().required(),
    contact_person: Joi.string(),
    email: Joi.string().email().required(),
    phone: Joi.string(),
    address: Joi.string(),
    tax_id: Joi.string(),
    rating: Joi.number().min(0).max(5),
    status: Joi.string().valid('active', 'inactive', 'blacklisted'),
    certifications: Joi.array().items(Joi.object())
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateBid = (req, res, next) => {
  const schema = Joi.object({
    tender_id: Joi.string().guid({ version: ['uuidv4'] }).required(),
    vendor_id: Joi.string().guid({ version: ['uuidv4'] }).required(),
    proposal: Joi.string(),
    bid_amount: Joi.number().positive(),
    validity_days: Joi.number().integer().min(1),
    status: Joi.string().valid('submitted', 'under_review', 'shortlisted', 'rejected', 'awarded')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    role: Joi.string().valid('admin', 'manager', 'user', 'vendor'),
    department: Joi.string()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = {
  validateContract,
  validateTender,
  validateVendor,
  validateBid,
  validateUser
};