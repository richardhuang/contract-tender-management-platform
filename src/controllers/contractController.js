const { Contract, ApprovalWorkflow, ApprovalStage, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/sequelize');

// Get all contracts
const getAllContracts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const contracts = await Contract.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'first_name', 'last_name']
      }]
    });

    res.status(200).json({
      contracts: contracts.rows,
      totalPages: Math.ceil(contracts.count / limit),
      currentPage: parseInt(page),
      total: contracts.count
    });
  } catch (error) {
    console.error('Get all contracts error:', error);
    res.status(500).json({ message: 'Server error getting contracts' });
  }
};

// Get contract by ID
const getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'first_name', 'last_name']
      }]
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    res.status(200).json({ contract });
  } catch (error) {
    console.error('Get contract by ID error:', error);
    res.status(500).json({ message: 'Server error getting contract' });
  }
};

// Create a new contract
const createContract = async (req, res) => {
  try {
    const {
      contract_number,
      title,
      type,
      parties,
      start_date,
      end_date,
      value,
      currency,
      terms,
      attachments
    } = req.body;

    // Generate contract number if not provided
    const finalContractNumber = contract_number || `CNTR-${Date.now()}`;

    const contract = await Contract.create({
      contract_number: finalContractNumber,
      title,
      type,
      parties,
      start_date,
      end_date,
      value,
      currency,
      terms,
      attachments,
      created_by: req.user.id
    });

    // Create approval workflow if needed based on contract value
    if (value && parseFloat(value) > 100000) { // Example threshold
      await createApprovalWorkflow(contract.id, 'contract', req.user.department);
    }

    res.status(201).json({
      message: 'Contract created successfully',
      contract
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ message: 'Server error creating contract' });
  }
};

// Update contract
const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      parties,
      start_date,
      end_date,
      value,
      currency,
      terms,
      attachments,
      status
    } = req.body;

    const contract = await Contract.findByPk(id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    await Contract.update(
      { title, type, parties, start_date, end_date, value, currency, terms, attachments, status },
      { where: { id } }
    );

    const updatedContract = await Contract.findByPk(id);

    res.status(200).json({
      message: 'Contract updated successfully',
      contract: updatedContract
    });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ message: 'Server error updating contract' });
  }
};

// Delete contract
const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    await Contract.destroy({ where: { id } });

    res.status(200).json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ message: 'Server error deleting contract' });
  }
};

// Get contract history
const getContractHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // This would normally return historical versions/changes of the contract
    // For now, returning placeholder data
    const history = [
      {
        id: uuidv4(),
        action: 'created',
        date: new Date(),
        user: req.user,
        changes: null
      }
    ];

    res.status(200).json({ history });
  } catch (error) {
    console.error('Get contract history error:', error);
    res.status(500).json({ message: 'Server error getting contract history' });
  }
};

// Get contract statistics
const getContractStats = async (req, res) => {
  try {
    const stats = await Contract.findAll({
      attributes: [
        'status',
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('value')), 'total_value']
      ],
      group: ['status', 'type'],
      raw: true
    });

    // Calculate additional metrics
    const totalContracts = await Contract.count();
    const activeContracts = await Contract.count({ where: { status: 'active' } });
    const pendingApproval = await Contract.count({ where: { status: 'pending_approval' } });

    res.status(200).json({
      total: totalContracts,
      active: activeContracts,
      pending_approval: pendingApproval,
      by_status: stats.filter(s => s.status).map(s => ({ status: s.status, count: s.count })),
      by_type: stats.filter(s => s.type).map(s => ({ type: s.type, count: s.count }))
    });
  } catch (error) {
    console.error('Get contract stats error:', error);
    res.status(500).json({ message: 'Server error getting contract stats' });
  }
};

// Helper function to create approval workflow
const createApprovalWorkflow = async (entityId, entityType, department) => {
  // Define approval stages based on contract value and department
  let stages = [];

  if (entityType === 'contract') {
    // Example approval workflow based on contract value
    if (parseFloat(entityValue) > 1000000) {
      // High-value contracts need multiple approvals
      stages = [
        { stage_number: 1, approver_role: 'manager' },
        { stage_number: 2, approver_role: 'finance_manager' },
        { stage_number: 3, approver_role: 'director' }
      ];
    } else if (parseFloat(entityValue) > 100000) {
      // Medium-value contracts need manager and finance approval
      stages = [
        { stage_number: 1, approver_role: 'manager' },
        { stage_number: 2, approver_role: 'finance_manager' }
      ];
    } else {
      // Low-value contracts only need manager approval
      stages = [
        { stage_number: 1, approver_role: 'manager' }
      ];
    }
  }

  // Create approval workflow
  const workflow = await ApprovalWorkflow.create({
    entity_type: entityType,
    entity_id: entityId,
    total_stages: stages.length,
    status: 'pending'
  });

  // Create approval stages
  for (const stage of stages) {
    // Find approver based on role and department
    const approver = await User.findOne({
      where: { role: stage.approver_role, department }
    });

    if (approver) {
      await ApprovalStage.create({
        workflow_id: workflow.id,
        stage_number: stage.stage_number,
        approver_id: approver.id,
        status: 'pending'
      });
    }
  }
};

module.exports = {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getContractHistory,
  getContractStats
};