const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    supportFile: 'cypress/support/e2e.js',
    reporter: 'cypress-mochawesome-reporter',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      on('task', {
        clearUser(username) {
          console.log(`[Node.js] กำลังเคลียร์ข้อมูลผู้ใช้: ${username} ออกจาก Database...`);
          return { success: true, deletedUser: username }; 
        },
      })
    },
  },
});