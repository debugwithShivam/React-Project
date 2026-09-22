import jwt from 'jsonwebtoken';
import {
    generateAccessToken,
    generateRefreshToken
} from '../utils/token.js';
import envConfig from '../config/envConfig.js';
import bcrypt from 'bcrypt';
import pool from '../config/DBconfig/database.js';



const normalizeRole = (role) => {
    return String(role || 'USER').trim().toUpperCase();
};

const normalizePhone = (phone) => {
    return String(phone || '')
        .replace(/\D/g, '')
        .replace(/^91(?=\d{10}$)/, '');
};

const normalizeEmail = (email) => {
    const value = String(email || '').trim().toLowerCase();

    return value || null;
};

const normalizeVehiclePlate = (plate) => {
    return String(plate || '')
        .trim()
        .toUpperCase();
};

const normalizeDrivingLicense = (license) => {
    return String(license || '')
        .trim()
        .toUpperCase();
};





export async function registerUser({
    name,
    phone,
    email,
    password,
    role = 'USER',
    city,
    vehicleType,
    vehicleModel,
    vehiclePlate,
    drivingLicense,
    aadhaarNumber,
    payoutUpi,

    files
}) {

    const normalizedName = String(name || '').trim();
    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = normalizeEmail(email);
    const normalizedRole = normalizeRole(role);
    const normalizedCity = String(city || '').trim();
    const normalizedVehicleType =
        String(vehicleType || '').trim();
    const normalizedVehicleModel =
        String(vehicleModel || '').trim();
    const normalizedVehiclePlate =
        normalizeVehiclePlate(vehiclePlate);
    const normalizedDrivingLicense =
        normalizeDrivingLicense(drivingLicense);
    const normalizedAadhaar =
        String(aadhaarNumber || '').trim() || null;
    const normalizedPayoutUpi =
        String(payoutUpi || '').trim() || null;

    if (!normalizedName || !normalizedPhone || !password) {
        throw new Error(
            'Name, phone and password are required'
        );
    }

    if (!/^\d{10}$/.test(normalizedPhone)) {
        throw new Error(
            'Please enter a valid 10-digit phone number'
        );
    }


    if (!['USER', 'DRIVER'].includes(normalizedRole)) {
        throw new Error('Invalid role');
    }


    if (password.length < 6) {
        throw new Error(
            'Password must be at least 6 characters'
        );
    }

    const [existingUsers] = await pool.query(
        `
        SELECT id
        FROM users
        WHERE phone = ?
           OR (
                email IS NOT NULL
                AND ? IS NOT NULL
                AND email = ?
           )
        LIMIT 1
        `,
        [
            normalizedPhone,
            normalizedEmail,
            normalizedEmail
        ]
    );


    if (existingUsers.length > 0) {
        throw new Error(
            'Phone or Email is already registered'
        );
    }

    if (normalizedRole === 'DRIVER') {

        if (
            !normalizedCity ||
            !normalizedVehicleType ||
            !normalizedVehicleModel ||
            !normalizedVehiclePlate ||
            !normalizedDrivingLicense
        ) {
            throw new Error(
                'City, vehicle type, vehicle model, vehicle plate and driving license are required'
            );
        }

        const [existingDrivers] = await pool.query(
            `
            SELECT id
            FROM drivers
            WHERE vehicle_plate = ?
               OR driving_license = ?
            LIMIT 1
            `,
            [
                normalizedVehiclePlate,
                normalizedDrivingLicense
            ]
        );

        if (existingDrivers.length > 0) {
            throw new Error(
                'Vehicle plate or driving license is already registered'
            );
        }
    }

    const passwordHash = await bcrypt.hash(
        password,
        12
    );

    const [userResult] = await pool.query(
        `
        INSERT INTO users
        (
            name,
            phone,
            email,
            password_hash,
            role,
            is_active
        )
        VALUES (?, ?, ?, ?, ?, 1)
        `,
        [
            normalizedName,
            normalizedPhone,
            normalizedEmail,
            passwordHash,
            normalizedRole
        ]
    );


    const userId = userResult.insertId;

    let driver = null;




    if (normalizedRole === 'DRIVER') {

        const [driverResult] = await pool.query(
            `
            INSERT INTO drivers
            (
                user_id,
                city,
                vehicle_type,
                vehicle_model,
                vehicle_plate,
                driving_license,
                aadhaar_number,
                payout_upi,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
            `,
            [
                userId,
                normalizedCity,
                normalizedVehicleType,
                normalizedVehicleModel,
                normalizedVehiclePlate,
                normalizedDrivingLicense,
                normalizedAadhaar,
                normalizedPayoutUpi
            ]
        );
        const driverId = driverResult.insertId;

        const getFile = (fieldName) => {
            return files?.[fieldName]?.[0] || null;
        };


        const documents = [

            {
                type: 'DRIVING_LICENSE',
                side: 'FRONT',
                file: getFile('dlFront')
            },

            {
                type: 'DRIVING_LICENSE',
                side: 'BACK',
                file: getFile('dlBack')
            },

            {
                type: 'VEHICLE_RC',
                side: 'FRONT',
                file: getFile('rcFront')
            },

            {
                type: 'VEHICLE_RC',
                side: 'BACK',
                file: getFile('rcBack')
            },

            {
                type: 'AADHAAR',
                side: 'FRONT',
                file: getFile('aadhaarFront')
            },

            {
                type: 'AADHAAR',
                side: 'BACK',
                file: getFile('aadhaarBack')
            },

            {
                type: 'INSURANCE',
                side: 'FRONT',
                file: getFile('insuranceFront')
            },

            {
                type: 'INSURANCE',
                side: 'BACK',
                file: getFile('insuranceBack')
            }
        ];





        for (const document of documents) {

            if (!document.file) {
                continue;
            }


            await pool.query(
                `
                INSERT INTO driver_documents
                (
                    driver_id,
                    document_type,
                    document_side,
                    file_name,
                    file_data,
                    verification_status
                )
                VALUES (?, ?, ?, ?, ?, 'PENDING')
                `,
                [
                    driverId,
                    document.type,
                    document.side,
                    document.file.originalname,
                    document.file.buffer
                ]
            );
        }

        driver = {
            id: driverId,
            city: normalizedCity,
            vehicleType: normalizedVehicleType,
            vehicleModel: normalizedVehicleModel,
            vehiclePlate: normalizedVehiclePlate,
            drivingLicense: normalizedDrivingLicense,
            aadhaarNumber: normalizedAadhaar,
            payoutUpi: normalizedPayoutUpi,
            status: 'PENDING'
        };
    }







    return {
        id: userId,
        name: normalizedName,
        phone: normalizedPhone,
        email: normalizedEmail,
        role: normalizedRole,
        driver
    };
}





