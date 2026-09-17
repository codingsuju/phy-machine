/* =========================================================
   PHY MACHINE
   Problem Set
   ========================================================= */


/* ---------------------------------------------------------
   JSON files
   --------------------------------------------------------- */

const topicFiles = [

    "data/basics_superconductivity.json",

    "data/gl_theory.json",

    "data/bcs_theory.json"

];



/* ---------------------------------------------------------
   Elements
   --------------------------------------------------------- */

const problemContainer =
    document.getElementById("problemContainer");

const searchBox =
    document.getElementById("searchBox");



/* ---------------------------------------------------------
   Store all problems
   --------------------------------------------------------- */

let allProblems = [];



/* =========================================================
   LOAD PROBLEMS
   ========================================================= */

async function loadProblems() {

    try {

        const responses = await Promise.all(

            topicFiles.map(file =>
                fetch(file).then(response => response.json())
            )

        );


        responses.forEach(topic => {

            topic.problems.forEach(problem => {

                allProblems.push({

                    ...problem,

                    topic: topic.topic

                });

            });

        });


        renderProblems(allProblems);

    }

    catch (error) {

        console.error(error);

        problemContainer.innerHTML = `

            <div class="alert alert-danger">

                Unable to load the problem database.

            </div>

        `;

    }

}



/* =========================================================
   RENDER
   ========================================================= */

function renderProblems(problems) {

    problemContainer.innerHTML = "";


    /* Group by topic */

    const grouped = {};


    problems.forEach(problem => {

        if (!grouped[problem.topic]) {

            grouped[problem.topic] = [];

        }

        grouped[problem.topic].push(problem);

    });



    /* Create sections */

    Object.entries(grouped).forEach(
        ([topic, topicProblems]) => {


            const section =
                document.createElement("section");

            section.className =
                "topic-section";


            /* Topic title */

            const title =
                document.createElement("h2");

            title.className =
                "topic-title";

            title.textContent =
                topic;


            section.appendChild(title);



            /* Sort by difficulty */

            topicProblems.sort(
                (a, b) =>
                    a.difficulty - b.difficulty
            );



            /* Problems */

            topicProblems.forEach(problem => {

                const row =
                    document.createElement("a");

                row.className =
                    "problem-row";

                row.href =
                    `problem.html?id=${encodeURIComponent(problem.id)}`;


                row.innerHTML = `

                    <span class="problem-icon">
                        ○
                    </span>

                    <span class="problem-name">
                        ${problem.title}
                    </span>

                    <span class="problem-difficulty">
                        ${problem.difficulty}
                    </span>

                `;


                section.appendChild(row);

            });


            problemContainer.appendChild(section);

        }
    );

}



/* =========================================================
   SEARCH
   ========================================================= */

searchBox.addEventListener(
    "input",
    function () {

        const query =
            searchBox.value
                .trim()
                .toLowerCase();


        if (!query) {

            renderProblems(allProblems);

            return;

        }


        const filtered =
            allProblems.filter(problem =>

                problem.title
                    .toLowerCase()
                    .includes(query)

                ||

                problem.topic
                    .toLowerCase()
                    .includes(query)

                ||

                problem.id
                    .toLowerCase()
                    .includes(query)

            );


        renderProblems(filtered);

    }
);



/* =========================================================
   START
   ========================================================= */

loadProblems();