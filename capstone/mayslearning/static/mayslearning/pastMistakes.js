document.addEventListener('DOMContentLoaded', function() {

  const mainContentDiv = document.querySelector(".mainContentDiv");
  var currentPage = 1;
  const itemsPerPage = 5;

  // the function to fetch the API data
  async function fetchData() {
    try {
      const response = await fetch('/api/pastMistakes/', {
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
      
  fetchData()
    .then(dataPackage => {
      const dataReceived = dataPackage.data_list;
      paginationA(dataReceived, currentPage, itemsPerPage, createContent, mainContentDiv);
    })
    .catch(error => {
      console.error('Error:', error);
    });

    
  function createContent(data) {
    // if there is no data, show a neat 'No data.' notification
    if (data == null) {
      const noData = document.createElement('h3');
      noData.className = "no-data";
      noData.textContent = 'No data.';
      mainContentDiv.appendChild(noData);
    } else {
      // create the card element
      const card = document.createElement('div');
      card.className = 'card mistake';
      // create the card body
      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');
      // create the content elements
      const mistakeCountDiv = document.createElement("div");
      mistakeCountDiv.classList.add("mistake-count");
      const questionDiv = document.createElement("div");
      questionDiv.classList.add("question-mistake");
      const answerDiv = document.createElement("div");
      answerDiv.classList.add("answer-mistake");
      const userAnswerDiv = document.createElement("div");
      userAnswerDiv.className = "user-answer mistake";
      const timestampDiv = document.createElement("div");
      timestampDiv.classList.add("timestamp");

      mistakeCountDiv.textContent = data.mistakeCount;
      questionDiv.textContent = data.question;
      answerDiv.textContent = data.answer;
      userAnswerDiv.textContent = data.userAnswer;
      timestampDiv.textContent = data.timestamp;

      cardBody.appendChild(mistakeCountDiv);
      cardBody.appendChild(questionDiv);
      
      // conditionally create the audio player element
      if (data.audio.id) {
        const audioPlayer = createAudioPlayer(data);
        cardBody.appendChild(audioPlayer);
      };

      cardBody.appendChild(answerDiv);
      cardBody.appendChild(userAnswerDiv);
      cardBody.appendChild(timestampDiv);

      // append the card body to the card
      card.appendChild(cardBody);
      // append the card to the container
      mainContentDiv.appendChild(card);
    }
  }
      
});