export const loginUser = async ({identifier,password,role}) => {

    if (!identifier || !password) {
        throw new Error(
            'Email/phone and password are required'
        );
    }

    const normalizedRole = normalizeRole(role);
    if (!['USER', 'DRIVER', 'ADMIN'].includes(normalizedRole)) {
        throw new Error('Invalid account type');
    }

    const normalizedIdentifier =
        normalizePhone(identifier);

    const isPhone =
        /^\d{10}$/.test(normalizedIdentifier);

    const [users] = await pool.query(
        `
        SELECT
            id,
            name,
            phone,
            email,
            password_hash,
            role,
            profile_image,
            is_active
        FROM users
        WHERE
        (
            email = ?
            OR phone = ?
        )
        AND role = ?
        LIMIT 1
        `,
        [
            String(identifier).trim().toLowerCase(),
            isPhone
                ? normalizedIdentifier
                : String(identifier).trim().toLowerCase(),
            normalizedRole
        ]
    );

    console.log('LOGIN DEBUG:', {
        identifier,
        normalizedIdentifier,
        normalizedRole,
        usersFound: users.length,
    });


    if (users.length === 0) {
        throw new Error(
            'Invalid email/phone, password or account type'
        );
    }

    const user = users[0];

    if (!user.is_active) {
        throw new Error(
            'Your account is inactive'
        );
    }

    const passwordMatched =
        await bcrypt.compare(
            password,
            user.password_hash
        );

        console.log('PASSWORD DEBUG:', passwordMatched);
        console.log('PASSWORD DEBUG:', user);

    if (!passwordMatched) {
        throw new Error(
            'Invalid email/phone, password or account type'
        );
    }

    const accessToken =
        generateAccessToken({
            ...user,
            role: normalizedRole
        });


    const refreshToken =
        generateRefreshToken({
            ...user,
            role: normalizedRole
        });

    const refreshTokenHash =
        await bcrypt.hash(
            refreshToken,
            12
        );
    await pool.query(
        `
        INSERT INTO refresh_tokens
        (
            user_id,
            token_hash,
            expires_at
        )
        VALUES
        (
            ?,
            ?,
            DATE_ADD(NOW(), INTERVAL 7 DAY)
        )
        `,
        [
            user.id,
            refreshTokenHash
        ]
    );

    return {
        user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: normalizedRole,
            profileImage: user.profile_image
        },
        accessToken,
        refreshToken
    };
};





