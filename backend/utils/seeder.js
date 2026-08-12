const User = require('../models/User');
const Client = require('../models/Client');
const Employee = require('../models/Employee');

const demoUsers = [
  {
    name: 'Master Super Admin',
    email: 'superadmin@demo.com',
    password: 'Password123!',
    role: 'Super Admin',
    phone: '+1 555-0099',
  },
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'Password123!',
    role: 'Admin',
    phone: '+1 555-0100',
  },
  {
    name: 'Interior Designer',
    email: 'designer@demo.com',
    password: 'Password123!',
    role: 'Interior Designer',
    phone: '+1 555-0102',
  },
  {
    name: 'Project Manager',
    email: 'pm@demo.com',
    password: 'Password123!',
    role: 'Project Manager',
    phone: '+1 555-0103',
  },
  {
    name: 'Sales Executive',
    email: 'sales@demo.com',
    password: 'Password123!',
    role: 'Sales Executive',
    phone: '+1 555-0104',
  },
  {
    name: 'Site Engineer',
    email: 'engineer@demo.com',
    password: 'Password123!',
    role: 'Site Engineer',
    phone: '+1 555-0105',
  },
  {
    name: 'Accountant',
    email: 'accountant@demo.com',
    password: 'Password123!',
    role: 'Accountant',
    phone: '+1 555-0106',
  },
  {
    name: 'Client User',
    email: 'client@demo.com',
    password: 'Password123!',
    role: 'Client',
    phone: '+1 555-0107',
  },
];

const seedData = async () => {
  try {
    // Seed demo accounts
    for (const demoUser of demoUsers) {
      const exists = await User.findOne({ email: { $regex: `^${demoUser.email}$`, $options: 'i' } });
      if (!exists) {
        await User.create(demoUser);
        console.log(`Seeded demo user: ${demoUser.email} (${demoUser.role})`);
      }
    }

    // Auto sync existing clients into User collection so all clients can log in
    const clients = await Client.find({});
    for (const client of clients) {
      if (client.email) {
        const userExists = await User.findOne({ email: { $regex: `^${client.email}$`, $options: 'i' } });
        if (!userExists) {
          await User.create({
            name: client.fullName,
            email: client.email.toLowerCase(),
            password: 'client123',
            role: 'Client',
            phone: client.phone || '',
          });
          console.log(`Auto-created User login for existing client: ${client.email}`);
        }
      }
    }

    // Auto sync existing employees into User collection so all employees/designers can log in
    const employees = await Employee.find({});
    for (const emp of employees) {
      if (emp.email) {
        const userExists = await User.findOne({ email: { $regex: `^${emp.email}$`, $options: 'i' } });
        let targetRole = 'Interior Designer';
        if (['INTERIOR_DESIGNER', 'Interior Designer', 'Designer'].includes(emp.role)) {
          targetRole = 'Interior Designer';
        } else if (['ADMIN', 'Admin', 'Super Admin'].includes(emp.role)) {
          targetRole = 'Admin';
        } else if (['SITE_ENGINEER', 'Site Engineer'].includes(emp.role)) {
          targetRole = 'Site Engineer';
        } else if (['PROJECT_MANAGER', 'Project Manager'].includes(emp.role)) {
          targetRole = 'Project Manager';
        }

        if (!userExists) {
          await User.create({
            name: emp.fullName || emp.name,
            email: emp.email.toLowerCase(),
            password: emp.password || 'Password123!',
            role: targetRole,
            phone: emp.phone || '',
          });
          console.log(`Auto-created User login for employee: ${emp.email} (${targetRole})`);
        }
      }
    }
  } catch (error) {
    console.error('Error seeding demo users / syncing employees:', error.message);
  }
};

module.exports = seedData;

