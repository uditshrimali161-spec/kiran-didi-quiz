let questions = [];

let currentQuestion = 0;

let answers = [];

let playerName = "";

let startTime = 0;

let timerSeconds = 300;

let timerInterval;


/*
========================================
LOAD QUESTIONS
========================================
*/

async function loadQuestions() {

    const response =
        await fetch("/api/questions");

    if (!response.ok) {

        throw new Error(
            "Could not load questions."
        );

    }

    questions =
        await response.json();
}


/*
========================================
START QUIZ
========================================
*/

async function startQuiz() {

    playerName =
        document
            .getElementById("nameInput")
            .value
            .trim();

    if (!playerName) {

        playerName =
            "Kiran Didi";

    }

    try {

        await loadQuestions();

    } catch {

        alert(
            "Questions load nahi ho paaye. Internet check karein."
        );

        return;
    }

    answers =
        new Array(
            questions.length
        ).fill(null);

    currentQuestion = 0;

    timerSeconds = 300;

    startTime = Date.now();

    document
        .getElementById("startScreen")
        .style.display =
        "none";

    document
        .getElementById("quizScreen")
        .style.display =
        "block";

    loadQuestion();

    updateTimer();

    timerInterval =
        setInterval(
            updateTimer,
            1000
        );
}


/*
========================================
TIMER
========================================
*/

