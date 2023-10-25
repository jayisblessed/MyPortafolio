document.addEventListener('DOMContentLoaded', function() {

  const csrftokenSentence = getCookie('csrftoken');
  const mainContentDiv = document.getElementById("mainContent");
  const itemsPerPage = 1;
  var itemId = 7;

  // the function to fetch the API data
  async function fetchData() {
    try {
      const response = await fetch('/api/learnSentences/', {
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
  
  // Call the function. The 'then' block is executed with the resolved data passed as an argument.
  fetchData()
    .then(dataPackage => {
      learnSentences(dataPackage);
    })
    .catch(error => {
      console.error('Error:', error.message); // 'error.message' retrieves the error message from the error object
    });
        

  function learnSentences(dataPackage) {
    const lastSentenceID = dataPackage.lastSentenceID;
    let dataReceived = dataPackage.data_list;
    var currentPage = 1;
    // conditionally assign the last page number
    if (lastSentenceID === null || lastSentenceID === undefined) {
      console.log("dataID is null or undefined");
    } else {
      currentPage = dataReceived.findIndex(item => item.id === lastSentenceID);
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
      // create the text content div and image div
      const textContentDiv = document.createElement("div");
      textContentDiv.className = 'text-content sentence';
      const imageDiv = document.createElement("div");
      imageDiv.className = 'image-content sentence';

      // create the elements
      const sentenceDiv = document.createElement("div");
      sentenceDiv.className = "sentence-sentence";
      sentenceDiv.textContent = data.sentence;
      const translationDiv = document.createElement("div");
      translationDiv.classList.add("translation-sentence");
      translationDiv.textContent = data.translation;
  
      // add the elements to the textContent div
      textContentDiv.appendChild(sentenceDiv);

      // if there is audio, implement an audio player
      if (data.audio.id) {
        textContentDiv.appendChild(createAudioPlayer(data));
      }

      textContentDiv.appendChild(translationDiv);
      // append the text content div to the main content div
      mainContentDiv.appendChild(textContentDiv);
      // if an image exists, create the image div and append it to the main content div
      if (data.image.url) {
        const i_div = document.createElement("div");
        const img = document.createElement("img");
        img.src = data.image.url;
        img.className = "sentence-image sentence";
        img.alt = "sentence picture";
        img.loading = "lazy"; // defer the loading until it is about to be displayed in the viewport
        i_div.appendChild(img); // append the image element to i_div
        imageDiv.appendChild(i_div); // add i_div to imageDiv
      }
      mainContentDiv.appendChild(imageDiv);
    }
  }

  // Add event listeners to the Show/Hide buttons
  const showHideTransButton = document.querySelector(".showHideTrans");
  const showHideOriginalButton = document.querySelector(".showHideOriginal");
  
  showHideTransButton.addEventListener("click", function () {
    const sentenceTrans = document.querySelectorAll(".translation-sentence");
    sentenceTrans.forEach(function (element) {
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
    const sentence = document.querySelectorAll(".sentence-sentence");
    sentence.forEach(function (element) {
      if (element.classList.contains("d-none")) {
        element.classList.remove("d-none");
        showHideOriginalButton.textContent = "Hide English";
      } else {
        element.classList.add("d-none");
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
    const standardAnswer = document.querySelector(".sentence-sentence").textContent.trim();

    var is_correct = false;
    if (standardAnswer === userAnswerText) {
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
        note: 'SENTENCE',
        question: 'Type the whole sentence.',
        answer: standardAnswer
    };
    
    fetch('/questionAnswerRecord/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftokenSentence,
        },
        body: JSON.stringify(questionAnswerData),
    })
      .then(response => {
          if (response.ok) {
          // request successful
          return response.json();
          } else {
          // request failed
          throw new Error('Failed to create an instance.');
          }
      })
      .then(data => {
          // handle the response
          console.log('Instance created:', data);
      })
      .catch(error => {
          // handle any errors that occurred during the request
          console.error('Error creating an instance:', error);
      });
  }

  // add to focal learning so as to learn it better
  const focalLearningBtn = document.querySelector(".focalLearning");
  focalLearningBtn.addEventListener('click', () => {
    createFocalItems(itemType, itemId, csrftokenSentence);
  });

  // create a study record before leaving the current page
  const itemType = 'sentence';
  window.addEventListener('beforeunload', function(event) {
    sendTimingData(startTime, itemId, itemType, csrftokenSentence); // create a timing record
  });                

});