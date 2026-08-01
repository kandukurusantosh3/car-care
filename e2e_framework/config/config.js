require('dotenv').config({ path: __dirname + '/.env' });

module.exports = {
  baseUrl: process.env.BASE_URL || 'https://kandukurusantosh3.github.io/car-care/',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true' || false,
  implicitWait: parseInt(process.env.IMPLICIT_WAIT) || 10000,
  explicitWait: parseInt(process.env.EXPLICIT_WAIT) || 15000,
  
  // List of routes to dynamically scan for forms and validations
  routesToScan: [
    '/',
    '/auth',
    '/explore',
    '/tracking'
  ],
  
  // Default test credentials
  credentials: {
    customer: {
      phone: process.env.CUSTOMER_PHONE || '9876543210',
      password: process.env.CUSTOMER_PWD || 'password123'
    },
    mechanic: {
      phone: process.env.MECHANIC_PHONE || '1122334455',
      password: process.env.MECHANIC_PWD || 'mechanic123'
    }
  }
};
