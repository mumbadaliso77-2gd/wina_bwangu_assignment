/* setting up node js dependencies */
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path'); 

/* app configurations */
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'..', 'client')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..','client', 'index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'login.html'));
});

// database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//fetch all transactions from db to admin page
app.get('/api/transactions', async (req, res)=>{
    try{
        const [rows]= await pool.query(`
            SELECT
                t.id, t.amount, t.revenue, t.tax, t.amount_after_tax,
                b.name AS booth, b.location,
                s.id AS service, s.revenue_rate AS rate
            FROM transactions t
            JOIN booths b ON t.booth_id =b.id
            JOIN services s ON t.service_id=s.id
            ORDER BY t.created_at DESC 
            `);

            res.json(rows);
        }
        catch (error){
            console.error("Database erro:", error);
            res.status(500).json({error: 'failed to fetch transactions'});
        }
});

//handling agents dashboard requests and submissions
app.post('/api/transactions', async (req, res)=>{
    const {booth, service, amount}=req.body;

    try{
        const [services]= await pool.query('SELECT * FROM services WHERE id = ?', [service]);
        if (services.length ===0) return res.status(400).json({error: 'Invalid services'});
        const svc=services[0];

        const revenue =amount * svc.revenue_rate;
        const tax=amount*svc.tax_rate;
        const afterTax=amount-tax;

        const[countRes]=await pool.query('SELECT COUNT(*) as count FROM transactions');
        const nextId=`WB${String(countRes[0].count+1) .padStart(7,'0')}`;

        await pool.query(
            'Insert INTO transactions (id, booth_id, service_id, amount, revenue, tax, amount_after_tax) VALUES (?,?,?,?,?,?,?)',
            [nextId, booth, service, amount, revenue, tax, afterTax]
        );

        res.status(201).json({message: 'Transaction processed successfully', id: nextId});
    }

    catch(error){
        console.error("Trasaction error:", error);
        res.status(500).json({error: 'Server error processing transaction'});
    }
});
app.listen(port, ()=>{
    console.log(`Wina Bwangu API runnig at http://localhost:${port}`);
});