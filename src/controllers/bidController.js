const { Bid, Tender, Vendor } = require('../models');

// Get all bids
const getAllBids = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, tenderId, vendorId } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (tenderId) whereClause.tender_id = tenderId;
    if (vendorId) whereClause.vendor_id = vendorId;

    const bids = await Bid.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Tender,
          as: 'tender'
        },
        {
          model: Vendor,
          as: 'vendor'
        }
      ]
    });

    res.status(200).json({
      bids: bids.rows,
      totalPages: Math.ceil(bids.count / limit),
      currentPage: parseInt(page),
      total: bids.count
    });
  } catch (error) {
    console.error('Get all bids error:', error);
    res.status(500).json({ message: 'Server error getting bids' });
  }
};

// Get bid by ID
const getBidById = async (req, res) => {
  try {
    const { id } = req.params;

    const bid = await Bid.findByPk(id, {
      include: [
        {
          model: Tender,
          as: 'tender'
        },
        {
          model: Vendor,
          as: 'vendor'
        }
      ]
    });

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    res.status(200).json({ bid });
  } catch (error) {
    console.error('Get bid by ID error:', error);
    res.status(500).json({ message: 'Server error getting bid' });
  }
};

// Create a new bid
const createBid = async (req, res) => {
  try {
    const {
      tender_id,
      vendor_id,
      proposal,
      bid_amount,
      validity_days
    } = req.body;

    // Check if tender exists and is in bidding status
    const tender = await Tender.findByPk(tender_id);
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    if (tender.status !== 'bidding') {
      return res.status(400).json({ message: 'Bidding is not open for this tender' });
    }

    // Check if vendor exists
    const vendor = await Vendor.findByPk(vendor_id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if vendor is active
    if (vendor.status !== 'active') {
      return res.status(400).json({ message: 'Vendor is not active' });
    }

    // Check if vendor has already submitted a bid for this tender
    const existingBid = await Bid.findOne({
      where: { tender_id, vendor_id }
    });

    if (existingBid) {
      return res.status(400).json({ message: 'Vendor has already submitted a bid for this tender' });
    }

    const bid = await Bid.create({
      tender_id,
      vendor_id,
      proposal,
      bid_amount,
      validity_days,
      submitted_at: new Date()
    });

    res.status(201).json({
      message: 'Bid submitted successfully',
      bid
    });
  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({ message: 'Server error creating bid' });
  }
};

// Update bid
const updateBid = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      proposal,
      bid_amount,
      validity_days,
      status
    } = req.body;

    const bid = await Bid.findByPk(id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if bid can be updated (only if still in submitted state)
    if (bid.status !== 'submitted') {
      return res.status(400).json({ message: 'Cannot update bid that has been processed' });
    }

    await Bid.update(
      { proposal, bid_amount, validity_days, status },
      { where: { id } }
    );

    const updatedBid = await Bid.findByPk(id);

    res.status(200).json({
      message: 'Bid updated successfully',
      bid: updatedBid
    });
  } catch (error) {
    console.error('Update bid error:', error);
    res.status(500).json({ message: 'Server error updating bid' });
  }
};

// Delete bid
const deleteBid = async (req, res) => {
  try {
    const { id } = req.params;

    const bid = await Bid.findByPk(id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if user is the bid creator or admin
    if (req.user.id !== bid.vendor_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this bid' });
    }

    // Cannot delete if bid has been processed
    if (bid.status !== 'submitted') {
      return res.status(400).json({ message: 'Cannot delete bid that has been processed' });
    }

    await Bid.destroy({ where: { id } });

    res.status(200).json({ message: 'Bid deleted successfully' });
  } catch (error) {
    console.error('Delete bid error:', error);
    res.status(500).json({ message: 'Server error deleting bid' });
  }
};

// Submit bid
const submitBid = async (req, res) => {
  try {
    const { id } = req.params;

    const bid = await Bid.findByPk(id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if bid belongs to the requesting user
    if (req.user.id !== bid.vendor_id) {
      return res.status(403).json({ message: 'Unauthorized to submit this bid' });
    }

    // Check if tender is still accepting bids
    const tender = await Tender.findByPk(bid.tender_id);
    if (tender.status !== 'bidding') {
      return res.status(400).json({ message: 'Bidding is not open for this tender' });
    }

    // Check if bid deadline has passed
    if (tender.end_date && new Date() > new Date(tender.end_date)) {
      return res.status(400).json({ message: 'Bid submission deadline has passed' });
    }

    await Bid.update(
      {
        status: 'submitted',
        submitted_at: new Date()
      },
      { where: { id } }
    );

    const updatedBid = await Bid.findByPk(id);

    res.status(200).json({
      message: 'Bid submitted successfully',
      bid: updatedBid
    });
  } catch (error) {
    console.error('Submit bid error:', error);
    res.status(500).json({ message: 'Server error submitting bid' });
  }
};

// Review bid
const reviewBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const validStatuses = ['under_review', 'shortlisted', 'rejected', 'awarded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status for bid review' });
    }

    const bid = await Bid.findByPk(id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Update bid status
    await Bid.update(
      {
        status: status,
        reviewed_at: new Date()
      },
      { where: { id } }
    );

    const updatedBid = await Bid.findByPk(id);

    res.status(200).json({
      message: 'Bid reviewed successfully',
      bid: updatedBid
    });
  } catch (error) {
    console.error('Review bid error:', error);
    res.status(500).json({ message: 'Server error reviewing bid' });
  }
};

module.exports = {
  getAllBids,
  getBidById,
  createBid,
  updateBid,
  deleteBid,
  submitBid,
  reviewBid
};