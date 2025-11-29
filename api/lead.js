import CryptoJS from 'crypto-js';

const AES_KEY = 'craftvibeza-2026-backup-key';  // Change in production!

export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { encrypted } = req.body;
    if (!encrypted) return res.status(400).json({ error: 'No data' });

    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, AES_KEY);
        const lead = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        console.log('BACKUP LEAD:', lead);

        // Optional: Send yourself a WhatsApp via CallMeBot (add key in Vercel env)
        // fetch(`https://api.callmebot.com/whatsapp.php?phone=27764312871&text=NEW+LEAD&apikey=...`);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Decrypt failed:', error);
        res.status(400).json({ error: 'Invalid data' });
    }
}

export const config = { api: { bodyParser: true } };