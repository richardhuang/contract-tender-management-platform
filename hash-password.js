const bcrypt = require('bcryptjs');

// Hash the default password for the admin user
const hashPassword = async () => {
  try {
    const password = 'admin123';
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`Hashed password for "${password}": ${hashedPassword}`);
  } catch (error) {
    console.error('Error hashing password:', error);
  }
};

hashPassword();