const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); 

let db_expenses = [
    { id: 1, desc: 'เงินเดือน', amount: 15000 }
];

// ===============================================
// 🌟 1. API สำหรับ Login (คุณเผลอลบทิ้งไป เอากลับมาแล้ว!)
// ===============================================
app.post('/api/v1/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'Charnin' && password === 'pass1234') {
        res.status(200).json({ message: 'Login Success', token: 'mock-jwt-token-123' });
    } else {
        res.status(401).json({ error: 'Username หรือ Password ไม่ถูกต้อง' });
    }
});

// ===============================================
// 🌟 2. API สำหรับเพิ่มรายจ่าย (ใส่ยามเฝ้าประตูเช็คยอดติดลบไว้แล้ว)
// ===============================================
app.post('/api/v1/expenses', (req, res) => {
    const amount = req.body.amount;

    // คำนวณยอดปัจจุบัน
    const currentTotal = db_expenses.reduce((sum, item) => sum + item.amount, 0);

    // เช็คยอดติดลบ
    if (currentTotal + amount < 0) {
        return res.status(400).json({ error: 'ยอดเงินคงเหลือไม่เพียงพอ 💸' });
    }

    // ถ้ายอดพอ ก็บันทึก
    const newExpense = {
        id: db_expenses.length + 1,
        desc: req.body.desc,
        amount: amount
    };
    db_expenses.push(newExpense);
    res.status(201).json({ message: 'บันทึกสำเร็จ', data: newExpense });
});

// ===============================================
// 🌟 3. API เดิม (ดึงข้อมูล และ รีเซ็ตฐานข้อมูล)
// ===============================================
app.get('/api/v1/expenses', (req, res) => { 
    res.json(db_expenses); 
});

app.post('/api/v1/reset', (req, res) => {
    // แก้ค่าตั้งต้นให้ตรงกับข้างบน (มีแค่เงินเดือน 15000)
    db_expenses = [ { id: 1, desc: 'เงินเดือน', amount: 15000 }];
    res.status(200).json({ message: 'รีเซ็ตข้อมูลเรียบร้อย!' });
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🚀 server running on http://localhost:${port}`);
});