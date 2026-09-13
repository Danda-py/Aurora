import { ImapFlow } from 'imapflow';
import 'dotenv/config';

async function test() {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT),
    secure: process.env.IMAP_SECURE !== 'false',
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASS
    },
    logger: false,
    tls: { rejectUnauthorized: false }
  });

  await client.connect();
  const lock = await client.getMailboxLock('INBOX');
  try {
    const all = await client.search({ all: true });
    console.log('Total emails in INBOX:', all.length);
    const unseen = await client.search({ seen: false });
    const pastBB = await client.search({ subject: 'ireservation' });
    const pastBB2 = await client.search({ subject: 'prenotazione' });
    const pastBB3 = await client.search({ from: 'bed-and-breakfast.it' });
    console.log('unseen:', unseen.length, 'pastBB:', pastBB.length, 'pastBB2:', pastBB2.length, 'pastBB3:', pastBB3.length);
  } finally {
    lock.release();
    await client.logout();
  }
}
test().catch(console.error);
