import dotenv from 'dotenv'

dotenv.config()

export const COOKIES: string = process.env.COOKIES || ''
export const X_REQUEST_TOKEN: string = process.env.X_REQUEST_TOKEN || ''
