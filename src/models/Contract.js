const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Contract = sequelize.define('Contract', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  contract_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending_approval', 'approved', 'active', 'expired', 'terminated'),
    defaultValue: 'draft'
  },
  parties: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY
  },
  end_date: {
    type: DataTypes.DATEONLY
  },
  value: {
    type: DataTypes.DECIMAL(15, 2)
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  terms: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSONB
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'contracts',
  timestamps: true,
  underscored: true
});

module.exports = Contract;