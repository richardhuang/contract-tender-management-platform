const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ApprovalWorkflow = sequelize.define('ApprovalWorkflow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entity_type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['contract', 'tender']]
    }
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  current_stage: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  total_stages: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'approval_workflows',
  timestamps: true,
  underscored: true
});

module.exports = ApprovalWorkflow;