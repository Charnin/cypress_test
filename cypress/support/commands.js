Cypress.Commands.add('loginByApi', (username, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/v1/login',
    body: { username, password }
  }).then((response) => {
    expect(response.status).to.eq(200);
    // ใช้ชื่อ Key ว่า 'token' ให้ตรงกับที่ app.js คาดหวัง
    window.localStorage.setItem('token', response.body.token);
  });
});

Cypress.Commands.add('addExpense', (desc, amount) => {
  // นำโค้ดที่ต้องทำซ้ำๆ มาแพ็กเก็บไว้ในนี้
  cy.get('#desc-input').clear().type(desc)
  cy.get('#amount-input').clear().type(amount)
  cy.get('#add-btn').click()
})