export const requestPasswordReset = async ({
    email,
    phone
}) => {

    const normalizedEmail =
        normalizeEmail(email);

    const normalizedPhone =
        normalizePhone(phone);


    if (!normalizedEmail && !/^\d{10}$/.test(normalizedPhone)) {
        throw new Error(
            'Valid email or phone is required'
        );
    }


    const [users] = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            phone,
            role
        FROM users
        WHERE
            (
                email = ?
                OR phone = ?
            )
        LIMIT 1
        `,
        [
            normalizedEmail,
            normalizedPhone
        ]
    );


    if (users.length === 0) {
        throw new Error(
            'No account found with this email or phone'
        );
    }


    const user = users[0];





    const resetToken = jwt.sign(
        {
            user: user.id,
            purpose: 'password_reset',
            role: normalizeRole(user.role)
        },
        envConfig.ACCESS_TOKEN_SECRET,
        {
            expiresIn: '30m'
        }
    );





    const tokenHash =
        await bcrypt.hash(
            resetToken,
            12
        );





    await pool.query(
        `
        INSERT INTO password_reset_tokens
        (
            user_id,
            token_hash,
            expires_at
        )
        VALUES
        (
            ?,
            ?,
            DATE_ADD(NOW(), INTERVAL 30 MINUTE)
        )
        ON DUPLICATE KEY UPDATE
            token_hash = VALUES(token_hash),
            expires_at = VALUES(expires_at)
        `,
        [
            user.id,
            tokenHash
        ]
    );


    return {
        email: user.email,
        resetToken
    };
};





export const resetUserPassword = async ({
    token,
    newPassword
}) => {

    if (
        !token ||
        !newPassword ||
        newPassword.length < 6
    ) {
        throw new Error(
            'Valid reset token and a password with at least 6 characters are required'
        );
    }


    let payload;





    try {

        payload = jwt.verify(
            token,
            envConfig.ACCESS_TOKEN_SECRET
        );

    } catch (error) {

        throw new Error(
            'Invalid or expired reset token'
        );
    }





    if (
        payload.purpose !== 'password_reset'
    ) {
        throw new Error(
            'Invalid reset token'
        );
    }


    if (!payload.user) {
        throw new Error(
            'Invalid reset token'
        );
    }





    const [tokens] = await pool.query(
        `
        SELECT
            id,
            user_id,
            token_hash,
            expires_at
        FROM password_reset_tokens
        WHERE
            user_id = ?
            AND expires_at > NOW()
        `,
        [
            payload.user
        ]
    );


    let matchedToken = null;





    for (const item of tokens) {

        const matched =
            await bcrypt.compare(
                token,
                item.token_hash
            );


        if (matched) {
            matchedToken = item;
            break;
        }
    }


    if (!matchedToken) {
        throw new Error(
            'Reset token not found or expired'
        );
    }





    const passwordHash =
        await bcrypt.hash(
            newPassword,
            12
        );





    await pool.query(
        `
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
        `,
        [
            passwordHash,
            payload.user
        ]
    );





    await pool.query(
        `
        DELETE FROM password_reset_tokens
        WHERE id = ?
        `,
        [
            matchedToken.id
        ]
    );


    return {
        success: true
    };
};





export const refreshUserToken = async (
    refreshToken
) => {

    if (!refreshToken) {
        throw new Error(
            'Refresh token is required'
        );
    }


    let payload;





    try {

        payload = jwt.verify(
            refreshToken,
            envConfig.REFRESH_TOKEN_SECRET
        );

    } catch (error) {

        console.error(
            'JWT verification error:',
            error.message
        );

        throw new Error(
            'Invalid or expired refresh token'
        );
    }


    const userId = payload.user;


    if (!userId) {
        throw new Error(
            'Invalid refresh token'
        );
    }





    const [tokens] = await pool.query(
        `
        SELECT
            id,
            user_id,
            token_hash,
            expires_at
        FROM refresh_tokens
        WHERE
            user_id = ?
            AND expires_at > NOW()
        `,
        [
            userId
        ]
    );


    if (tokens.length === 0) {
        throw new Error(
            'Refresh token not found or expired'
        );
    }





    let matchedToken = null;


    for (const token of tokens) {

        const matched =
            await bcrypt.compare(
                refreshToken,
                token.token_hash
            );


        if (matched) {
            matchedToken = token;
            break;
        }
    }


    if (!matchedToken) {
        throw new Error(
            'Invalid refresh token'
        );
    }





    const [users] = await pool.query(
        `
        SELECT
            id,
            name,
            phone,
            email,
            role,
            profile_image,
            is_active
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [
            userId
        ]
    );


    if (users.length === 0) {
        throw new Error(
            'User not found'
        );
    }


    const user = users[0];


    if (!user.is_active) {
        throw new Error(
            'Your account is inactive'
        );
    }





    const accessToken =
        generateAccessToken({
            ...user,
            role: normalizeRole(user.role)
        });

    // Rotate refresh token: issue a new one, delete the matched old row.
    const newRefreshToken =
        generateRefreshToken({
            ...user,
            role: normalizeRole(user.role)
        });

    const newRefreshTokenHash =
        await bcrypt.hash(newRefreshToken, 12);

    await pool.query(
        `DELETE FROM refresh_tokens WHERE id = ?`,
        [matchedToken.id]
    );

    await pool.query(
        `
        INSERT INTO refresh_tokens
        (
            user_id,
            token_hash,
            expires_at
        )
        VALUES
        (
            ?,
            ?,
            DATE_ADD(NOW(), INTERVAL 7 DAY)
        )
        `,
        [
            userId,
            newRefreshTokenHash
        ]
    );

    return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: normalizeRole(user.role),
            profileImage: user.profile_image
        }
    };
};





export const logoutUser = async (
    refreshToken
) => {

    if (!refreshToken) {
        throw new Error(
            'Refresh token is required'
        );
    }


    let payload;





    try {

        payload = jwt.verify(
            refreshToken,
            envConfig.REFRESH_TOKEN_SECRET
        );

    } catch (error) {

        throw new Error(
            'Invalid or expired refresh token'
        );
    }


    const userId = payload.user;


    if (!userId) {
        throw new Error(
            'Invalid refresh token'
        );
    }





    const [tokens] = await pool.query(
        `
        SELECT
            id,
            token_hash
        FROM refresh_tokens
        WHERE user_id = ?
        `,
        [
            userId
        ]
    );






    let matchedToken = null;


    for (const token of tokens) {

        const matched =
            await bcrypt.compare(
                refreshToken,
                token.token_hash
            );


        if (matched) {
            matchedToken = token;
            break;
        }
    }


    if (!matchedToken) {
        throw new Error(
            'Refresh token not found'
        );
    }






    await pool.query(
        `
        DELETE FROM refresh_tokens
        WHERE id = ?
        `,
        [
            matchedToken.id
        ]
    );


    return {
        success: true
    };
};