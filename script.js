/* ==========================================
   CYBER GOAT 2027
   ЧАСТЬ 1. ОБРАТНЫЙ ОТСЧЁТ
========================================== */

// Находим элементы таймера на главной странице
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

// Проверяем, есть ли таймер на текущей странице
if (daysElement && hoursElement && minutesElement && secondsElement) {

    // Дата наступления Нового года
    const newYearDate = new Date("2027-01-01T00:00:00");

    // Функция обновления таймера
    function updateCountdown() {

        // Считаем оставшееся время в миллисекундах
        const currentDate = new Date();
        const difference = newYearDate - currentDate;

        // Если Новый год уже наступил
        if (difference <= 0) {
            daysElement.textContent = "00";
            hoursElement.textContent = "00";
            minutesElement.textContent = "00";
            secondsElement.textContent = "00";
            return;
        }

        // Переводим миллисекунды в дни, часы, минуты и секунды
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        // Выводим значения на страницу
        daysElement.textContent = String(days).padStart(2, "0");
        hoursElement.textContent = String(hours).padStart(2, "0");
        minutesElement.textContent = String(minutes).padStart(2, "0");
        secondsElement.textContent = String(seconds).padStart(2, "0");
    }

    // Запускаем таймер сразу и обновляем каждую секунду
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/* ==========================================
   ЧАСТЬ 2. MEMORY.exe
========================================== */

// Находим элементы игры
const memoryGame = document.getElementById("memory-game");
const memoryMessage = document.getElementById("memory-message");
const restartMemoryButton = document.getElementById("restart-memory");

// Запускаем игру только на странице с MEMORY
if (memoryGame && memoryMessage && restartMemoryButton) {

    // Символы, которые нужно найти парами
    const memorySymbols = ["🔥", "🐐", "🎄", "🎁", "⭐", "🔔", "❄️", "🍊"];

    let firstCard = null;
    let secondCard = null;
    let lockedBoard = false;
    let matchedPairs = 0;

    // Перемешиваем карточки
    function shuffleMemoryCards(cards) {
        return cards.sort(() => Math.random() - 0.5);
    }

    // Создаём игровое поле
    function createMemoryGame() {

        // Сбрасываем состояние игры
        memoryGame.innerHTML = "";
        firstCard = null;
        secondCard = null;
        lockedBoard = false;
        matchedPairs = 0;

        memoryMessage.textContent = "Найдите все одинаковые пары!";

        // Каждому символу создаём две карточки
        const cards = shuffleMemoryCards([...memorySymbols, ...memorySymbols]);

        cards.forEach((symbol) => {

            const card = document.createElement("button");

            card.className = "memory-card";
            card.type = "button";
            card.textContent = "?";
            card.dataset.symbol = symbol;

            // Обрабатываем нажатие на карточку
            card.addEventListener("click", () => {

                // Не разрешаем выбирать открытые или заблокированные карточки
                if (
                    lockedBoard ||
                    card.classList.contains("matched") ||
                    card === firstCard
                ) {
                    return;
                }

                // Показываем символ
                card.textContent = card.dataset.symbol;

                // Запоминаем первую карточку
                if (!firstCard) {
                    firstCard = card;
                    return;
                }

                // Запоминаем вторую карточку
                secondCard = card;

                // Проверяем совпадение
                if (firstCard.dataset.symbol === secondCard.dataset.symbol) {

                    firstCard.classList.add("matched");
                    secondCard.classList.add("matched");

                    matchedPairs++;

                    firstCard = null;
                    secondCard = null;

                    // Проверяем, найдены ли все пары
                    if (matchedPairs === memorySymbols.length) {
                        memoryMessage.textContent =
                            "ПОБЕДА! Вы нашли все пары! 🔥🐐";
                    }

                } else {

                    // Временно блокируем игровое поле
                    lockedBoard = true;

                    // Через небольшую паузу закрываем карточки
                    setTimeout(() => {
                        firstCard.textContent = "?";
                        secondCard.textContent = "?";

                        firstCard = null;
                        secondCard = null;
                        lockedBoard = false;
                    }, 850);
                }
            });

            memoryGame.appendChild(card);
        });
    }

    // Кнопка перезапуска игры
    restartMemoryButton.addEventListener("click", createMemoryGame);

    // Создаём игру при открытии страницы
    createMemoryGame();
}

/* ==========================================
   ЧАСТЬ 3. FIRE WHEEL
========================================== */

// Находим элементы колеса
const fortuneWheel = document.getElementById("wheel");
const spinWheelButton = document.getElementById("spin-wheel");
const wheelMessage = document.getElementById("wheel-message");

// Запускаем код только на странице с колесом
if (fortuneWheel && spinWheelButton && wheelMessage) {

    // Возможные результаты вращения
    const wheelResults = [
        "Вас ждёт год ярких приключений! 🔥",
        "В новом году исполнится маленькое желание! ⭐",
        "Вас ждёт приятный сюрприз! 🎁",
        "Год будет полон новых идей! 💡",
        "Время для смелых начинаний! 🐐",
        "Пусть удача будет на вашей стороне! 🍀"
    ];

    // Сколько градусов колесо уже прошло
    let wheelRotation = 0;

    // Защита от повторного нажатия
    let wheelIsSpinning = false;

    // Запуск вращения
    spinWheelButton.addEventListener("click", () => {

        if (wheelIsSpinning) {
            return;
        }

        wheelIsSpinning = true;
        spinWheelButton.disabled = true;
        wheelMessage.textContent = "СИСТЕМА ВЫБИРАЕТ ВАШУ СУДЬБУ...";

        // Случайный сектор
        const resultIndex = Math.floor(Math.random() * wheelResults.length);

        // Один полный круг плюс несколько дополнительных
        const extraDegrees = 1800 + Math.floor(Math.random() * 360);

        wheelRotation += extraDegrees;

        // Вращаем колесо
        fortuneWheel.style.transform = `rotate(${wheelRotation}deg)`;

        // Ждём окончания анимации
        setTimeout(() => {

            wheelMessage.textContent = wheelResults[resultIndex];

            spinWheelButton.disabled = false;
            wheelIsSpinning = false;

        }, 4100);
    });
}

/* ==========================================
   ЧАСТЬ 4. NEW YEAR QUIZ
========================================== */

// Находим элементы викторины
const quizContainer = document.getElementById("quiz-container");
const quizProgress = document.getElementById("quiz-progress");
const quizQuestion = document.getElementById("question");
const quizAnswers = document.getElementById("answers");
const quizMessage = document.getElementById("quiz-message");
const nextQuestionButton = document.getElementById("next-question");

// Запускаем викторину только на нужной странице
if (
    quizContainer &&
    quizProgress &&
    quizQuestion &&
    quizAnswers &&
    quizMessage &&
    nextQuestionButton
) {

    // Вопросы и варианты ответов
    const quizQuestions = [
        {
            question: "Какой праздник отмечают в ночь с 31 декабря на 1 января?",
            answers: ["День рождения", "Новый год", "День весны", "Хэллоуин"],
            correct: 1
        },
        {
            question: "Какой символ обычно украшают к Новому году?",
            answers: ["Кактус", "Пальму", "Ёлку", "Подсолнух"],
            correct: 2
        },
        {
            question: "Как зовут главного зимнего волшебника?",
            answers: ["Домовой", "Дед Мороз", "Бармалей", "Карлсон"],
            correct: 1
        },
        {
            question: "Какой месяц открывает новый календарный год?",
            answers: ["Декабрь", "Февраль", "Январь", "Март"],
            correct: 2
        },
        {
            question: "Что обычно запускают в небо в новогоднюю ночь?",
            answers: ["Воздушные шары", "Фейерверки", "Бумажные самолётики", "Мыльные пузыри"],
            correct: 1
        }
    ];

    // Переменные состояния викторины
    let currentQuestion = 0;
    let quizScore = 0;
    let answerSelected = false;

    // Показываем текущий вопрос
    function showQuestion() {

        answerSelected = false;

        quizProgress.textContent =
            `ВОПРОС ${currentQuestion + 1} / ${quizQuestions.length}`;

        quizQuestion.textContent =
            quizQuestions[currentQuestion].question;

        quizAnswers.innerHTML = "";
        quizMessage.textContent = "";

        nextQuestionButton.disabled = true;
        nextQuestionButton.textContent = "СЛЕДУЮЩИЙ ВОПРОС";

        // Создаём кнопки ответов
        quizQuestions[currentQuestion].answers.forEach((answer, index) => {

            const answerButton = document.createElement("button");

            answerButton.className = "answer-button";
            answerButton.type = "button";
            answerButton.textContent = answer;

            answerButton.addEventListener("click", () => {

                if (answerSelected) {
                    return;
                }

                answerSelected = true;

                const correctIndex =
                    quizQuestions[currentQuestion].correct;

                // Проверяем правильность ответа
                if (index === correctIndex) {

                    quizScore++;
                    answerButton.classList.add("correct");
                    quizMessage.textContent = "ПРАВИЛЬНО! Отличная работа! 🔥";

                } else {

                    answerButton.classList.add("wrong");
                    quizMessage.textContent =
                        "Не совсем! Правильный ответ: " +
                        quizQuestions[currentQuestion].answers[correctIndex];
                }

                // Подсвечиваем правильный ответ
                const allButtons =
                    quizAnswers.querySelectorAll(".answer-button");

                allButtons.forEach((button, buttonIndex) => {

                    button.disabled = true;

                    if (buttonIndex === correctIndex) {
                        button.classList.add("correct");
                    }
                });

                nextQuestionButton.disabled = false;
            });

            quizAnswers.appendChild(answerButton);
        });
    }

    // Показываем итог викторины
    function finishQuiz() {

        quizProgress.textContent = "СИСТЕМА ЗАВЕРШЕНА";

        quizQuestion.textContent =
            `Вы набрали ${quizScore} из ${quizQuestions.length} баллов!`;

        quizAnswers.innerHTML = "";

        // Выбираем награду
        let rewardTitle = "";

        if (quizScore === 5) {
            rewardTitle = "GOLDEN FIRE KEEPER 🏆";
        } else if (quizScore >= 3) {
            rewardTitle = "FRIEND OF FIRE GOAT 🔥";
        } else {
            rewardTitle = "APPRENTICE OF NEW YEAR MAGIC ⭐";
        }

        quizMessage.textContent =
            `Ваше звание: ${rewardTitle}`;

        nextQuestionButton.textContent = "ПРОЙТИ ЕЩЁ РАЗ";
        nextQuestionButton.disabled = false;

        // Показываем секретное предсказание
        const predictionSection =
            document.getElementById("prediction-section");

        if (predictionSection) {
            predictionSection.hidden = false;
            predictionSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }

    // Одна кнопка отвечает и за переход, и за повторный запуск
    nextQuestionButton.addEventListener("click", () => {

        // Если викторина закончилась — начинаем заново
        if (currentQuestion >= quizQuestions.length) {

            currentQuestion = 0;
            quizScore = 0;
            answerSelected = false;

            const predictionSection =
                document.getElementById("prediction-section");

            if (predictionSection) {
                predictionSection.hidden = true;
            }

            const predictionStatus =
                document.getElementById("prediction-status");

            const predictionResult =
                document.getElementById("prediction-result");

            if (predictionStatus) {
                predictionStatus.textContent = "ОЖИДАНИЕ ЗАПРОСА...";
            }

            if (predictionResult) {
                predictionResult.textContent = "";
            }

            showQuestion();
            return;
        }

        // Нельзя перейти дальше без ответа
        if (!answerSelected) {
            return;
        }

        currentQuestion++;

        if (currentQuestion < quizQuestions.length) {
            showQuestion();
        } else {
            finishQuiz();
        }
    });

    // Первый вопрос при открытии страницы
    showQuestion();
}

/* ==========================================
   ЧАСТЬ 5. FIRE GOAT SYSTEM HACK
========================================== */

const predictionSection = document.getElementById("prediction-section");
const predictionScreen = document.getElementById("prediction-screen");
const predictionStatus = document.getElementById("prediction-status");
const predictionResult = document.getElementById("prediction-result");
const predictionButton = document.getElementById("get-prediction");

if (
    predictionSection &&
    predictionScreen &&
    predictionStatus &&
    predictionResult &&
    predictionButton
) {

    // Предсказания Огненной Козы
    const goatPredictions = [
        "Вас ждёт неожиданное приключение. Не бойтесь пробовать новое! 🔥",
        "Один из ваших маленьких планов превратится в большое событие. ⭐",
        "Вас ждёт знакомство, которое подарит положительные эмоции. 🐐",
        "Год принесёт вдохновение и интересные идеи. 💡",
        "Удача будет благосклонна к вашим начинаниям. 🍀",
        "Впереди вас ждёт приятный сюрприз. 🎁",
        "Пора оставить немного места для безумных идей! 🔥"
    ];

    predictionButton.addEventListener("click", () => {

        if (predictionButton.disabled) return;

        predictionButton.disabled = true;
        predictionResult.textContent = "";
        predictionStatus.textContent = "UNAUTHORIZED ACCESS DETECTED";

        // Создаём экран взлома
        const overlay = document.createElement("div");
        overlay.id = "cyber-hack-overlay";
        overlay.classList.add("active");

        overlay.innerHTML = `
            <div class="hack-terminal">
                <div class="hack-terminal-header">
                    <span>CYBER GOAT TERMINAL v2027</span>
                   <span>● SYSTEM COMPROMISED</span>
<span id="hack-error-counter">ERRORS: 0/6</span>
                </div>
                <div class="hack-lines" id="hack-lines"></div>
                <span class="hack-cursor"></span>
            </div>
            <div id="hack-windows"></div>`;

        document.body.appendChild(overlay);

        const linesContainer = overlay.querySelector("#hack-lines");
        const windowsContainer = overlay.querySelector("#hack-windows");
        const errorCounter = overlay.querySelector("#hack-error-counter");
let createdErrors = 0;

        // Строки терминала
        const terminalLines = [
            "INITIALIZING FIRE_GOAT.exe...",
            "CONNECTING TO UNKNOWN ENTITY...",
            "BYPASSING SYSTEM PROTECTION...",
            "ACCESS GRANTED.",
            "WARNING: ADMINISTRATOR OVERRIDE",
            "FIRE GOAT HAS ENTERED THE SYSTEM."
        ];

        // Печатаем строки одну за другой
        terminalLines.forEach((line, index) => {
            setTimeout(() => {
                const newLine = document.createElement("div");
                newLine.className = "hack-line";
                newLine.textContent = line;
                linesContainer.appendChild(newLine);
            }, index * 400);
        });

        // Создаём окно системной ошибки
        function createErrorWindow(title, message, position) {

            const windowElement = document.createElement("div");
            windowElement.className = "hack-error-window";

            windowElement.style.top = position.top;
            windowElement.style.left = position.left;

            windowElement.innerHTML = `
                <div class="hack-error-title">
                    <span>${title}</span>
                    <span class="hack-error-close">X</span>
                </div>
                <div class="hack-error-content">
                    <strong>⚠ SYSTEM WARNING</strong>
                    ${message}
                    <button type="button" tabindex="-1">OK</button>
                </div>
            `;

            windowsContainer.appendChild(windowElement);
            createdErrors++;

errorCounter.textContent = `ERRORS: ${createdErrors}/6`;
        }

        // Шесть разных системных ошибок
        const errorWindows = [
            {
                title: "SYSTEM ERROR 001",
                message: "Обнаружен неизвестный пользователь."
            },
            {title: "FIRE_GOAT.exe",
                message: "Программа получила права администратора."
            },
            {
                title: "WINDOWS WARNING",
                message: "Системные настройки были изменены."
            },
            {
                title: "CRITICAL FAILURE",
                message: "Попытка восстановить контроль не удалась."
            },
            {
                title: "UNKNOWN PROCESS",
                message: "Обнаружена активность из другого измерения."
            },
            {
                title: "ACCESS DENIED",
                message: "Вы больше не главный пользователь."
            }
        ];

        // Позиции окон на экране
        const windowPositions = [
            { top: "42%", left: "8%" },
            { top: "58%", left: "48%" },
            { top: "25%", left: "55%" },
            { top: "68%", left: "15%" },
            { top: "12%", left: "38%" },
            { top: "45%", left: "65%" }
        ];

        // Окна появляются по очереди
        errorWindows.forEach((error, index) => {

            setTimeout(() => {
                createErrorWindow(
                    error.title,
                    error.message,
                    windowPositions[index]
                );
            }, 700 + index * 500);

        });

        // Финальное сообщение
        setTimeout(() => {

            const finalWindow = document.createElement("div");
            finalWindow.className = "hack-final-window";

            finalWindow.innerHTML = `
                <h2>FIRE GOAT HAS TAKEN CONTROL</h2>
                <p>СИСТЕМА УСПЕШНО ЗАХВАЧЕНА.</p>
                <p>ПРЕДСКАЗАНИЕ 2027 РАЗБЛОКИРОВАНО.</p>
            `;

            windowsContainer.appendChild(finalWindow);

        }, 4100);

        // Показываем предсказание и убираем взлом
        setTimeout(() => {

            const randomIndex =
                Math.floor(Math.random() * goatPredictions.length);

            overlay.remove();

            predictionStatus.textContent =
                "FIRE GOAT SYSTEM: CONNECTION ESTABLISHED";

            predictionResult.textContent =
                goatPredictions[randomIndex];

            predictionButton.disabled = false;

        }, 5500);

    });
}

/* =================================
   NEW YEAR SNOWFALL
================================= */

const snowfall = document.querySelector(".snowfall");

if (snowfall) {
    const snowSymbols = ["❄", "❅", "❆", "✦"];

    for (let i = 0; i < 45; i++) {
        const snowflake = document.createElement("span");

        snowflake.className = "snowflake";
        snowflake.textContent =
            snowSymbols[Math.floor(Math.random() * snowSymbols.length)];

        snowflake.style.left = Math.random() * 100 + "%";
        snowflake.style.animationDuration = (6 + Math.random() * 10) + "s";
        snowflake.style.animationDelay = (-Math.random() * 15) + "s";
        snowflake.style.fontSize = (8 + Math.random() * 12) + "px";

        snowfall.appendChild(snowflake);
    }
}