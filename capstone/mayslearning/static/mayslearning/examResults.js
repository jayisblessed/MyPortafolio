document.addEventListener('DOMContentLoaded', function() {

  const mainContentDiv = document.querySelector(".mainContent");
  const mainContentOneDiv = document.querySelector(".mainContentOne");
  mainContentOneDiv.style.display = 'none';
  var currentPage = 1;
  const itemsPerPage = 5;

  function fetchData() {
      return new Promise((resolve, reject) => {
        fetch('/api/examResults/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('The network response was not OK');
            }
            return response.json();
          })
          .then(data => {
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      });
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

    if (data == null) {
      const noData = document.createElement('h3');
      noData.className = "no-data";
      noData.textContent = 'No data.';
      mainContentDiv.appendChild(noData);
    } else {

      // create the card element
      const card = document.createElement('div');
      card.className = 'card exam-result';

      // create the card body
      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');

      // create the content elements
      const examTitleDiv = document.createElement("div");
      examTitleDiv.classList.add("exam-title");

      const percentageDiv = document.createElement("div");
      percentageDiv.classList.add("percentage");
      
      const timeStamp = document.createElement("div");
      timeStamp.classList.add("time-stamp");

      const userNameDiv = document.createElement("div");
      userNameDiv.classList.add("user-name");

      examTitleDiv.textContent = data.examTitle;
      percentageDiv.textContent = data.percentage;
      timeStamp.textContent = data.timestamp;
      userNameDiv.textContent = data.userName;

      // create a new anchor element
      const anchorElement = document.createElement('a');
      // set the href attribute
      anchorElement.href = `/examResult/${data.examId}`;
      // move the contents of the <div> into the anchor
      while (examTitleDiv.firstChild) {
          anchorElement.appendChild(examTitleDiv.firstChild);
      }
      // append the anchor to the <div>
      examTitleDiv.appendChild(anchorElement);
                
      cardBody.appendChild(examTitleDiv);
      cardBody.appendChild(percentageDiv);
      cardBody.appendChild(timeStamp);
      cardBody.appendChild(userNameDiv);

      // append the card body to the card
      card.appendChild(cardBody);
      // append the card to the container
      mainContentDiv.appendChild(card);

    }
  }
      
});