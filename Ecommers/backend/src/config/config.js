import dotenv from 'dotenv'

dotenv.config()

const config = {
    port:process.env.PORT,
    ACCESSTOKEN:process.env.ACCESS_TOKEN,
    REFRESHSECRET:process.env.REFRESH_SECRET,
}

export default config