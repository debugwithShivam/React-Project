import config from "../config/config.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import {db} from "../db/dataBase.js";

export default async function singIn(req, res) {
    try {

        const { firstName, lastName, email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = "INSERT INTO users(firstName,lastName,email,password)VALUES (?,?,?,?)";
        
        console.log(firstName,lastName,email,password);
        db.query(query, [firstName, lastName, email, hashedPassword], (err, result) => {
            console.log("inside callback");
            if (err) {
                console.log("MYSQL ERROR:", err);
                return res.status(500).json(err)
            };

            const accesstOKEN = jwt.sign(
                { id: result.insertId, email },
                config.ACCESSTOKEN,
                { expiresIn: '2d' }
            )

            const refreshToken = jwt.sign(
                { id: result.insertId },
                config.REFRESHSECRET,
                { expiresIn: "7d" }
            )

            res.cookie("accesstOKEN", accesstOKEN, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                maxAge: 2 * 24 * 60 * 60 * 1000,
                path: '/',
                expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            })
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
            return res.status(201).json({
                message: "Account created",data:result
            });
        })
    } catch (error) {
        return res.status(500).json(error);
    }
}

