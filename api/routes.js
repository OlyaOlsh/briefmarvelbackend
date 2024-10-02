const express = require('express');
const router = express.Router();

module.exports = (bot, groupChatId) => {
   // console.log('Получено сообщение bot:', bot);

    // Массив для хранения пользователей
    let users = [];

    // Обработка сообщений
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const userName = msg.from.first_name || 'Пользователь';

        // Логируем все входящие сообщения
      //  console.log('Получено сообщение:', msg);

        try {
            if (msg?.web_app_data?.data) {
                const data = JSON.parse(msg.web_app_data.data);
                let { projectName, goals, audience, fullname, createdAt } = data;

                // Функция для удаления запрещенных символов и экранирования их
                const cleanInput = (input) => {
                    const forbiddenCharacters = /[<>.,!@#$%^&*()_+=\-`~;:'"[\]{}|\\/?]/g;
                    return input.replace(forbiddenCharacters, (match) => '\\' + match);
                };

                // Очищаем входные данные
                projectName = cleanInput(projectName);
                goals = cleanInput(goals);
                audience = cleanInput(audience);
                fullname = cleanInput(fullname);

                // Добавляем пользователя в массив
                if (!users.some(user => user.fullname === fullname)) {
                    users.push({ projectName, goals, audience, fullname });
                }

                const formatString = (label, value) => {
                    const labelLength = 12;
                    const spacesCount = Math.max(0, labelLength - label.length);
                    const spaces = ' '.repeat(spacesCount);
                    return `${label}${spaces}: _${value}_`;
                };

                let message = `                   
${formatString('*Проект*', projectName)}
${formatString('*Автор*', fullname)}
${formatString('*Цели*', goals)}
${formatString('*Для кого*', audience)}
${formatString('*Дата *', createdAt ? new Date(createdAt._seconds * 1000).toLocaleString() : 'Неизвестно')} 
`;

                // Удаляем специальные символы только для messageChatId
                const removeForbiddenCharacters = (input) => {
                    const forbiddenCharacters = /[<>.,!@#$%^&*()_+=\-`~;:'"[\]{}|\\/?]/g;
                    return input.replace(forbiddenCharacters, '');
                };

                // Очищаем projectName только для messageChatId
                const cleanProjectNameForMessageChatId = removeForbiddenCharacters(projectName);

                let messageChatId = `🔥Спасибо за идею 💡 "${cleanProjectNameForMessageChatId}"!\nВаш вклад в развитие MS Dynamics AX очень ценен.`;

                // Отправляем сообщение пользователю
                await bot.sendMessage(chatId, messageChatId);

                // Отправляем сообщение в группу
                await bot.sendMessage(groupChatId, message.trim(), { parse_mode: 'MarkdownV2' });

                console.log('Данные успешно отправлены:', message);
            } else if (msg.text === '/start') {

               // console.log('Команда /start получена'); // Лог для отладки
                await bot.sendMessage(chatId, "У Вас есть идея автоматизировать процессы в Аксапте? 🚀\n\n" +
                    "Не упустите возможность сделать жизнь себе и своей команде проще!\n\n" +
                    "⬇️ Кнопка \"Заполнить форму\"\n\n" +
                    "или свернутая пиктограмма 🎛️ справа (если кнопки нет)\n\n" +
                    "Кнопка \"Идеи\" - просмотр всех идей \n\n" +
                    "📡 Отключите VPN для корректной работы приложения\n\n" +
                    "✨ Заполните поля формы и дайте жизнь своему замыслу", {
                    reply_markup: {
                        keyboard: [
                            [{ text: 'Заполнить форму', web_app: { url: process.env.APP_URL } }]
                        ],
                        resize_keyboard: true
                    }
                });
            } else if (msg.text === '/users') {
                // Формируем сообщение со списком пользователей
                if (users.length === 0) {
                    await bot.sendMessage(chatId, 'Нет зарегистрированных пользователей.');
                } else {
                    let userList = users.map((user, index) => `${index + 1}. ${user.fullname}`).join('\n');
                    let totalUsers = users.length;
                    let responseMessage = `Список пользователей, кто оставил заявки :\n${userList}\n\nОбщее количество заявок: ${totalUsers}`;

                    await bot.sendMessage(chatId, responseMessage);
                }
            } else if (msg.photo && msg.from.id !== bot.id) { // Проверяем не от бота ли сообщение
                // Обработка изображения
                const photoId = msg.photo[msg.photo.length - 1].file_id; // Получаем ID самого большого изображения
                await bot.sendMessage(chatId, "Спасибо за изображение! Оно будет отправлено в группу.");

                // Отправка изображения в группу с именем пользователя
                await bot.sendPhoto(groupChatId, photoId, { caption: `Сообщение от ${userName} (ID: ${chatId})` });
            } else if (msg.document && msg.from.id !== bot.id) { // Проверяем не от бота ли сообщение
                // Обработка документа
                const documentId = msg.document.file_id;
                await bot.sendMessage(chatId, "Спасибо за документ! Он будет отправлен в группу.");

                // Отправка документа в группу с именем пользователя
                await bot.sendDocument(groupChatId, documentId);
                await bot.sendMessage(groupChatId, `Документ от ${userName} (ID: ${chatId})`);
            } else if (msg.text && msg.from.id !== bot.id) { // Проверяем не от бота ли сообщение
                const userMessage = `Сообщение от ${userName} (ID: ${chatId}): ${msg.text}`;

                // Ответ на текстовые сообщения, которые не являются командами
                await bot.sendMessage(chatId, "Спасибо за сообщение! Оно будет отправлено в группу.");

                // Отправка текстового сообщения в группу
                await bot.sendMessage(groupChatId, userMessage);
            }
        } catch (error) {
            console.error('Ошибка при обработке данных:', error);
            await bot.sendMessage(chatId, 'Ошибка при обработке данных.');
        }
    });

    return router;
};