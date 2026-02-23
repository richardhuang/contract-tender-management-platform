const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Bid = sequelize.define('Bid', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tenders',
      key: 'id'
    }
  },
  vendor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'vendors',
      key: 'id'
    }
  },
  proposal: {
    type: DataTypes.TEXT
  },
  bid_amount: {
    type: DataTypes.DECIMAL(15, 2)
  },
  validity_days: {
    type: DataTypes.INTEGER
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'shortlisted', 'rejected', 'awarded'),
    defaultValue: 'submitted'
  },
  submitted_at: {
    type: DataTypes.DATE
  },
  reviewed_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'bids',
  timestamps: true,
  underscored: true
});

module.exports = Bid;