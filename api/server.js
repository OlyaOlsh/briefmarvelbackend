require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = process.env.TOKEN;
if (!token) {
    throw new Error('Telegram Bot Token not provided!');
}
const groupChatId = process.env.GROUP_CHAT_ID;

// Создаем экземпляр бота с включенным polling
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(cors());
app.use(express.json());

// Подключаем маршруты
app.use('/api', require('./routes')(bot, groupChatId)); // Передаем bot и groupChatId

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});