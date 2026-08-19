// ==========================================
// ตัวแปรทั้งหมด
// ==========================================
// ฝั่ง Login
const loginSection = document.getElementById('login-section');
const expenseSection = document.getElementById('expense-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

// ฝั่งบัญชี
const addBtn = document.getElementById('add-btn');
const descInput = document.getElementById('desc-input');
const amountInput = document.getElementById('amount-input');
const expenseList = document.getElementById('expense-list');
const totalAmount = document.getElementById('total-amount');
const errorMsg = document.getElementById('error-msg');

// ==========================================
// ฟังก์ชันของระบบบัญชี (ที่หายไป เอากลับมาแล้วครับ!)
// ==========================================
async function fetchExpenses() {
    const response = await fetch('/api/v1/expenses');
    const data = await response.json();
    renderList(data);
}

function renderList(expenses) {
    expenseList.innerHTML = '';
    let total = 0;

    expenses.forEach(item => {
        total += item.amount;
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.desc}</span> <strong>${item.amount} ฿</strong>`;
        expenseList.appendChild(li);
    });

    totalAmount.innerText = total;
}

addBtn.addEventListener('click', async () => {
    const desc = descInput.value;
    const amount = parseFloat(amountInput.value);

    if (!desc || isNaN(amount)) {
        errorMsg.innerText = 'กรุณากรอกข้อมูลให้ครบและถูกต้อง';
        errorMsg.style.display = 'block';
        return;
    }
    errorMsg.style.display = 'none';

    const response = await fetch('/api/v1/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desc, amount })
    });

    // 🌟 ดึงข้อมูลที่ API ตอบกลับมา (ไม่ว่าจะผ่านหรือ Error)
    const data = await response.json();

    if (response.ok) {
        // กรณีบันทึกสำเร็จ
        descInput.value = '';
        amountInput.value = '';
        errorMsg.style.display = 'none'; // ซ่อนข้อความ Error
        fetchExpenses();
    } else {
        // 🚨 กรณี Backend ส่ง Error กลับมา (เช่น 400 Bad Request)
        errorMsg.innerText = data.error; // เอาข้อความจาก Backend มาแสดง
        errorMsg.style.display = 'block';
    }
});

// ==========================================
// ฟังก์ชันของระบบ Login
// ==========================================
function checkLogin() {
    const token = localStorage.getItem('token');
    if (token) {
        loginSection.style.display = 'none';
        expenseSection.style.display = 'block';
        fetchExpenses(); // โหลดข้อมูลเมื่อมี Token
    } else {
        loginSection.style.display = 'block';
        expenseSection.style.display = 'none';
    }
}

loginBtn.addEventListener('click', async () => {
    const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value
        })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('token', data.token);
        usernameInput.value = '';
        passwordInput.value = '';
        loginError.style.display = 'none';
        checkLogin();
    } else {
        loginError.innerText = data.error;
        loginError.style.display = 'block';
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    checkLogin();
});

// ==========================================
// เริ่มการทำงานเมื่อเปิดเว็บ
// ==========================================
checkLogin();