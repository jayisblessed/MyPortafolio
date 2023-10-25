document.addEventListener('DOMContentLoaded', function() {

    const csrftokenEngIPA = getCookie('csrftoken');
    const virtualKeyboardContainer = document.querySelector('#virtual-keyboard-container');
    const theIPAApp = document.getElementById("theIPAApp");
    // buttons to different views
    const theIPABtn = document.querySelector('#theIPA');
    theIPABtn.addEventListener('click', () => EngIPA());
    const IPAExamplesBtn = document.querySelector('#IPAExamples');
    IPAExamplesBtn.addEventListener('click', () => IPAExamples());
    const theAlphabetBtn = document.querySelector('#theAlphabet');
    theAlphabetBtn.addEventListener('click', () => theAlphabet());
    const theQuizBtn = document.querySelector('#theQuiz');
    theQuizBtn.addEventListener('click', () => theQuiz());

    var numberOfTables = 0;
    var maxCellsPerRow = 9;


    // the function to fetch the API data
    async function fetchTheData() {
        try {
            const response = await fetch('/learnEngIPA', {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                },
            });
        
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            // pause the execution until the Promise is resolved, and parse the response body as JSON
            const data = await response.json();
            return data;
        } catch (error) {
            return Promise.reject(error); // create a new rejected Promise and passes the caught error as an argument
        }
    }


    // create the table
    function createTable(data) {
        numberOfTables += 1;
        theTableID = "audioTable" + numberOfTables.toString();
        // create a new table element
        var table = document.createElement("table");
        // set the ID attribute of the table element
        table.setAttribute("id", theTableID);
        table.classList.add('EngIPATable');
        // create a caption for the table
        var caption = table.createCaption();
        // conditionally decide the titile of the table caption
        ATag = data[0].ATag;
        if (ATag == "longVowel") {
            caption.textContent = "长元音Long Vowels";
        } else if (ATag == "shortVowel") {
            caption.textContent = "短元音Short Vowels";
        } else if (ATag == "diphthong") {
            caption.textContent = "双元音Diphthongs";
        } else if (ATag == "unvoicedConsonant") {
            caption.textContent = "清辅音Unvoiced Consonants";
        } else if (ATag == "voicedConsonant") {
            caption.textContent = "浊辅音Voiced Consonants";
        }
    
        // calculate the number of rows needed
        var numberOfRows = Math.ceil(data.length / maxCellsPerRow);
    
        for (let i = 0; i < numberOfRows; i++) {
            const row = document.createElement('tr');
            // loop over the cells in the row, up to the maximum number of cells per row
            for (let j = 0; j < maxCellsPerRow; j++) {
                const index = i * maxCellsPerRow + j;
                if (index < data.length) {
                    const cell = document.createElement('td');
                    // specify the text to display
                    if (data[index].theIPA !== data[index].title) {
                        cell.textContent = data[index].title + "\n" + "/" + data[index].theIPA + "/";
                    } else {
                        cell.textContent = data[index].theIPA;
                    }
                    // specify the audio file
                    cell.setAttribute('data-audio', data[index].audioFile);
                    row.appendChild(cell);
                }
            }
            // Add the row to the table
            table.appendChild(row);
        }
        
        // add the table to the container element
        theIPAApp.appendChild(table);
    
        // add event listener to the table
        table.addEventListener('click', (event) => {
        if (event.target.hasAttribute('data-audio')) {
            const audioFile = event.target.getAttribute('data-audio');
            playAudio(audioFile);
        }
        });
    };


    // set up the audio player
    const audioPlayer = document.getElementById("audioPlayer");
    function playAudio(audioFile) {
        // set the URL of the audio file
        audioPlayer.src = audioFile;
        // trigger the loading of the audio file
        audioPlayer.load();
        // the 'canplaythrough' event indicates that the browser has enough audio data loaded to play the entire audio file without buffering
        audioPlayer.addEventListener('canplaythrough', () => {
            audioPlayer.play();
        });
    };


    // fetch the data
    fetchTheData();
    // By default, load the IPA App
    EngIPA();


    function EngIPA() {
        // hide the div 'virtualKeyboardContainer'
        virtualKeyboardContainer.style.display = 'none';
        theIPABtn.className = "btn btn-sm btn-primary"; // change the Bootstrap class name for the button
        IPAExamplesBtn.className = "btn btn-sm btn-outline-primary";
        theAlphabetBtn.className = "btn btn-sm btn-outline-primary";
        theQuizBtn.className = "btn btn-sm btn-outline-primary";
        theIPAApp.innerHTML = "";
        maxCellsPerRow = 9;
        // Call fetchTheData function. The 'then' block is executed with the resolved data passed as an argument
        fetchTheData()
            .then(data => {
                createTable(data.longVowels);
                createTable(data.shortVowels);
                createTable(data.diphthongs);
                createTable(data.unvoicedConsonants);
                createTable(data.voicedConsonants);
            })
            .catch(error => {
                console.error('Error:', error.message); // 'error.message' retrieves the error message from the error object
            });
    }
        

    function IPAExamples() {
        virtualKeyboardContainer.style.display = 'none';
        IPAExamplesBtn.className = "btn btn-sm btn-primary";
        theIPABtn.className = "btn btn-sm btn-outline-primary";
        theAlphabetBtn.className = "btn btn-sm btn-outline-primary";
        theQuizBtn.className = "btn btn-sm btn-outline-primary";
        theIPAApp.innerHTML = "";
        maxCellsPerRow = 9;
        // Call fetchTheData function. The 'then' block is executed with the resolved data passed as an argument
        fetchTheData()
            .then(data => {
                createTable(data.longVowelEx);
                createTable(data.shortVowelEx);
                createTable(data.diphthongEx);
                createTable(data.unvoicedConsonantEx);
                createTable(data.voicedConsonantEx);
            })
            .catch(error => {
                console.error('Error:', error.message); // 'error.message' retrieves the error message from the error object
            });
    }


    function theAlphabet() {
        virtualKeyboardContainer.style.display = 'none';
        theIPABtn.className = "btn btn-sm btn-outline-primary";
        IPAExamplesBtn.className = "btn btn-sm btn-outline-primary";
        theAlphabetBtn.className = "btn btn-sm btn-primary";
        theQuizBtn.className = "btn btn-sm btn-outline-primary";
        theIPAApp.innerHTML = "";
        maxCellsPerRow = 7;
        // Call fetchTheData function. The 'then' block is executed with the resolved data passed as an argument
        fetchTheData()
            .then(data => {
                createTable(data.EngAlphabet);
            })
            .catch(error => {
                console.error('Error:', error.message); // 'error.message' retrieves the error message from the error object
            });
    }


    function theQuiz() {
        virtualKeyboardContainer.style.display = 'block';
        theIPABtn.className = "btn btn-sm btn-outline-primary";
        IPAExamplesBtn.className = "btn btn-sm btn-outline-primary";
        theAlphabetBtn.className = "btn btn-sm btn-outline-primary";
        theQuizBtn.className = "btn btn-sm btn-primary";
        theIPAApp.innerHTML = "";
        var theIPAData = [];
        var IPAQuizData = [];
        
        // Call fetchTheData function. The 'then' block is executed with the resolved data passed as an argument
        fetchTheData()
            .then(data => {
                theIPAData.push(data.stress);// pushed the data into the array
                theIPAData.push(data.longVowels);
                theIPAData.push(data.shortVowels);
                theIPAData.push(data.diphthongs);
                theIPAData.push(data.unvoicedConsonants);
                theIPAData.push(data.voicedConsonants);
                IPAQuizData.push(data.longVowels);
                IPAQuizData.push(data.shortVowels);
                IPAQuizData.push(data.diphthongs);
                IPAQuizData.push(data.unvoicedConsonants);
                IPAQuizData.push(data.voicedConsonants);
                IPAQuizData.push(data.longVowelEx);
                IPAQuizData.push(data.shortVowelEx);
                IPAQuizData.push(data.diphthongEx);
                IPAQuizData.push(data.unvoicedConsonantEx);
                IPAQuizData.push(data.voicedConsonantEx);
                IPAQuizData.push(data.EngAlphabet);
                initializeKeyboard(theIPAData);
            })
            .catch(error => {
                console.error('Error:', error.message); // 'error.message' retrieves the error message from the error object
            });

        function initializeKeyboard(data) {
            const virtualKeyboard = document.createElement('div');
            virtualKeyboard.id = 'virtual-keyboard';
            virtualKeyboard.classList.add('keyboard');
            // create the input field element
            const inputFieldEle = document.createElement('input');
            inputFieldEle.type = 'text';
            inputFieldEle.id = 'answerInputField';
            inputFieldEle.readOnly = true;

            data.forEach((rowData, i) => {
                if (rowData) {
                    const rowElement = document.createElement('div');
                    rowElement.classList.add('row');
                    rowElement.id = `row-${i + 1}`;

                    rowData.forEach(element => {
                        const { title, audioFile } = element; // use object destructuring to extract specific properties from the 'element' object and assign them to variables
                        const cellElement = document.createElement('div');
                        cellElement.classList.add('key');
                        cellElement.innerText = title;
                        cellElement.dataset.audio = audioFile;
                        cellElement.addEventListener('click', () => {
                            inputFieldEle.value += title; // display the input in the input field
                            playAudio(audioFile); // play the audio when a key is pressed
                        });
                        rowElement.appendChild(cellElement);
                    });

                    virtualKeyboard.appendChild(rowElement);
                }
            });

            virtualKeyboardContainer.innerHTML = ''; // clear any existing content
            virtualKeyboardContainer.appendChild(createInputField(inputFieldEle));
            virtualKeyboardContainer.appendChild(virtualKeyboard);
        }


        function createInputField(inputFieldEle) {
            // randomly select an array
            var randomArray = IPAQuizData[Math.floor(Math.random() * IPAQuizData.length)];
            var randomElement = randomArray[Math.floor(Math.random() * randomArray.length)]; // randomly select an element in that array

            const inputContainer = document.createElement('div');
            inputContainer.id = 'input-container';

            const inputControlBar = document.createElement('div');
            inputControlBar.classList.add('IPA-control-bar');

            const resultDisplay = document.createElement('div');
            resultDisplay.id = 'quiz-result-display';
            resultDisplay.classList.add('vfd-display');
            resultDisplay.innerHTML = 'Your result.';
            inputContainer.appendChild(resultDisplay);

            const showAnswerBtn = document.createElement('button');
            showAnswerBtn.id = 'show-the-answer';
            showAnswerBtn.classList.add('IPA-control-btn','btn', 'btn-outline-info');
            showAnswerBtn.innerText = 'Show the Answer';
            inputControlBar.appendChild(showAnswerBtn);

            const nextQuestionBtn = document.createElement('button');
            nextQuestionBtn.classList.add('IPA-control-btn', 'btn', 'btn-primary');
            nextQuestionBtn.id = 'next-question';
            nextQuestionBtn.innerText = 'Next Question';
            inputControlBar.appendChild(nextQuestionBtn);

            const playButton = document.createElement('button');
            playButton.classList.add('IPA-control-btn','btn', 'btn-success');
            playButton.id = 'play-the-question';
            playButton.innerText = 'Play the Question';
            playButton.addEventListener('click', () => {
                playAudio(randomElement.audioFile);
            });
            inputControlBar.appendChild(playButton);

            inputControlBar.appendChild(inputFieldEle);

            const backspaceButton = document.createElement('button');
            backspaceButton.classList.add('IPA-control-btn', 'btn', 'btn-danger');
            backspaceButton.id = 'backspace-button';
            backspaceButton.innerText = 'Backspace';
            backspaceButton.addEventListener('click', () => {
                const inputValue = inputFieldEle.value;
                inputFieldEle.value = inputValue.slice(0, -1); // Use 'slice()' to extract a portion of a string. Here it effectivly removes the last character
            });
            inputControlBar.appendChild(backspaceButton);

            const clearButton = document.createElement('button');
            clearButton.classList.add('IPA-control-btn', 'btn', 'btn-outline-danger');
            clearButton.id = 'clear-button';
            clearButton.innerText = 'Clear';
            clearButton.addEventListener('click', () => {
                inputFieldEle.value = '';
            });
            inputControlBar.appendChild(clearButton);

            nextQuestionBtn.addEventListener('click', () => {
                resultDisplay.innerHTML = 'Your result.';
                randomArray = IPAQuizData[Math.floor(Math.random() * IPAQuizData.length)];
                randomElement = randomArray[Math.floor(Math.random() * randomArray.length)];
                playAudio(randomElement.audioFile);
                inputFieldEle.value = '';
                submitButton.disabled = false;
            });

            const submitButton = document.createElement('button');
            submitButton.classList.add('IPA-control-btn', 'btn', 'btn-primary');
            submitButton.id = 'submit-button';
            submitButton.innerText = 'Submit';

            showAnswerBtn.addEventListener('click', () => {
                playAudio(randomElement.audioFile);
                resultDisplay.innerHTML = "The correct answer is: " + randomElement.theIPA + ". Please click Next Question.";
                submitButton.disabled = true;
            });

            submitButton.addEventListener('click', () => {
                const userInput = inputFieldEle.value;    
                const the_answer = randomElement.theIPA;
                var is_correct = false;
                if (userInput === the_answer) {
                    resultDisplay.innerHTML = "Correct! ✅ Please click Next Question.";
                    is_correct = true;
                    playAudio('/media/audios/success-fanfare-trumpets-6185.mp3');
                    submitButton.disabled = true;
                } else {
                    resultDisplay.innerHTML = "incorrect! ❌";
                    playAudio('/media/audios/buzzer-or-wrong-answer-20582.mp3');
                }

                // get data ready for creating a QuestionAnswerRecord instance
                audioUrl_cleaned = randomElement.audioFile.split("/media/").pop(); // the cleaned-up audio url
                const questionAnswerData = {
                is_correct: is_correct,
                user_answer: userInput,
                questionType: 'dictation',
                difficultyLevel: 'easy',
                skillType: 'listening',
                note: 'IPA',
                question: the_answer,
                answer: the_answer,
                audio: audioUrl_cleaned,
                };
                
                fetch('/questionAnswerRecord/create/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftokenEngIPA,
                    },
                    body: JSON.stringify(questionAnswerData),
                })
                .then(response => {
                    if (response.ok) {
                    // request successful
                    return response.json();
                    } else {
                        // request failed
                        throw new Error('Failed to create question answer record');
                    }
                })
                .then(data => {
                    // handle the response data
                    console.log('Question answer record created:', data);
                })
                .catch(error => {
                    // handle any errors occurred during the request
                    console.error('Error creating question answer record:', error);
                });
                

            });
            inputControlBar.appendChild(submitButton);
            inputContainer.appendChild(inputControlBar);

            return inputContainer;
        }
        
    }

});