const { DataTypes } = require('sequelize');
const sequelize = require('./src/config/sequelize');

// Define all models to ensure they're registered
require('./src/models/User');
require('./src/models/Contract');
require('./src/models/Tender');
require('./src/models/Vendor');
require('./src/models/Bid');
require('./src/models/ApprovalWorkflow');
require('./src/models/ApprovalStage');

// Sync all models with the database
const syncDatabase = async () => {
  try {
    // First, authenticate the connection
    await sequelize.authenticate();
    console.log('Database connection authenticated successfully.');

    // Sync all models
    await sequelize.sync({ alter: true }); // Use 'alter: true' to update existing tables
    console.log('Database synchronized successfully.');

    // Optionally, create default admin user
    const { User } = require('./src/models');
    const adminUser = await User.findOne({ where: { role: 'admin' } });

    if (!adminUser) {
      await User.create({
        username: 'admin',
        email: 'admin@contractplatform.com',
        password_hash: '$2a$10$njIiZSHgWJywh3mJQzTqruHkL92Yy4r0R8.p0u.PQ.s8K8.yEoYJG', // Password: admin123
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      });
      console.log('Default admin user created: admin / admin123');
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Execute the migration
syncDatabase();