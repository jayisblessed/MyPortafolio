// Acquire the csrftoken. Otherwise the javascript won't work for CSRF verification.
// The recommended source for the token is the csrftoken cookie. - Django Docs 
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}


// The shared fetch request
async function fetchRequest(csrftoken, url, postData = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error('Request failed. Status: ' + response.status);
  }

  return await response.json();
}


// The timing functionality
var startTime; // declare the startTime global variable
window.addEventListener('load', function() {
  startTime = performance.now(); // retrieve the current timestamp when the page is loaded
});
// Send a request to the server
function sendTimingData(startTime, itemId, itemType) {
  const csrftokenTiming = getCookie('csrftoken');
  const endTime = performance.now();
  const totalTime = (endTime - startTime) / 1000; // convert to seconds
  const data = {
    time: totalTime,
    itemId: itemId,
    itemType: itemType
  };
  const url = '/create_timing_record/';
  // call the function to send a 'fetch' request
  fetchRequest(csrftokenTiming, url, data)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


// Create focal items for intensive learning
const createFocalItems = async (itemType, itemId, csrftoken) => {
  const url = '/createFocalItems/';
  const data = {
    itemType: itemType,
    itemId: itemId,
  };

  // call the function to send a 'fetch' request
  fetchRequest(csrftoken, url, data)
    .then((response) => {
      console.log(response);
      showAlertBanner('rgba(46, 139, 87, 0.9)', 'Focal record has been successfully created.');
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};


// The function for displaying Django messages for 1.5 seconds
function setTimeoutForDjangoMessages() {
  var theMessage = document.querySelector('#DjangoMessage');
console.log('the messages: ', theMessage);
// Wait 1.5 seconds and then hide the 'theMessage' div, which receives messages from view function
setTimeout(() => {
  if (theMessage) {
    theMessage.style.display = 'none';
    console.log('the messages: ', theMessage);
  }
}, 3000);
}


// Alert Message Banner Display 
function showAlertBanner(colorCode, theMessage) {
  var alertBanner = document.createElement('div'); // Create a new div to hold the alert banner
  alertBanner.setAttribute('id', 'javascriptMessageBanner');
  // Set the class and color style of the alert banner based on the colorCode argument
  alertBanner.className = 'alert-message-banner';
  alertBanner.style.backgroundColor = colorCode;
  alertBanner.innerHTML = theMessage; // Add the message to the alert banner
  // Add the alert banner to the HTML document
  document.body.appendChild(alertBanner);
  // Remove the alert banner after 1500 milliseconds (1.5 seconds)
  setTimeout(function() {
    document.body.removeChild(alertBanner);
  }, 1500);
}
