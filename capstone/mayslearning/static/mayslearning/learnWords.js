document.addEventListener('DOMContentLoaded', function() {

  const mainContentDiv = document.getElementById("mainContentDiv");
  const csrftokenWord = getCookie('csrftoken');
  const itemsPerPage = 1;
  var itemId = 0;

  // the function to fetch the API data
  async function fetchData() {
    try {
      const response = await fetch('/api/learnWords/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      // pause the execution until the Promise is resolved, and parse the response body as JSON
      const dataPackage = await response.json();
      return dataPackage;
    } catch (error) {
      return Promise.reject(error); // create a new rejected Promise and passes the caught error as an argument
    }
  }

  // Call the function. The 'then' block is executed with the resolved data passed as an argument
  fetchData()
    .then(dataPackage => {
      learnWords(dataPackage);
    })
    .catch(error => {
      console.error('Error:', error.message);
    });


  function learnWords(dataPackage) {
    const lastWordID = dataPackage.lastWordID;
    let dataReceived = dataPackage.data_list;
    var currentPage = 1;
    // conditionally assign the last page number 
    if (lastWordID === null || lastWordID === undefined) {
      console.log("dataID is null or undefined");
    } else {
      currentPage = dataReceived.findIndex(item => item.id === lastWordID);
      currentPage++;
    }
    paginationA(dataReceived, currentPage, itemsPerPage, createContent, mainContentDiv);
  }

    
  function createContent(data) {
    // if there is no data, show a neat 'No data.' notification
    if (data == null) {
      const noData = document.createElement('h3');
      noData.className = "no-data";
      noData.textContent = 'No data.';
      mainContentDiv.appendChild(noData);
    } else {
      itemId = data.id; // update the itemId with the current item ID

      // create a table and a tbody
      const table = document.createElement("table");
      table.className = "table";
      const tbody = document.createElement("tbody");

      const textContentDiv = document.createElement("div");
      textContentDiv.className = 'text-content word';
      const imageDiv = document.createElement("div");
      imageDiv.className = 'image-content word';

      // create the title row
      const trTitle = document.createElement("tr");
      const tdTitle = document.createElement("td");
      const h1 = document.createElement("h1");
      h1.className = "wordTitle";
      h1.textContent = data.word;
      tdTitle.appendChild(h1);
      trTitle.appendChild(tdTitle);
      tbody.appendChild(trTitle);
      
      // create the row for theIPA
      const trTheIPA = document.createElement("tr");
      const tdTheIPAValue = document.createElement("td");
      tdTheIPAValue.className = "theIPA";
      tdTheIPAValue.textContent = '/' + data.theIPA + '/';
      trTheIPA.appendChild(tdTheIPAValue);
      tbody.appendChild(trTheIPA);

      // if there is audio, create an audio player
      if (data.audio.id) {
        tbody.appendChild(createAudioPlayer(data));
      }
      
      // create the rows for explanations and sentences
      for (const explanation of data.explanations) {
        const trWordClass = document.createElement("tr");
        const tdWordClass = document.createElement("td");
        tdWordClass.className = "wordClass text-primary";
        tdWordClass.textContent = explanation.wordClass;
        trWordClass.appendChild(tdWordClass);
        tbody.appendChild(trWordClass);
    
        const trExplanation = document.createElement("tr");
        const tdExplanation = document.createElement("td");
        tdExplanation.className = "text-primary explanation";
        tdExplanation.textContent = explanation.explanation;
        const tdExplanationTrans = document.createElement("td");
        tdExplanationTrans.className = "text-primary expTranslation";
        tdExplanationTrans.textContent = explanation.explanationTranslation;
        trExplanation.appendChild(tdExplanation);
        trExplanation.appendChild(tdExplanationTrans);
        tbody.appendChild(trExplanation);
    
        for (const sentence of explanation.sentences) {
          const trSen = document.createElement("tr");
          const tdSen = document.createElement("td");
          tdSen.className = "text-success sentence";
          tdSen.textContent = sentence.sentence;
          if (sentence.audio.id) {
            tdSen.appendChild(createAudioPlayer(sentence));
          }
          const tdSenTrans = document.createElement("td");
          tdSenTrans.className = "text-success senTranslation";
          tdSenTrans.textContent = sentence.translation;
          trSen.appendChild(tdSen);
          trSen.appendChild(tdSenTrans);
          tbody.appendChild(trSen);
        }
      }
      
      // add the table to textContentDiv
      textContentDiv.appendChild(table.appendChild(tbody));
      mainContentDiv.appendChild(textContentDiv);
      // if an image exists, create the image div and append it to the main content div
      if (data.image.url) {
        // create the image div
        const i_div = document.createElement("div");
        const img = document.createElement("img");
        img.src = data.image.url;
        img.className = "image-word";
        img.alt = "word picture";
        img.loading = "lazy"; // defer the loading until it is about to be displayed in the viewport
        i_div.appendChild(img); // append the image element to i_div
        imageDiv.appendChild(i_div); // add i_div to imageDiv
      }
      mainContentDiv.appendChild(imageDiv);
    }
  }
  
  // add event listeners to the Show/Hide buttons
  const showHideTransButton = document.querySelector(".showHideTrans");
  const showHideOriginalButton = document.querySelector(".showHideOriginal");

  showHideTransButton.addEventListener("click", function () {
    const explanationTrans = document.querySelectorAll(".expTranslation");
    const sentenceTrans = document.querySelectorAll(".senTranslation");

    explanationTrans.forEach((element) => {
      if (element.classList.contains("d-none")) {
        element.classList.remove("d-none");
        showHideTransButton.textContent = "Hide Chinese";
      } else {
        element.classList.add("d-none");
        showHideTransButton.textContent = "Show Chinese";
      }
    });

    sentenceTrans.forEach((element) => {
      if (element.classList.contains("d-none")) {
        element.classList.remove("d-none");
        showHideTransButton.textContent = "Hide Chinese";
      } else {
        element.classList.add("d-none");
        showHideTransButton.textContent = "Show Chinese";
      }
    });

  });

  showHideOriginalButton.addEventListener("click", function () {
    const explanation = document.querySelectorAll(".explanation");
    const sentence = document.querySelectorAll(".sentence");
    const wordTitle = document.querySelector(".wordTitle");

    if (wordTitle.style.display === 'none') {
      wordTitle.style.display = '';
    } else {
      wordTitle.style.display = 'none';
    }  

    explanation.forEach((el) => {
      if (el.classList.contains("d-none")) {
        el.classList.remove("d-none");
        showHideOriginalButton.textContent = "Hide English";
      } else {
        el.classList.add("d-none");
        showHideOriginalButton.textContent = "Show English";
      }
    });

    sentence.forEach((el) => {
      if (el.classList.contains("d-none")) {
        el.classList.remove("d-none");
        showHideOriginalButton.textContent = "Hide English";
      } else {
        el.classList.add("d-none");
        showHideOriginalButton.textContent = "Show English";
      }
    });
  });

  // the test functionality
  const refreshButton = document.getElementById('refreshButton');
  const submitButton = document.getElementById('submitButton');
  const rightOrWrongIndicator = document.getElementById('rightOrWrongIndicator');
  const userAnswerInput = document.getElementById('userAnswerInput');
  // initialize the test input view and autofocus into the input field
  document.getElementById('theTestModule').addEventListener('shown.bs.modal', function () {
    userAnswerInput.value = '';
    rightOrWrongIndicator.innerHTML = '';
    userAnswerInput.focus();
  });

  refreshButton.addEventListener('click', function () {
    userAnswerInput.value = '';
    rightOrWrongIndicator.innerHTML = '';
    userAnswerInput.focus();
  });

  submitButton.addEventListener('click', submitFunction);


  // the function to check correctness and create a Question and a QuestionAnswerRecord
  function submitFunction() {
    const userAnswerText = userAnswerInput.value.trim(); // retrieve the value entered by the user
    const standardAnswer = document.querySelector(".wordTitle").textContent.trim(); // retrieve the textContent

    var is_correct = false;
    if (standardAnswer.toLowerCase() === userAnswerText.toLowerCase()) {
      rightOrWrongIndicator.innerHTML = '正确✅';
      is_correct = true;
    } else {
      rightOrWrongIndicator.innerHTML = '错误❌';
    }

    // get the data for creating a Question and a QuestionAnswerRecord
    const questionAnswerData = {
      is_correct: is_correct,
      user_answer: userAnswerText,
      questionType: 'fill_in',
      difficultyLevel: 'easy',
      skillType: 'vocabulary',
      note: 'WORD',
      question: 'Type the word.',
      answer: standardAnswer
    };
    
    fetch('/questionAnswerRecord/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftokenWord,
      },
      body: JSON.stringify(questionAnswerData),
    })
      .then(response => {
        if (response.ok) {
          return response.json(); // request successful
        } else {
          throw new Error('Failed to create an instance.'); // request failed
        }
      })
      .then(data => {
        console.log('Instance created:', data); // handle the response
      })
      .catch(error => {
        console.error('Error creating an instance:', error); // handle any errors that occurred during the request
      });
  }

  // create a study record before leaving the current page
  const itemType = 'word';
  window.addEventListener('beforeunload', function(event) {
    sendTimingData(startTime, itemId, itemType, csrftokenWord); // create a timing record
  });

  // add to focal learning so as to learn it better
  const focalLearningBtn = document.querySelector(".focalLearning");
  focalLearningBtn.addEventListener('click', () => {
    createFocalItems(itemType, itemId, csrftokenWord);
  });

});