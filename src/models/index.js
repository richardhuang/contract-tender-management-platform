const User = require('./User');
const Contract = require('./Contract');
const Tender = require('./Tender');
const Vendor = require('./Vendor');
const Bid = require('./Bid');
const ApprovalWorkflow = require('./ApprovalWorkflow');
const ApprovalStage = require('./ApprovalStage');

// Define associations
User.hasMany(Contract, { foreignKey: 'created_by', as: 'created_contracts' });
Contract.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Tender, { foreignKey: 'created_by', as: 'created_tenders' });
Tender.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Tender.hasMany(Bid, { foreignKey: 'tender_id' });
Bid.belongsTo(Tender, { foreignKey: 'tender_id' });

Vendor.hasMany(Bid, { foreignKey: 'vendor_id' });
Bid.belongsTo(Vendor, { foreignKey: 'vendor_id' });

ApprovalWorkflow.hasMany(ApprovalStage, { foreignKey: 'workflow_id' });
ApprovalStage.belongsTo(ApprovalWorkflow, { foreignKey: 'workflow_id' });

User.hasMany(ApprovalStage, { foreignKey: 'approver_id' });
ApprovalStage.belongsTo(User, { foreignKey: 'approver_id' });

module.exports = {
  User,
  Contract,
  Tender,
  Vendor,
  Bid,
  ApprovalWorkflow,
  ApprovalStage
};