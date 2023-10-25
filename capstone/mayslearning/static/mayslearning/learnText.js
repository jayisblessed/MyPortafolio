document.addEventListener('DOMContentLoaded', function() {

  const csrftokenText = getCookie('csrftoken');
  const mainContentDiv = document.getElementById("mainContent");
  const theMainContentPage = document.getElementById("theMainContentPage"); // the main page
  const theTestContentPage = document.getElementById("theTestContentPage"); // the page for showing the result
  theTestContentPage.style.display = 'none'; // by default the result page is hidden
  const testContentDiv = document.getElementById("testContent");
  const testBtn = document.getElementById("testBtn");
  var userAnswerInput = '';
  var standardAnswer = '';
  var resultHeading = '';
  const itemsPerPage = 1;
  var itemId = 0;

  // the function to fetch the API data
  async function fetchData() {
    try {
      const response = await fetch('/api/learnText/', {
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
      learnText(dataPackage);
    })
    .catch(error => {
      console.error('Error:', error);
    });


  function learnText(dataPackage) {
    const lastTextID = dataPackage.lastTextID;
    dataReceived = dataPackage.data_list;
    var currentPage = 1;
    // conditionally assign the last page number 
    if (lastTextID === null || lastTextID === undefined) {
      console.log("dataID is null or undefined");
    } else {
      currentPage = dataReceived.findIndex(item => item.id === lastTextID);
      currentPage++;
    }
    paginationA(dataReceived, currentPage, itemsPerPage, createContent, mainContentDiv);
  }


  function createContent(data) {
    standardAnswer = data.text.trim(); // set up the standard answer
    itemId = data.id; // update the itemId with the current item ID

    // if there is no data, show a neat 'No data.' notification
    if (data == null) {
      const noData = document.createElement('h3');
      noData.className = "no-data";
      noData.textContent = 'No data.';
      mainContentDiv.appendChild(noData);
    } else {
      const textContentDiv = document.createElement("div");
      textContentDiv.className = 'text-content-div';
      
      // create the title div element
      const titleDiv = document.createElement("div");
      titleDiv.classList.add("learn-text-title");
      titleDiv.textContent = data.title;
      textContentDiv.appendChild(titleDiv);
      
      // create the text content element
      const textContent = document.createElement("div");
      textContent.classList.add("learn-text-content");
      textContent.textContent = data.text;
      textContentDiv.appendChild(textContent);

      mainContentDiv.appendChild(textContentDiv);
    }
  }

  // create the view for user to input an answer
  function createUserAnswerView() {
    testContentDiv.innerHTML = '';

    // create an interface for user input
    const userAnswerInput = document.createElement('div');
    userAnswerInput.className = 'user-input';
    userAnswerInput.id = 'userAnswerInput';

    const heading = document.createElement('div');
    heading.className = 'text-title';
    heading.textContent = 'Type your answer here: ';

    const textarea = document.createElement('textarea');
    textarea.className = 'form-control user-answer';
    textarea.id = 'userAnswerArea';
    textarea.name = 'userAnswerArea';
    textarea.rows = '16';
    textarea.required = true;

    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'btn-submit-cancel';

    // create a 'Cancel' button to cancel the test result interface
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancel';
    closeBtn.className = 'btn btn-secondary close';
    closeBtn.addEventListener('click', () => {
      theMainContentPage.style.display = 'block';
      theTestContentPage.style.display = 'none';
    });

    const submitButton = document.createElement('button');
    submitButton.className = 'btn btn-primary submit-answer';
    submitButton.id = 'userAnswerSubmit';
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', submitFunction);

    // append the child elements to the parent div
    buttonDiv.appendChild(closeBtn);
    buttonDiv.appendChild(submitButton);

    userAnswerInput.appendChild(heading);
    userAnswerInput.appendChild(textarea);
    userAnswerInput.appendChild(buttonDiv);

    testContentDiv.appendChild(userAnswerInput);
    // autofocus in the text field
    textarea.focus();
  }


  // create the test result interface
  function createTestResult(is_correct) {
    testContentDiv.innerHTML = '';

    const textContentDiv = document.createElement("div");
    textContentDiv.className = 'text-content';

    // create a 'Close' button to close the test result interface
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'btn btn-secondary close';
    closeBtn.addEventListener('click', () => {
      theMainContentPage.style.display = 'block';
      theTestContentPage.style.display = 'none';
    });
    textContentDiv.appendChild(closeBtn);
  
    const titleDiv = document.createElement("div");
    titleDiv.className = "text title";
    titleDiv.textContent = resultHeading;
    textContentDiv.appendChild(titleDiv);

    const heading1 = document.createElement("div");
    heading1.className = "text heading1";
    heading1.textContent = 'Standard answer:';
    textContentDiv.appendChild(heading1);
  
    const standardAnswerDiv = document.createElement("div");
    standardAnswerDiv.className = "text standard-answer";
    standardAnswerDiv.textContent = standardAnswer;
    textContentDiv.appendChild(standardAnswerDiv);

    const heading2 = document.createElement("div");
    heading2.className = "text heading2";
    heading2.textContent = 'Your answer:';
    textContentDiv.appendChild(heading2);

    const userAnswerDiv = document.createElement("div");
    userAnswerDiv.className = "text user-answer wrong";
    if (is_correct) {
      userAnswerDiv.className = "text user-answer";
    }
    userAnswerDiv.innerHTML = userAnswerInput;
    textContentDiv.appendChild(userAnswerDiv);

    testContentDiv.appendChild(textContentDiv);
  }


  // the function to check correctness and create a Question and a QuestionAnswerRecord
  function submitFunction() {
    const userAnswerArea = document.getElementById("userAnswerArea");
    userAnswerInput = userAnswerArea.value.trim(); // retrieve the value entered by the user
       
    var is_correct = false;
    if (standardAnswer === userAnswerInput) {
      resultHeading = "Correct! ✅";
      is_correct = true;
    } else {
      resultHeading = "incorrect! ❌";
    }

    // get the data for creating a Question and a QuestionAnswerRecord
    const questionAnswerData = {
      is_correct: is_correct,
      user_answer: userAnswerInput,
      questionType: 'fill_in',
      difficultyLevel: 'pro',
      skillType: 'vocabulary',
      note: 'TEXT',
      question: 'Type the whole text.',
      answer: standardAnswer
    };
    
    fetch('/questionAnswerRecord/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftokenText,
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

    createTestResult(is_correct);
  }


  testBtn.addEventListener('click', () => {
    theMainContentPage.style.display = 'none'; // hide the main content page
    theTestContentPage.style.display = 'block'; // show the test/result content page
    // call the function to create the user input view
    createUserAnswerView();
  });

  // create a study record before leaving the current page
  const itemType = 'text';
  window.addEventListener('beforeunload', function(event) {
    // create a timing record
    sendTimingData(startTime, itemId, itemType, csrftokenText);
  });

  // add to focal learning so as to learn it better
  const focalLearningBtn = document.querySelector(".focalLearning");
    focalLearningBtn.addEventListener('click', () => {
      createFocalItems(itemType, itemId, csrftokenText);
  });

});