function updateTimer() {

    const minutes =
        Math.floor(
            timerSeconds / 60
        );

    const seconds =
        timerSeconds % 60;

    document
        .getElementById("timer")
        .innerText =
        `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

    if (timerSeconds <= 0) {

        clearInterval(
            timerInterval
        );

        submitQuiz();

        return;
    }

    timerSeconds--;
}


/*
========================================
LOAD CURRENT QUESTION
========================================
*/

function loadQuestion() {

    const q =
        questions[
            currentQuestion
        ];

    document
        .getElementById("questionNumber")
        .innerText =
        `Question ${currentQuestion + 1}`;

    document
        .getElementById("questionCounter")
        .innerText =
        `Question ${currentQuestion + 1} of ${questions.length}`;

    document
        .getElementById("questionText")
        .innerText =
        q.question;

    document
        .getElementById("progressBar")
        .style.width =
        `${((currentQuestion + 1) / questions.length) * 100}%`;

    const container =
        document
            .getElementById("options");

    container.innerHTML = "";

    q.options.forEach(
        (option, index) => {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "option";

        button.innerText =
            `${String.fromCharCode(65 + index)}. ${option}`;

        if (
            answers[
                currentQuestion
            ] === index
        ) {

            button.classList.add(
                "selected"
            );

        }

        button.onclick =
            () => {

                answers[
                    currentQuestion
                ] = index;

                loadQuestion();

            };

        container.appendChild(
            button
        );

    });

    document
        .getElementById("previousButton")
        .style.visibility =
        currentQuestion === 0
            ? "hidden"
            : "visible";

    document
        .getElementById("nextButton")
        .innerText =
        currentQuestion ===
        questions.length - 1
            ? "Submit Quiz ✓"
            : "Next →";
}


/*
========================================
NEXT
========================================
*/

function nextQuestion() {

    if (
        currentQuestion ===
        questions.length - 1
    ) {

        submitQuiz();

        return;
    }

    currentQuestion++;

    loadQuestion();
}


/*
========================================
PREVIOUS
========================================
*/

function previousQuestion() {

    if (
        currentQuestion <= 0
    ) {

        return;
    }

    currentQuestion--;

    loadQuestion();
}


/*
========================================
SUBMIT
========================================
*/

async function submitQuiz() {

    clearInterval(
        timerInterval
    );

    const timeTaken =
        Math.floor(
            (Date.now() -
                startTime) /
            1000
        );

    const answerData =
        answers.map(
            (answer, index) => ({
                questionId:
                    questions[index].id,

                answer:
                    answer
            })
        );

    try {

        const response =
            await fetch(
                "/api/submit",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            name:
                                playerName,

                            answers:
                                answerData,

                            timeTaken
                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                "Submission failed."
            );

        }

        const data =
            await response.json();

        showResult(
            data.result
        );

    } catch (error) {

        console.error(
            error
        );

        alert(
            "Result submit nahi ho paaya. Please internet check karke dobara try karein."
        );

    }
}


/*
========================================
RESULT
========================================
*/

function showResult(result) {

    document
        .getElementById("quizScreen")
        .style.display =
        "none";

    document
        .getElementById("resultScreen")
        .style.display =
        "block";

    document
        .getElementById("resultName")
        .innerText =
        result.name;

    /*
    IMPORTANT:
    RESULT IS OUT OF 20
    */

    document
        .getElementById("resultScore")
        .innerText =
        `Score: ${result.score}/20 (${result.percentage}%)`;

    document
        .getElementById("pdfButton")
        .href =
        `/api/result/${result.id}/pdf`;

    createReview(
        result.review
    );

    createCelebration();

    window.scrollTo(
        0,
        0
    );
}


/*
========================================
ANSWER REVIEW
========================================
*/

function createReview(review) {

    const container =
        document
            .getElementById("review");

    container.innerHTML = "";

    review.forEach(
        item => {

        const div =
            document.createElement(
                "div"
            );

        /*
        Q21 gets special styling
        */

        div.className =
            item.questionId === 21
                ? "secret-review"
                : "review-item";

        let statusClass =
            item.selectedAnswer === null
                ? "not-attempted"
                : item.isCorrect
                    ? "correct"
                    : "wrong";

        let status =
            item.selectedAnswer === null
                ? "Not Attempted"
                : item.isCorrect
                    ? "✓ Correct"
                    : "✗ Wrong";

        let notCounted =
            item.questionId === 21
                ? " — Not included in score"
                : "";

        div.innerHTML = `

            <div class="review-question">

                Q${item.questionId}.
                ${escapeHtml(
                    item.question
                )}

            </div>

            <div class="answer-line">

                <b>
                    Your Answer:
                </b>

                ${
                    item.selectedText === null
                        ? "Not Attempted"
                        : escapeHtml(
                            item.selectedText
                        )
                }

            </div>

            <div class="answer-line">

                <b>
                    Correct Answer:
                </b>

                ${escapeHtml(
                    item.correctText
                )}

            </div>

            <div
                class="${statusClass}"
                style="margin-top:8px"
            >

                ${status}

                ${notCounted}

            </div>

            <div
                class="answer-line"
                style="color:#666"
            >

                <b>
                    Solution:
                </b>

                ${escapeHtml(
                    item.solution
                )}

            </div>

        `;

        container.appendChild(
            div
        );

    });
}


/*
========================================
FINAL CELEBRATION
ONLY RESULT PAGE
========================================
*/

function createCelebration() {

    const symbols =
        [
            "🎉",
            "🎊",
            "✨",
            "⭐",
            "💖",
            "🏆",
            "👑"
        ];

    for (
        let i = 0;
        i < 65;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );

        piece.innerText =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];

        piece.style.position =
            "fixed";

        piece.style.left =
            Math.random() *
            100 +
            "vw";

        piece.style.top =
            "-30px";

        piece.style.fontSize =
            (
                10 +
                Math.random() * 16
            ) +
            "px";

        piece.style.zIndex =
            "9999";

        piece.style.pointerEvents =
            "none";

        const duration =
            2 +
            Math.random() * 2;

        piece.style.transition =
            `top ${duration}s linear, transform ${duration}s linear`;

        document.body.appendChild(
            piece
        );

        requestAnimationFrame(
            () => {

                piece.style.top =
                    "110vh";

                piece.style.transform =
                    `rotate(${Math.random() * 1000}deg)`;

            }
        );

        setTimeout(
            () => {

                piece.remove();

            },
            duration * 1000 + 500
        );
    }
}


/*
========================================
HTML ESCAPE
========================================
*/

function escapeHtml(text) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}
