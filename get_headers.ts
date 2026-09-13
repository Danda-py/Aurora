import { ImapFlow } from 'imapflow';

async function test() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: 'a', pass: 'b' },
    logger: false,
    tls: { rejectUnauthorized: false }
  });
  // syntax check
}
