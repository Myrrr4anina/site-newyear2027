/* ==========================================
   CYBER GOAT 2027
   ЧАСТЬ 0. ОБЩИЕ ПОМОЩНИКИ
========================================== */

// Если у человека включено «уменьшить движение», мы не показываем лишние эффекты
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Безопасное чтение и запись в память браузера
// (в приватном режиме localStorage может не работать, поэтому try / catch)
function readSaved(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function writeSaved(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // Ничего страшного: просто не сохраним рекорд
    }
}

// Честное перемешивание списка (алгоритм Фишера — Йетса)
function shuffle(list) {
    const result = [...list];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

/* ==========================================
   ЧАСТЬ 1. ОБРАТНЫЙ ОТСЧЁТ
========================================== */

// Находим элементы таймера на главной странице
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const countdownTitle = document.getElementById("countdown-title");

// Проверяем, есть ли таймер на текущей странице
if (daysElement && hoursElement && minutesElement && secondsElement) {

    // Дата наступления Нового года
    const newYearDate = new Date("2027-01-01T00:00:00");

    // Таймер объявляем заранее, чтобы его можно было остановить
    let countdownTimer;

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

            if (countdownTitle) {
                countdownTitle.textContent = "С НОВЫМ 2027 ГОДОМ! 🎆";
            }

            clearInterval(countdownTimer);
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
    countdownTimer = setInterval(updateCountdown, 1000);
}

/* ==========================================
   ЧАСТЬ 2. MEMORY.exe
========================================== */

// Находим элементы игры
const memoryGame = document.getElementById("memory-game");
const memoryMessage = document.getElementById("memory-message");
const restartMemoryButton = document.getElementById("restart-memory");
const memoryMovesElement = document.getElementById("memory-moves");
const memoryTimeElement = document.getElementById("memory-time");
const memoryBestElement = document.getElementById("memory-best");

// Запускаем игру только на странице с MEMORY
if (memoryGame && memoryMessage && restartMemoryButton) {

    // Символы, которые нужно найти парами, и их названия для чтения с экрана
    const memorySymbols = ["🔥", "🐐", "🎄", "🎁", "⭐", "🔔", "❄️", "🍊"];

    const memoryNames = {
        "🔥": "огонь",
        "🐐": "коза",
        "🎄": "ёлка",
        "🎁": "подарок",
        "⭐": "звезда",
        "🔔": "колокольчик",
        "❄️": "снежинка",
        "🍊": "мандарин"
    };

    let firstCard = null;
    let secondCard = null;
    let lockedBoard = false;
    let matchedPairs = 0;

    // Ходы, время и лучший результат
    let memoryMoves = 0;
    let memorySeconds = 0;
    let memoryTimer = null;
    let closeCardsTimer = null;
    let bestMoves = parseInt(readSaved("cybergoat-memory-best"), 10) || null;

    // Показываем рекорд, если он уже есть
    if (bestMoves) {
        memoryBestElement.textContent = bestMoves;
    }

    // Время в формате 1:05
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    }

    // Останавливаем секундомер
    function stopMemoryTimer() {
        clearInterval(memoryTimer);
        memoryTimer = null;
    }

    // Показываем карточку открытой или закрытой
    function openCard(card) {
        card.textContent = card.dataset.symbol;
        card.classList.add("open");
        card.setAttribute(
            "aria-label",
            "Карточка: " + memoryNames[card.dataset.symbol]
        );
    }

    function closeCard(card) {
        card.textContent = "?";
        card.classList.remove("open");
        card.setAttribute("aria-label", "Закрытая карточка");
    }

    // Создаём игровое поле
    function createMemoryGame() {

        // Сбрасываем состояние игры, в том числе таймеры,
        // чтобы перезапуск посреди хода ничего не ломал
        clearTimeout(closeCardsTimer);
        stopMemoryTimer();

        memoryGame.innerHTML = "";
        memoryGame.classList.remove("won");
        firstCard = null;
        secondCard = null;
        lockedBoard = false;
        matchedPairs = 0;
        memoryMoves = 0;
        memorySeconds = 0;

        memoryMovesElement.textContent = "0";
        memoryTimeElement.textContent = "0:00";
        memoryMessage.textContent = "Найдите все одинаковые пары!";

        // Каждому символу создаём две карточки
        const cards = shuffle([...memorySymbols, ...memorySymbols]);

        cards.forEach((symbol) => {

            const card = document.createElement("button");

            card.className = "memory-card";
            card.type = "button";
            card.textContent = "?";
            card.dataset.symbol = symbol;
            card.setAttribute("aria-label", "Закрытая карточка");

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

                // Секундомер запускается с первого нажатия
                if (!memoryTimer) {
                    memoryTimer = setInterval(() => {
                        memorySeconds++;
                        memoryTimeElement.textContent = formatTime(memorySeconds);
                    }, 1000);
                }

                // Показываем символ
                openCard(card);

                // Запоминаем первую карточку
                if (!firstCard) {
                    firstCard = card;
                    return;
                }

                // Запоминаем вторую карточку и считаем ход
                secondCard = card;
                memoryMoves++;
                memoryMovesElement.textContent = memoryMoves;

                // Проверяем совпадение
                if (firstCard.dataset.symbol === secondCard.dataset.symbol) {

                    firstCard.classList.add("matched");
                    secondCard.classList.add("matched");

                    firstCard.setAttribute(
                        "aria-label",
                        "Пара найдена: " + memoryNames[firstCard.dataset.symbol]
                    );
                    secondCard.setAttribute(
                        "aria-label",
                        "Пара найдена: " + memoryNames[secondCard.dataset.symbol]
                    );

                    matchedPairs++;

                    firstCard = null;
                    secondCard = null;

                    // Проверяем, найдены ли все пары
                    if (matchedPairs === memorySymbols.length) {
                        stopMemoryTimer();
                        memoryGame.classList.add("won");

                        let text =
                            `ПОБЕДА! ${memoryMoves} ходов за ${formatTime(memorySeconds)} 🔥🐐`;

                        // Обновляем рекорд, если он побит
                        if (!bestMoves || memoryMoves < bestMoves) {
                            bestMoves = memoryMoves;
                            writeSaved("cybergoat-memory-best", String(bestMoves));
                            memoryBestElement.textContent = bestMoves;
                            text += " НОВЫЙ РЕКОРД!";
                        }

                        memoryMessage.textContent = text;
                    }

                } else {

                    // Временно блокируем игровое поле
                    lockedBoard = true;

                    // Запоминаем именно эти две карточки,
                    // чтобы закрыть их через небольшую паузу
                    const cardsToClose = [firstCard, secondCard];
                    firstCard = null;
                    secondCard = null;

                    closeCardsTimer = setTimeout(() => {
                        cardsToClose.forEach(closeCard);
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

    // Возможные результаты вращения. Порядок важен:
    // первый результат лежит в первом секторе, и так далее по часовой стрелке
    const wheelResults = [
        "Вас ждёт год ярких приключений! 🔥",
        "В новом году исполнится маленькое желание! ⭐",
        "Вас ждёт приятный сюрприз! 🎁",
        "Год будет полон новых идей! 💡",
        "Время для смелых начинаний! 🐐",
        "Пусть удача будет на вашей стороне! 🍀"
    ];

    // Значки на секторах колеса (в том же порядке)
    const wheelIcons = ["🔥", "⭐", "🎁", "💡", "🐐", "🍀"];

    // Размер одного сектора в градусах
    const sectorSize = 360 / wheelResults.length;

    // Раскладываем значки по секторам
    wheelIcons.forEach((icon, index) => {
        const label = document.createElement("span");

        label.className = "wheel-label";
        label.textContent = icon;
        label.style.setProperty("--angle", (index * sectorSize + sectorSize / 2) + "deg");

        fortuneWheel.appendChild(label);
    });

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

        // Чуть смещаем остановку внутри сектора, чтобы не всегда в самую середину
        const offsetInSector = Math.floor(Math.random() * 41) - 20;

        // Указатель стоит сверху, а колесо крутится по часовой стрелке.
        // Чтобы наверху оказался нужный сектор, колесо должно остановиться
        // на угле (360 - середина сектора), поэтому считаем его заранее.
        const sectorMiddle = resultIndex * sectorSize + sectorSize / 2 + offsetInSector;
        const targetAngle = (360 - sectorMiddle + 360) % 360;
        const currentAngle = wheelRotation % 360;
        const turnToTarget = (targetAngle - currentAngle + 360) % 360;

        // Пять полных оборотов плюс доворот до нужного сектора
        wheelRotation += 1800 + turnToTarget;

        // Вращаем колесо
        fortuneWheel.style.transform = `rotate(${wheelRotation}deg)`;

        // Ждём окончания анимации
        setTimeout(() => {

            wheelMessage.textContent = wheelResults[resultIndex];

            spinWheelButton.disabled = false;
            wheelIsSpinning = false;

        }, reduceMotion ? 100 : 4100);
    });
}

/* ==========================================
   ЧАСТЬ 4. NEW YEAR QUIZ
========================================== */

// Находим элементы викторины
const quizContainer = document.getElementById("quiz-container");
const quizProgress = document.getElementById("quiz-progress");
const quizBarFill = document.getElementById("quiz-bar-fill");
const quizQuestion = document.getElementById("question");
const quizAnswers = document.getElementById("answers");
const quizMessage = document.getElementById("quiz-message");
const nextQuestionButton = document.getElementById("next-question");
const quizBestElement = document.getElementById("quiz-best");

// Запускаем викторину только на нужной странице
if (
    quizContainer &&
    quizProgress &&
    quizQuestion &&
    quizAnswers &&
    quizMessage &&
    nextQuestionButton
) {

    // Все вопросы. В каждой игре берём из них пять случайных.
    // correct — номер правильного ответа в списке answers
    const allQuestions = [
        {
            question: "Какое животное правит по восточному календарю в 2027 году?",
            answers: ["Коза", "Лошадь", "Обезьяна", "Дракон"],
            correct: 0
        },
        {
            question: "Какая стихия у года 2027?",
            answers: ["Вода", "Огонь", "Земля", "Металл"],
            correct: 1
        },
        {
            question: "Через сколько лет повторяется сочетание животного и стихии?",
            answers: ["12", "30", "60", "100"],
            correct: 2
        },
        {
            question: "Сколько животных в восточном календаре?",
            answers: ["5", "10", "12", "16"],
            correct: 2
        },
        {
            question: "В каком году была предыдущая Огненная Коза?",
            answers: ["1947", "1967", "1979", "1991"],
            correct: 1
        },
        {
            question: "Что бьёт в новогоднюю полночь на Спасской башне Кремля?",
            answers: ["Будильник", "Барабаны", "Куранты", "Сирена"],
            correct: 2
        },
        {
            question: "Какой салат традиционно готовят на Новый год?",
            answers: ["Цезарь", "Оливье", "Греческий", "Корейский"],
            correct: 1
        },
        {
            question: "Как зовут внучку Деда Мороза?",
            answers: ["Золушка", "Алёнушка", "Снегурочка", "Василиса"],
            correct: 2
        },
        {
            question: "Какой фильм по традиции смотрят в новогодние дни?",
            answers: ["Титаник", "Терминатор", "Властелин колец", "Ирония судьбы"],
            correct: 3
        },
        {
            question: "Что обычно запускают в небо в новогоднюю ночь?",
            answers: ["Воздушные шары", "Фейерверки", "Бумажные самолётики", "Мыльные пузыри"],
            correct: 1
        }
    ];

    // Сколько вопросов задаём за одну игру
    const questionsPerGame = 5;

    // Берём пять случайных вопросов и перемешиваем варианты ответов
    function pickQuestions() {
        return shuffle(allQuestions)
            .slice(0, questionsPerGame)
            .map((item) => {
                const rightAnswer = item.answers[item.correct];
                const mixedAnswers = shuffle(item.answers);

                return {
                    question: item.question,
                    answers: mixedAnswers,
                    correct: mixedAnswers.indexOf(rightAnswer)
                };
            });
    }

    // Переменные состояния викторины
    let quizQuestions = pickQuestions();
    let currentQuestion = 0;
    let quizScore = 0;
    let answerSelected = false;
    let bestScore = parseInt(readSaved("cybergoat-quiz-best"), 10);

    // Показываем лучший результат
    function showBestScore() {
        if (quizBestElement && !isNaN(bestScore)) {
            quizBestElement.textContent =
                `ЛУЧШИЙ РЕЗУЛЬТАТ: ${bestScore} / ${questionsPerGame}`;
        }
    }

    // Двигаем полосу прогресса
    function updateQuizBar(done) {
        if (quizBarFill) {
            quizBarFill.style.width = (done / quizQuestions.length * 100) + "%";
        }
    }

    // Показываем текущий вопрос
    function showQuestion() {

        answerSelected = false;

        quizProgress.textContent =
            `ВОПРОС ${currentQuestion + 1} / ${quizQuestions.length}`;

        updateQuizBar(currentQuestion);

        quizQuestion.textContent =
            quizQuestions[currentQuestion].question;

        quizAnswers.innerHTML = "";
        quizMessage.textContent = "";

        nextQuestionButton.disabled = true;

        // На последнем вопросе кнопка ведёт к результату
        nextQuestionButton.textContent =
            currentQuestion === quizQuestions.length - 1
                ? "УЗНАТЬ РЕЗУЛЬТАТ"
                : "СЛЕДУЮЩИЙ ВОПРОС";

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
                nextQuestionButton.focus();
            });

            quizAnswers.appendChild(answerButton);
        });
    }

    // Показываем итог викторины
    function finishQuiz() {

        quizProgress.textContent = "СИСТЕМА ЗАВЕРШЕНА";
        updateQuizBar(quizQuestions.length);

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

        // Запоминаем лучший результат
        if (isNaN(bestScore) || quizScore > bestScore) {
            bestScore = quizScore;
            writeSaved("cybergoat-quiz-best", String(bestScore));
        }

        showBestScore();

        nextQuestionButton.textContent = "ПРОЙТИ ЕЩЁ РАЗ";
        nextQuestionButton.disabled = false;

        // Показываем секретное предсказание
        const predictionSection =
            document.getElementById("prediction-section");

        if (predictionSection) {
            predictionSection.hidden = false;
            predictionSection.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "center"
            });
        }
    }

    // Одна кнопка отвечает и за переход, и за повторный запуск
    nextQuestionButton.addEventListener("click", () => {

        // Если викторина закончилась — начинаем заново с новым набором вопросов
        if (currentQuestion >= quizQuestions.length) {

            quizQuestions = pickQuestions();
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
                predictionStatus.textContent = "SECRET CONNECTION ESTABLISHED";
            }

            if (predictionResult) {
                predictionResult.textContent = "ВАШЕ ПРЕДСКАЗАНИЕ ОЖИДАЕТ ВАС...";
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
    showBestScore();
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

    // Все таймеры взлома храним в списке,
    // чтобы можно было остановить всё разом кнопкой «Пропустить»
    let hackTimers = [];

    function later(action, delay) {
        hackTimers.push(setTimeout(action, delay));
    }

    // Показываем само предсказание
    function showPrediction() {

        const randomIndex =
            Math.floor(Math.random() * goatPredictions.length);

        predictionStatus.textContent =
            "FIRE GOAT SYSTEM: CONNECTION ESTABLISHED";

        predictionResult.textContent =
            goatPredictions[randomIndex];

        predictionButton.disabled = false;
    }

    // Закрываем экран взлома (по таймеру, по кнопке или по Esc)
    function stopHack() {

        hackTimers.forEach(clearTimeout);
        hackTimers = [];

        document.body.classList.remove("system-glitch");
        document.removeEventListener("keydown", closeHackOnEscape);

        const overlay = document.getElementById("cyber-hack-overlay");

        if (overlay) {
            overlay.remove();
        }

        showPrediction();
    }

    function closeHackOnEscape(event) {
        if (event.key === "Escape") {
            stopHack();
        }
    }

    // Запускаем экран взлома
    function startHack() {

        // Сбой страницы заканчивается, начинается терминал
        document.body.classList.remove("system-glitch");

        // Создаём экран взлома
        const overlay = document.createElement("div");
        overlay.id = "cyber-hack-overlay";
        overlay.classList.add("active");
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-label", "Анимация взлома. Нажмите Escape, чтобы пропустить");

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
            <div id="hack-windows"></div>
            <button type="button" class="hack-skip" id="hack-skip">ПРОПУСТИТЬ (Esc)</button>`;

        document.body.appendChild(overlay);

        const linesContainer = overlay.querySelector("#hack-lines");
        const windowsContainer = overlay.querySelector("#hack-windows");
        const errorCounter = overlay.querySelector("#hack-error-counter");
        const skipButton = overlay.querySelector("#hack-skip");

        let createdErrors = 0;

        // Пропустить можно кнопкой или клавишей Esc
        skipButton.addEventListener("click", stopHack);
        document.addEventListener("keydown", closeHackOnEscape);
        skipButton.focus();

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
            later(() => {
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
            {
                title: "FIRE_GOAT.exe",
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

            later(() => {
                createErrorWindow(
                    error.title,
                    error.message,
                    windowPositions[index]
                );
            }, 700 + index * 500);

        });

        // Финальное сообщение
        later(() => {

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
        later(stopHack, 5500);
    }

    predictionButton.addEventListener("click", () => {

        if (predictionButton.disabled) return;

        predictionButton.disabled = true;
        predictionResult.textContent = "";

        // Тем, у кого включено «уменьшить движение», взлом не показываем:
        // там много миганий и тряски
        if (reduceMotion) {
            showPrediction();
            return;
        }

        predictionStatus.textContent = "UNAUTHORIZED ACCESS DETECTED";

        // Сначала сайт «ломается» (стили .system-glitch), потом открывается терминал
        document.body.classList.add("system-glitch");
        later(startHack, 900);
    });
}

/* =================================
   NEW YEAR SNOWFALL
================================= */

const snowfall = document.querySelector(".snowfall");

// Снег не показываем, если человек просил поменьше движения
if (snowfall && !reduceMotion) {
    const snowSymbols = ["❄", "❅", "❆", "✦"];

    // На телефонах снежинок поменьше, чтобы не тормозило
    const snowflakesCount = window.innerWidth < 600 ? 25 : 45;

    for (let i = 0; i < snowflakesCount; i++) {
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
