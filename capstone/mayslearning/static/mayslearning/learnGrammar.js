document.addEventListener('DOMContentLoaded', function() {

  const csrftokenGrammar = getCookie('csrftoken');
  const mainContentDiv = document.getElementById("mainContent");
  const itemsPerPage = 1;
  var itemId = 0; // the current specific item ID

  // the function to fetch the API data
  async function fetchData() {
    try {
      const response = await fetch('/api/learnGrammar/', {
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
      learnGrammar(dataPackage);
    })
    .catch(error => {
      console.error('Error:', error.message);
    });


  // the function for the main content
  function learnGrammar(dataPackage) {
    const lastGrammarID = dataPackage.lastGrammarID;
    let dataReceived = dataPackage.data_list;
    var currentPage = 1;
    // conditionally assign the last page number 
    if (lastGrammarID === null || lastGrammarID === undefined) {
      console.log("dataID is null or undefined");
    } else {
      currentPage = dataReceived.findIndex(item => item.id === lastGrammarID); // find the object with 'id' equal to 'lastGrammarID' in the data array, and return its index
      currentPage++; // doing this because index starts from 0
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

      const textContentDiv = document.createElement("div");
      textContentDiv.className = 'text-content grammar';
    
      // create the title div element
      const titleDiv = document.createElement("div");
      titleDiv.classList.add("grammar", "title");
      titleDiv.textContent = data.title;
      textContentDiv.appendChild(titleDiv);
    
      // create the grammar div element
      const grammarDiv = document.createElement("div");
      grammarDiv.classList.add("text", "grammar");
      grammarDiv.textContent = data.grammar;
      textContentDiv.appendChild(grammarDiv);
    
      // create div elements for sentences and translations
      for (const sentenceData of data.sentences) {
        const sentenceDiv = document.createElement("div");
        sentenceDiv.classList.add("sentence", "grammar");
        sentenceDiv.textContent = sentenceData.sentence;
        // if there is audio, then implement an audio player
        if (sentenceData.audio.id) {
          sentenceDiv.appendChild(createAudioPlayer(sentenceData));
        }
    
        const translationDiv = document.createElement("div");
        translationDiv.classList.add("translation", "grammar");
        translationDiv.textContent = sentenceData.translation;
    
        // Add the sentence and translation divs to the display board
        textContentDiv.appendChild(sentenceDiv);
        textContentDiv.appendChild(translationDiv);
      }
    
      // Create the note div element
      const noteDiv = document.createElement("div");
      noteDiv.classList.add("note", "grammar");
      noteDiv.textContent = data.note;
      textContentDiv.appendChild(noteDiv);

      mainContentDiv.appendChild(textContentDiv);
    }
  }

    
      
  // Add event listeners to the showHideTrans button
  const showHideTransButton = document.querySelector(".showHideTrans");
  const showHideOriginalButton = document.querySelector(".showHideOriginal");

  showHideTransButton.addEventListener("click", () => {
    const sentenceTrans = document.querySelectorAll(".translation");

    sentenceTrans.forEach(element => {
      if (element.classList.contains("d-none")) {
        element.classList.remove("d-none"); // "d-none" is short for "display: none"
        showHideTransButton.textContent = "Hide Chinese";
      } else {
        element.classList.add("d-none");
        showHideTransButton.textContent = "Show Chinese";
      }
    });
  });

  showHideOriginalButton.addEventListener("click", () => {
    const sentence = document.querySelectorAll(".sentence");

    sentence.forEach(element => {
      if (element.classList.contains("d-none")) {
        element.classList.remove("d-none");
        showHideOriginalButton.textContent = "Hide English";
      } else {
        element.classList.add("d-none");
        showHideOriginalButton.textContent = "Show English";
      }
    });
  });

  

  // create a study record
  const itemType = 'grammar';
  window.addEventListener('beforeunload', function(event) {
    sendTimingData(startTime, itemId, itemType, csrftokenGrammar); // create a study record of time length
  });

  // focal learning functionality
  const focalLearningBtn = document.querySelector(".focalLearning");
  focalLearningBtn.addEventListener('click', () => {
    createFocalItems(itemType, itemId, csrftokenGrammar); // create a focal learning record
  });


});