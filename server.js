const app = require('./api/index'); // Импортируем ваше приложение
const PORT = process.env.PORT || 8000; // Указываем порт

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});