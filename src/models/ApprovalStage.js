const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ApprovalStage = sequelize.define('ApprovalStage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workflow_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'approval_workflows',
      key: 'id'
    }
  },
  stage_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  approver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'skipped'),
    defaultValue: 'pending'
  },
  approved_at: {
    type: DataTypes.DATE
  },
  comments: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'approval_stages',
  timestamps: true,
  underscored: true
});

module.exports = ApprovalStage;