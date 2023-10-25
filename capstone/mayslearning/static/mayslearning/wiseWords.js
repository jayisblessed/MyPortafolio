document.addEventListener('DOMContentLoaded', function() {

  const mainContentDiv = document.getElementById("mainContentDiv");
  var dataReceived = [];
  var totalPage = 0;
  const itemsPerPage = 1;
  
  // use local storage to store the current page number
  function getcurrentQuoteNumber() {
    if (localStorage.getItem('currentQuoteNumber') === null) {
      currentQuoteNumber = 1; // if none, default it to 1
      localStorage.setItem('currentQuoteNumber', currentQuoteNumber);
      return currentQuoteNumber;
    } else {
      return parseInt(localStorage.getItem('currentQuoteNumber'));
    }
  }
  var currentQuoteNumber = getcurrentQuoteNumber(); // get the current page number from local storage

  // function to fetch the data from the API
  async function fetchData() {
    try {
      const response = await fetch('/api/wisewords/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
  // call this function to fetch the data  
  fetchData()
    .then(dataPackage => {
      dataReceived = dataPackage.data_list;
      totalPage = Math.ceil(dataReceived.length / itemsPerPage); // calculate the total page number
      paginationA(dataReceived, currentQuoteNumber, itemsPerPage, createContent, mainContentDiv); // the pagination functionality
    })
    .catch(error => {
      console.error('Error:', error);
    });


  // create the content
  function createContent(data) {
    // if there is no data, neatly display 'No data.'
    if (data == null) {
    const noData = document.createElement('h3');
    noData.className = "no-data";
    noData.textContent = 'No data.';
    mainContentDiv.appendChild(noData);
    } else {
      itemId = data.id; // update the item id

      // create the text div
      const textContentDiv = document.createElement("div");
      textContentDiv.className = 'text-content';

      // create the elements
      const contentDiv = document.createElement("div");
      contentDiv.className = "wise-words text";
      const translationDiv = document.createElement("div");
      translationDiv.className = "wise-words translation";
      const authorDiv = document.createElement("div");
      authorDiv.className = "wise-words author";
      // set up the properties of the elements
      contentDiv.textContent = data.content;
      translationDiv.textContent = data.translation;
      authorDiv.textContent = data.author;
      // append the elements
      textContentDiv.appendChild(contentDiv);
      textContentDiv.appendChild(translationDiv);
      textContentDiv.appendChild(authorDiv);
      
      mainContentDiv.appendChild(textContentDiv);

      // remember the current page in local storage
      localStorage.setItem('currentQuoteNumber', currentQuoteNumber);
    }
  }
  

  // Automatic carousel, every 5 seconds
  let intervalCarousel = null;
  // the interval function for the carousel
  const startInterval = () => {
    intervalCarousel = setInterval(() => {
      const currentPageNum = document.querySelector('.page-number.active');
      currentQuoteNumber = currentPageNum.textContent.trim();
      currentQuoteNumber++;
      if (currentQuoteNumber > totalPage) {
        currentQuoteNumber = 1; // wrap around to the first page after going beyond the last page
      }
      // call the pagination function to show the page of 'currentQuoteNumber'
      paginationA(dataReceived, currentQuoteNumber, itemsPerPage, createContent, mainContentDiv);
    }, 5000);
  };

  // function to stop the interval
  const stopInterval = () => {
    clearInterval(intervalCarousel);
    intervalCarousel = null;
  };

  // toggle the carousel interval
  const toggleInterval = () => {
    if (intervalCarousel) {
      stopInterval();
      showAlertBanner('rgba(220, 20, 60, 0.9)', 'Stopped  ' + '\u25A0');
    } else {
      startInterval();
      showAlertBanner('rgba(46, 139, 87, 0.9)', 'Playing  ' + '&#9654;');
    }
  };

  // start the interval initially
  startInterval();

  // when clicked on the element, toggle the interval
  mainContentDiv.addEventListener('click', (event) => {
    toggleInterval();
  });

});