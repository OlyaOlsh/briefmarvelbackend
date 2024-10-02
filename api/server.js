require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const token = process.env.TOKEN;
const groupChatId = process.env.GROUP_CHAT_ID;
const webAppUrl = process.env.WEB_APP_URL;

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes(bot, groupChatId)); // Подключаем маршруты

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

// Экспортируем приложение для использования в index.js
module.exports = app;