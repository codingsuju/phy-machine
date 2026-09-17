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

                ${problem.statement || "The problem statement will be added soon."}

            </div>


            <!-- Answer -->

            <div class="mt-5">

                <h5 class="fw-semibold">

                    Answer

                </h5>


                <div class="input-group answer-box mt-3">

                    <input
                        type="number"
                        id="answerInput"
                        class="form-control"
                        placeholder="Enter your answer"
                        ${problem.answer === undefined ? "disabled" : ""}
                    >

                    <button
                        class="btn btn-dark"
                        id="submitButton"
                        ${problem.answer === undefined ? "disabled" : ""}
                    >
                        Submit
                    </button>

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
        .getElementById("submitButton")
        .addEventListener(
            "click",
            () => checkAnswer(problem)
        );

}



/* =========================================================
   CHECK ANSWER
   ========================================================= */

function checkAnswer(problem) {

    const input =
        document.getElementById("answerInput");

    const result =
        document.getElementById("result");


    const userAnswer =
        parseFloat(input.value);


    if (Number.isNaN(userAnswer)) {

        result.innerHTML = `

            <div class="alert alert-warning">

                Please enter an answer.

            </div>

        `;

        return;

    }


    if (problem.answer === undefined) {

        result.innerHTML = `

            <div class="alert alert-secondary">

                Answer checking will be enabled when the problem is added.

            </div>

        `;

        return;

    }


    const isCorrect =
        Math.abs(userAnswer - problem.answer) <= (problem.tolerance || 0);

    result.innerHTML = `

        <div class="alert ${isCorrect ? "alert-success" : "alert-danger"}">

            ${isCorrect ? "Correct." : "Not quite. Try again."}

            ${isCorrect && problem.unit ? `<strong>Answer: ${problem.answer} ${problem.unit}</strong>` : ""}

        </div>

    `;

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