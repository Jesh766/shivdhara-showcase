/**
 * api/_lib/telegram.ts
 * Telegram alert dispatcher reading credentials from environment variables.
 * Falls back safely without leaking credentials or throwing unhandled errors.
 */

export async function sendTelegramAlert(text: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  const rawChatIds = process.env.TELEGRAM_CHAT_ID?.trim() || '';

  if (!botToken || !rawChatIds) {
    console.warn('[Telegram Alert] Missing credentials');
    return;
  }

  // Support multiple chat IDs separated by commas or semicolons
  const chatIds = rawChatIds
    .split(/[,;]+/)
    .map((id) => id.trim())
    .filter(Boolean);

  if (chatIds.length === 0) return;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  await Promise.allSettled(
    chatIds.map(async (chatId) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
          }),
        });
        const data: any = await response.json().catch(() => null);
        if (!response.ok || !data?.ok) {
          console.error(`[Telegram Alert Error] chat_id ${chatId} status ${response.status}: ${data?.description || 'Failed'}`);
        } else {
          console.log(`[Telegram Alert Success] Sent to chat_id ${chatId}, message_id: ${data?.result?.message_id}`);
        }
      } catch (err) {
        console.error(`[Telegram Alert Network Error] Failed for chat_id ${chatId}:`, err);
      }
    })
  );
}
