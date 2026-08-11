export async function sendTelegramNotification(chatId: string, title: string, description?: string | null, dateTime?: Date) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not defined');
    return false;
  }

  const formattedDate = dateTime 
    ? new Date(dateTime).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })
    : '';

  const message = `🔔 *تذكير بميعاد جديد!*

📌 *العنوان:* ${title}
${description ? `📝 *الوصف:* ${description}\n` : ''}⏰ *الموعد:* ${formattedDate}

نتمنى لك يوماً سعيداً! ✨`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}