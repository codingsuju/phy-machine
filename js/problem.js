/* =========================================================
   PHY MACHINE
   Individual Problem
   ========================================================= */


/* ---------------------------------------------------------
   Topic files
   --------------------------------------------------------- */

const topicFiles = [

    "data/basics_superconductivity.json",

    "data/gl_theory.json",

    "data/bcs_theory.json"

];



/* ---------------------------------------------------------
   Problem container
   --------------------------------------------------------- */

const problemPage =
    document.getElementById("problemPage");



/* =========================================================
   GET PROBLEM ID FROM URL
   ========================================================= */

const params =
    new URLSearchParams(window.location.search);

const problemId =
    params.get("id");



/* =========================================================
   LOAD PROBLEM
   ========================================================= */

async function loadProblem() {

    try {

        const responses = await Promise.all(

            topicFiles.map(file =>
                fetch(file).then(response => response.json())
            )

        );


        let foundProblem = null;


        responses.forEach(topic => {

            topic.problems.forEach(problem => {

                if (problem.id === problemId) {

                    foundProblem = {

                        ...problem,

                        topic: topic.topic

                    };

                }

            });

        });


        if (!foundProblem) {

            showNotFound();

            return;

        }


        renderProblem(foundProblem);

    }

    catch (error) {

        console.error(error);

        problemPage.innerHTML = `

            <div class="alert alert-danger">

                Unable to load this problem.

            </div>

        `;

    }

}



/* =========================================================
   RENDER PROBLEM
   ========================================================= */

function renderProblem(problem) {

    const options =
        buildOptions(problem);

    problemPage.innerHTML = `

        <div class="problem-page">


            <!-- Topic -->

            <div class="text-secondary mb-2">

                ${problem.topic}

            </div>


            <!-- Title -->

            <h1 class="problem-page-title">

                ${problem.title}

            </h1>


            <!-- Metadata -->

            <div class="problem-meta text-secondary mt-3">

                Difficulty:
                <strong>${problem.difficulty}</strong>

            </div>


            <hr class="my-4">


            <!-- Problem -->

            <h5 class="fw-semibold">

                Problem

            </h5>


            <div class="problem-statement">

                ${problem.statement}

            </div>


            <!-- Answer -->

            <div class="mt-5">

                <h5 class="fw-semibold">

                    Choose an answer

                </h5>


                <div class="answer-options mt-3">

                    ${options.map((option, index) => `

                        <button
                            type="button"
                            class="btn btn-outline-dark answer-option"
                            data-answer="${option.value}"
                        >
                            ${option.label}
                        </button>

                    `).join("")}

                </div>


                <!-- Result -->

                <div
                    id="result"
                    class="mt-3 result-box"
                ></div>

            </div>


        </div>

    `;


    document
        .querySelectorAll(".answer-option")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => checkAnswer(
                    problem,
                    Number(button.dataset.answer),
                    button
                )
            );

        });

    typesetProblem();

}



/* =========================================================
   LATEX RENDERING
   ========================================================= */

function typesetProblem() {

    if (window.MathJax && window.MathJax.typesetPromise) {

        window.MathJax.typesetPromise([
            problemPage
        ]).catch(error => console.error(error));

    } else if (window.MathJax && window.MathJax.startup) {

        window.MathJax.startup.promise
            .then(() => typesetProblem())
            .catch(error => console.error(error));

    }

}



/* =========================================================
   ANSWER OPTIONS
   ========================================================= */

function buildOptions(problem) {

    if (Array.isArray(problem.options)) {

        return problem.options.map((label, index) => ({
            label,
            value: index
        }));

    }

    const step =
        Math.max(
            Math.abs(problem.answer) * 0.2,
            (problem.tolerance || 0) * 5,
            0.1
        );

    const values = [
        problem.answer,
        problem.answer + step,
        problem.answer - step,
        problem.answer + (step * 2)
    ];

    const offset =
        problem.id.split("").reduce(
            (total, character) => total + character.charCodeAt(0),
            0
        ) % values.length;

    return values
        .map((value, index) => ({
            value: Number(value.toPrecision(6)),
            index
        }))
        .sort((first, second) =>
            ((first.index + offset) % values.length)
            - ((second.index + offset) % values.length)
        )
        .map(option => ({
            label: formatAnswer(option.value, problem.unit),
            value: option.value
        }));

}



function formatAnswer(value, unit) {

    return `${value}${unit ? ` ${unit}` : ""}`;

}



/* =========================================================
   CHECK ANSWER
   ========================================================= */

function checkAnswer(problem, selectedAnswer, selectedButton) {

    const result =
        document.getElementById("result");

    const isCorrect =
        Array.isArray(problem.options)
            ? selectedAnswer === problem.answer
            : Math.abs(selectedAnswer - problem.answer) <= (problem.tolerance || 0);

    selectedButton.classList.remove("btn-outline-dark");
    selectedButton.classList.add(
        isCorrect ? "btn-success" : "btn-danger"
    );

    result.innerHTML = `

        <div class="alert ${isCorrect ? "alert-success" : "alert-danger"}">

            ${isCorrect ? "Correct." : "Wrong answer. Try again."}

            ${isCorrect ? `<strong>Answer: ${getCorrectAnswerLabel(problem)}</strong>` : ""}

            ${isCorrect && problem.solution ? `<p class="mb-0 mt-2">${problem.solution}</p>` : ""}

        </div>

    `;

    typesetProblem();

    if (isCorrect) {

        document
            .querySelectorAll(".answer-option")
            .forEach(button => button.disabled = true);

    }

}



function getCorrectAnswerLabel(problem) {

    if (Array.isArray(problem.options)) {

        return problem.options[problem.answer];

    }

    return formatAnswer(problem.answer, problem.unit);

}



/* =========================================================
   NOT FOUND
   ========================================================= */

function showNotFound() {

    problemPage.innerHTML = `

        <div class="alert alert-danger">

            Problem not found.

        </div>

    `;

}



/* =========================================================
   START
   ========================================================= */

loadProblem();