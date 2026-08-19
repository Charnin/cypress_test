// 🌟 1. อย่าลืม Import Faker มาไว้บนสุดของไฟล์
import { fakerTH as faker } from '@faker-js/faker'

// =======================================================
// ส่วนที่ 1: ทดสอบหน้า Login UI (เหมือนเดิมเป๊ะ)
// =======================================================
describe('ทดสอบระบบ Login และ การออกจากระบบ', () => {

  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/v1/reset')
    cy.clearLocalStorage()
    cy.visit('http://localhost:3000')
  })

  it('ควรแสดง Error เมื่อใส่รหัสผ่านผิด', () => {
    cy.get('#username').type('Charnin')
    cy.get('#password').type('wrong-password')
    cy.get('#login-btn').click()

    cy.get('#login-error').should('be.visible').and('contain', 'Username หรือ Password ไม่ถูกต้อง')
  })

  it('ควร Login สำเร็จ และเห็นหน้าจัดการบัญชี', () => {
    cy.intercept('GET', '/api/v1/expenses').as('getExpenses')

    cy.get('#username').type('Charnin')
    cy.get('#password').type('pass1234')
    cy.get('#login-btn').click()

    cy.get('#login-section').should('not.be.visible')
    cy.get('#expense-section').should('be.visible')

    cy.wait('@getExpenses')
    cy.get('#total-amount').should('not.have.text', '0')
  })

  it('ควร Logout กลับมาหน้าแรกได้', () => {
    cy.get('#username').type('Charnin')
    cy.get('#password').type('pass1234')
    cy.get('#login-btn').click()

    cy.get('#expense-section').should('be.visible')
    cy.get('#logout-btn').click()

    cy.get('#expense-section').should('not.be.visible')
    cy.get('#login-section').should('be.visible')
  })
})

// =======================================================
// ส่วนที่ 2: ทดสอบหน้าบัญชี (ผสานพลัง Faker + API Login!)
// =======================================================
describe('ทดสอบการจัดการบัญชี (หลังจาก Login แล้ว)', () => {

  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/v1/reset')
    cy.intercept('GET', '/api/v1/expenses').as('getExpenses')

    cy.clearLocalStorage()
    cy.loginByApi('Charnin', 'pass1234')

    cy.visit('http://localhost:3000')
    cy.wait('@getExpenses')
  })

  // 🌟 อัปเกรด Test Case นี้ด้วย Faker.js
  it('ควรเพิ่มรายการด้วยข้อมูลสุ่ม (Dynamic Data) ได้ถูกต้อง', () => {
    cy.get('#total-amount').should('not.have.text', '0').then(($total) => {
      const initialTotal = parseFloat($total.text())

      // 1. ให้ Faker สุ่มข้อมูลรายรับและรายจ่าย
      const randomIncomeDesc = `รับเงินจาก ${faker.company.name()}`
      const randomIncomeAmount = faker.number.int({ min: 1000, max: 5000 })

      const randomExpenseDesc = `ซื้อ ${faker.commerce.productName()}`
      // สุ่มรายจ่ายติดลบ (ตั้งค่า max แค่ -100 เพื่อกันไม่ให้มันสุ่มติดลบเยอะจนยอดเงินไม่พอจ่าย)
      const randomExpenseAmount = faker.number.int({ min: -5000, max: -100 })

      // 2. โยนข้อมูลสุ่มเข้า Custom Command
      cy.addExpense(randomIncomeDesc, randomIncomeAmount)
      cy.addExpense(randomExpenseDesc, randomExpenseAmount)

      // 3. ตรวจสอบยอดรวมที่คำนวณจากตัวเลขที่สุ่มได้
      const expectedTotal = initialTotal + randomIncomeAmount + randomExpenseAmount
      cy.get('#total-amount').should('have.text', String(expectedTotal))

      // 4. เช็คว่าชื่อรายการที่โชว์ตรงกับที่ Faker สุ่มมาไหม
      cy.get('#expense-list li').last().should('contain', randomExpenseDesc)
    })
  })

  it('ควรบล็อกการทำรายการและโชว์ Error เมื่อใช้เงินเกินยอดคงเหลือ', () => {
    cy.get('#total-amount').should('not.have.text', '0').then(($total) => {
      const initialTotal = parseFloat($total.text())
      const overspendAmount = -20000

      cy.addExpense('ซื้อคอมพิวเตอร์ตัวท็อป', overspendAmount)

      cy.get('#error-msg').should('be.visible').and('contain', 'ยอดเงินคงเหลือไม่เพียงพอ')
      cy.get('#total-amount').should('have.text', String(initialTotal))
      cy.get('#expense-list li').last().should('not.contain', 'ซื้อคอมพิวเตอร์ตัวท็อป')
    })
  })

  it('ควรทำรายการต่อเนื่องหลายรายการ และนับจำนวนประวัติได้ถูกต้อง', () => {

    cy.get('#total-amount').should('not.have.text', '0').then(($total) => {
      const initialTotal = parseFloat($total.text())

      // 1. จำลองสถานการณ์การใช้จ่ายแบบต่อเนื่อง
      cy.addExpense('ขายไอเทมใน PUBG', 1500)
      cy.addExpense('ซื้ออาหารเปียกให้แมวสามสี', -350)
      cy.addExpense('พรีออเดอร์คีย์บอร์ด Keychron', -4500)

      // 2. คำนวณยอดสุทธิ (ยอดตั้งต้น + รายรับ - รายจ่าย)
      const expectedTotal = initialTotal + 1500 - 350 - 4500
      cy.get('#total-amount').should('have.text', String(expectedTotal))

      // 3. ตรวจสอบจำนวนรายการในหน้าเว็บ
      // (ของเดิมตั้งต้นมี 'เงินเดือน' 1 รายการ + เพิ่งเพิ่มไป 3 = ต้องมี 4 รายการ)
      cy.get('#expense-list li').should('have.length', 4)

      // 4. ตรวจสอบว่ารายการถูกเรียงลำดับถูกต้อง (อันล่าสุดต้องอยู่ล่างสุด)
      cy.get('#expense-list li').last().should('contain', 'พรีออเดอร์คีย์บอร์ด Keychron')
      cy.get('#expense-list li').eq(1).should('contain', 'ขายไอเทมใน PUBG') // eq(1) คือการชี้ไปที่บรรทัดที่ 2 (เริ่มนับจาก 0)
    })

  })

})