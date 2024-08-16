import dotenv from "dotenv"
import crypto from "crypto";
dotenv.config();
const secret = process.env.GITHUB_WEB_HOOK;


export const verifySignature = (req, res, buf, encoding) => {
    const signature = req.headers['x-hub-signature-256'];
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(buf, encoding);
    const digest = `sha256=${hmac.digest('hex')}`;
    if (signature !== digest) {
        throw new Error('Invalid signature');
    }
};