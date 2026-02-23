const { Tender, Bid, Vendor } = require('../models');
const { Op } = require('sequelize');

// Get all tenders
const getAllTenders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (startDate) whereClause.start_date = { [Op.gte]: startDate };
    if (endDate) whereClause.end_date = { [Op.lte]: endDate };

    const tenders = await Tender.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      tenders: tenders.rows,
      totalPages: Math.ceil(tenders.count / limit),
      currentPage: parseInt(page),
      total: tenders.count
    });
  } catch (error) {
    console.error('Get all tenders error:', error);
    res.status(500).json({ message: 'Server error getting tenders' });
  }
};

// Get tender by ID
const getTenderById = async (req, res) => {
  try {
    const { id } = req.params;

    const tender = await Tender.findByPk(id, {
      include: [{
        model: Bid,
        as: 'bids',
        include: [{
          model: Vendor,
          as: 'vendor'
        }]
      }]
    });

    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    res.status(200).json({ tender });
  } catch (error) {
    console.error('Get tender by ID error:', error);
    res.status(500).json({ message: 'Server error getting tender' });
  }
};

// Create a new tender
const createTender = async (req, res) => {
  try {
    const {
      tender_number,
      title,
      description,
      budget,
      start_date,
      end_date,
      bid_opening_date
    } = req.body;

    // Generate tender number if not provided
    const finalTenderNumber = tender_number || `TND-${Date.now()}`;

    const tender = await Tender.create({
      tender_number: finalTenderNumber,
      title,
      description,
      budget,
      start_date,
      end_date,
      bid_opening_date,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Tender created successfully',
      tender
    });
  } catch (error) {
    console.error('Create tender error:', error);
    res.status(500).json({ message: 'Server error creating tender' });
  }
};

// Update tender
const updateTender = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      budget,
      start_date,
      end_date,
      bid_opening_date,
      status
    } = req.body;

    const tender = await Tender.findByPk(id);
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    // Prevent updates to certain fields after tender is published
    if (tender.status === 'published' && (start_date || end_date)) {
      return res.status(400).json({ message: 'Cannot change dates after tender is published' });
    }

    await Tender.update(
      { title, description, budget, start_date, end_date, bid_opening_date, status },
      { where: { id } }
    );

    const updatedTender = await Tender.findByPk(id);

    res.status(200).json({
      message: 'Tender updated successfully',
      tender: updatedTender
    });
  } catch (error) {
    console.error('Update tender error:', error);
    res.status(500).json({ message: 'Server error updating tender' });
  }
};

// Delete tender
const deleteTender = async (req, res) => {
  try {
    const { id } = req.params;

    const tender = await Tender.findByPk(id);
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    // Check if tender has any bids
    const bidCount = await Bid.count({ where: { tender_id: id } });
    if (bidCount > 0) {
      return res.status(400).json({ message: 'Cannot delete tender with associated bids' });
    }

    await Tender.destroy({ where: { id } });

    res.status(200).json({ message: 'Tender deleted successfully' });
  } catch (error) {
    console.error('Delete tender error:', error);
    res.status(500).json({ message: 'Server error deleting tender' });
  }
};

// Publish tender
const publishTender = async (req, res) => {
  try {
    const { id } = req.params;

    const tender = await Tender.findByPk(id);
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    if (tender.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft tenders can be published' });
    }

    await Tender.update(
      { status: 'published' },
      { where: { id } }
    );

    const updatedTender = await Tender.findByPk(id);

    res.status(200).json({
      message: 'Tender published successfully',
      tender: updatedTender
    });
  } catch (error) {
    console.error('Publish tender error:', error);
    res.status(500).json({ message: 'Server error publishing tender' });
  }
};

// Close tender
const closeTender = async (req, res) => {
  try {
    const { id } = req.params;

    const tender = await Tender.findByPk(id);
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    if (tender.status !== 'bidding') {
      return res.status(400).json({ message: 'Only bidding tenders can be closed' });
    }

    await Tender.update(
      { status: 'closed' },
      { where: { id } }
    );

    const updatedTender = await Tender.findByPk(id);

    res.status(200).json({
      message: 'Tender closed successfully',
      tender: updatedTender
    });
  } catch (error) {
    console.error('Close tender error:', error);
    res.status(500).json({ message: 'Server error closing tender' });
  }
};

module.exports = {
  getAllTenders,
  getTenderById,
  createTender,
  updateTender,
  deleteTender,
  publishTender,
  closeTender
};