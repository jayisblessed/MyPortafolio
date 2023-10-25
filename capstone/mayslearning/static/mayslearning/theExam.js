document.addEventListener('DOMContentLoaded', function() {

  const csrftokenExam = getCookie('csrftoken');
  const startExamBtn = document.getElementById('startExamBtn');
  const examSubmitBtn = document.getElementById('examSubmitBtn');
  const currentTimeDisplay = document.getElementById('currentTimeDisplay');
  const endTimeDisplay = document.getElementById('endTimeDisplay');

  // at start, disable all the quizInput fields
  function changeInputFieldsStatus(bool_status) {
    const quizInputElements = document.querySelectorAll('.quizInput');
    quizInputElements.forEach(element => {
      element.disabled = bool_status;
    });
  }
  changeInputFieldsStatus(true);

  // the live clock of current time
  function updateTime() {
    var currentTime = new Date();
    var formattedTime = currentTime.toLocaleTimeString(); // format the time portion of the Date object into a human-readable string, based on the user's locale
    currentTimeDisplay.textContent = formattedTime;
  }

  updateTime(); // update the time immediately
  setInterval(updateTime, 1000); // update the time every second (1000 milliseconds)

  // the function to start the exam
  async function startExam() {
    try {
      const response = await fetch('/theExam/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftokenExam,
        },
        body: JSON.stringify({ action: 'start' }),
      });
  
      if (!response.ok) {
        throw new Error('The exam request failed. Status: ' + response.status);
      }
  
      const data = await response.json();
      startExamBtn.disabled = true;
      examSubmitBtn.disabled = false;
      changeInputFieldsStatus(false); // enable every input field after the test starts
      var durationMinutes = data.duration_minutes;
      var endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + durationMinutes); // update the minutes by adding the specified duration_minutes to its current minutes
      endTimeDisplay.textContent = 'End Time: ' + endTime.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      startTimer(endTime);
    } catch (error) {
      console.error(error);
    }
  }
  

  // function to submit the exam
  function submitExam() {
    var answers = {}; // initialize an empty JavaScript object
    const quizInputs = document.getElementsByClassName('quizInput');
    // convert the HTML collection into an array, so that array methods can be used on it
    Array.from(quizInputs).forEach((input) => {
      var questionId = input.dataset.questionId;
      var answer = input.value;
      answers[questionId] = answer; // add a new key-value pair
    });
  
    var examID = document.getElementById('examID').value.trim(); // read the exam ID
  
    submitData(examID, answers);
  }

  // function to send the post request for submitting the exam
  async function submitData(examID, answers) {
    try {
      const response = await fetch('/theExam/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftokenExam,
        },
        body: JSON.stringify({ action: 'submit', examID: examID, answers: answers }),
      });
  
      if (response.ok) {
        console.log('Exam submitted successfully.');
        const url = '/examResult/' + encodeURIComponent(examID); // encode a string to a new one with all the characters unsafe for use in URLs replaced by their corresponding percent-encoded representations
        window.location.href = url; // redirect to the new URL
      } else if (response.status === 400) {
        throw new Error('Bad request: Invalid data.');
      } else if (response.status === 401) {
        throw new Error('Unauthorized: You are not allowed to perform this action.');
      } else {
        throw new Error('Submission failed. Status: ' + response.status);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // function to start the timer and check if the exam should be submitted automatically
  function startTimer(endTime) {
    setInterval(function() {
      var currentTime = new Date();
      var formattedCurrentTime = currentTime.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      if (formattedCurrentTime === endTime.toLocaleString('en-US', {
        hour: '2-digit',
        minute:'2-digit',
        second: '2-digit'
      })) {
        submitExam();
      }
    }, 1000); // run every second (1000 milliseconds)
  }

  
  startExamBtn.addEventListener('click', startExam);  
  examSubmitBtn.addEventListener('click', () => {
    submitExam();
  });
  examSubmitBtn.disabled = true; // in the beginning, disable the button

});