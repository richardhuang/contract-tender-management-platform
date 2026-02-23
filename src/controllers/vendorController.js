const { Vendor, Bid, Tender } = require('../models');

// Get all vendors
const getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, companyName } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (companyName) whereClause.company_name = { [Op.iLike]: `%${companyName}%` };

    const vendors = await Vendor.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      vendors: vendors.rows,
      totalPages: Math.ceil(vendors.count / limit),
      currentPage: parseInt(page),
      total: vendors.count
    });
  } catch (error) {
    console.error('Get all vendors error:', error);
    res.status(500).json({ message: 'Server error getting vendors' });
  }
};

// Get vendor by ID
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByPk(id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({ vendor });
  } catch (error) {
    console.error('Get vendor by ID error:', error);
    res.status(500).json({ message: 'Server error getting vendor' });
  }
};

// Create a new vendor
const createVendor = async (req, res) => {
  try {
    const {
      company_name,
      contact_person,
      email,
      phone,
      address,
      tax_id,
      certifications
    } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({
      where: { email }
    });

    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor with this email already exists' });
    }

    const vendor = await Vendor.create({
      company_name,
      contact_person,
      email,
      phone,
      address,
      tax_id,
      certifications
    });

    res.status(201).json({
      message: 'Vendor created successfully',
      vendor
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: 'Server error creating vendor' });
  }
};

// Update vendor
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      contact_person,
      email,
      phone,
      address,
      tax_id,
      certifications,
      status
    } = req.body;

    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await Vendor.update(
      { company_name, contact_person, email, phone, address, tax_id, certifications, status },
      { where: { id } }
    );

    const updatedVendor = await Vendor.findByPk(id);

    res.status(200).json({
      message: 'Vendor updated successfully',
      vendor: updatedVendor
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: 'Server error updating vendor' });
  }
};

// Delete vendor
const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if vendor has any bids
    const bidCount = await Bid.count({ where: { vendor_id: id } });
    if (bidCount > 0) {
      return res.status(400).json({ message: 'Cannot delete vendor with associated bids' });
    }

    await Vendor.destroy({ where: { id } });

    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ message: 'Server error deleting vendor' });
  }
};

// Get vendor performance
const getVendorPerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get vendor's bid statistics
    const bidStats = await Bid.findAndCountAll({
      where: { vendor_id: id },
      include: [{
        model: Tender,
        as: 'tender'
      }]
    });

    // Calculate performance metrics
    const awardedBids = bidStats.rows.filter(bid => bid.status === 'awarded').length;
    const winRate = bidStats.count > 0 ? (awardedBids / bidStats.count) * 100 : 0;

    const performance = {
      vendor_id: id,
      total_bids: bidStats.count,
      awarded_bids: awardedBids,
      win_rate: winRate.toFixed(2) + '%',
      avg_bid_amount: bidStats.rows.reduce((sum, bid) => sum + parseFloat(bid.bid_amount || 0), 0) / (bidStats.count || 1),
      recent_bids: bidStats.rows.slice(0, 5) // Last 5 bids
    };

    res.status(200).json({ performance });
  } catch (error) {
    console.error('Get vendor performance error:', error);
    res.status(500).json({ message: 'Server error getting vendor performance' });
  }
};

module.exports = {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorPerformance
};