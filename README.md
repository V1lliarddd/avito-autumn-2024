Инструкция по запуску:

1. Иметь установленный NodeJS
2. npm install/ npm i
3. npm run dev(запуск клиента)
4. npm run server(запуск сервера)

Инструкция по запуску docker:

1. docker build -t <ваше название проекта>
2. docker run -p <порт>:<порт внутри контейнера(в nginx.conf = 80)> <ваше название проекта>

Инструкция по тестам:

1. npm run test - watch режим тестов
2. npm run test:run - разовый прогон тестов
3. npm run test:ui - веб интерфейс для тестов
4. npm run test:coverage - прогон с отчетом о покрытии
