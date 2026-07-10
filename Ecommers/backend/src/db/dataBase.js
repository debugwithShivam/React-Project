import mysql from 'mysql2';


const db = mysql.createConnection({
    host:'localhost',
    user:"root",
    password:'newpassword',
    database:'auth_user',
    port:'3306'
})

const productsDb = mysql.createConnection({
    host:'localhost',
    user:"root",
    password:'newpassword',
    database:'products',
    port:'3306'
})

const productOrder = mysql.createConnection({
    host:'localhost',
    user:"root",
    password:'newpassword',
    database:'ProductOrder',
    port:'3306'
})

const Buyproduct = mysql.createConnection({
    host:'localhost',
    user:"root",
    password:'newpassword',
    database:'Buyproduct',
    port:'3306'
})

db.connect((err) => {
    if (err) {
        console.log("DB Error:", err);
        return;
    }
    console.log("MySQL Connected to auth_user");
});

productsDb.connect((err) => {
    if (err) {
        console.log("DB Error:", err);
        return;
    }
    console.log("MySQL Connected to products");
});

productOrder.connect((err) => {
    if (err) {
        console.log("DB Error:", err);
        return;
    }
    console.log("MySQL Connected to productOrder");
});

Buyproduct.connect((err) => {
    if (err) {
        console.log("DB Error:", err);
        return;
    }
    console.log("MySQL Connected to Buyproduct");
});

export  { db,productsDb,productOrder,Buyproduct};
