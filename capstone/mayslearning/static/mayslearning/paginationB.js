// This pagination has no input field for a page number and no goTo button.
// It also utilizes the local storage to store the current number.
function paginationB(dataReceived, createTheContent, itemsPerPage) {
  // use local storage to store the current page number
  function getCurrentPage() {
    if (localStorage.getItem('currentPage') === null) {
      let currentPage = 1;
      localStorage.setItem('currentPage', currentPage);
      return currentPage;
    } else {
      return parseInt(localStorage.getItem('currentPage'));
    }
  }
  var currentPage = getCurrentPage();
  totalPage = Math.ceil(dataReceived.length / itemsPerPage);

  renderContent(); // initialize the view of the current page
  renderPaginationControls(); // render the pagination buttons and links

  function renderContent() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = dataReceived.slice(startIndex, endIndex); // to extract a portion of the array
    createTheContent(pageData);
  }

  function goToPreviousPage() {
    if (currentPage > 1) {
      currentPage--;
      renderContent();
      renderPaginationControls();
    }
  }

  function goToNextPage() {
    if (currentPage < totalPage) {
      currentPage++;
      renderContent();
      renderPaginationControls();
    }
  }

  function renderPaginationControls() {
    const pageNumberContainer = document.getElementById('pageNumberContainer');
    pageNumberContainer.innerHTML = ''; // clear off any content
  
    const previousButton = document.createElement('a');
    previousButton.href = '#';
    previousButton.textContent = 'Previous';
    previousButton.addEventListener('click', goToPreviousPage);
    pageNumberContainer.appendChild(previousButton);
    // decide the first page of the range, either 1 or currentPage - 3
    let startPage = Math.max(1, currentPage - 3);
    // decide the end page of the range, either currentPage + 3 or totalPage
    let endPage = Math.min(totalPage, currentPage + 3); 
  
    if (startPage > 1) {
      const firstPageLink = createPageLink(1); // create the link for page 1
      pageNumberContainer.appendChild(firstPageLink);
      // decide when to trigger the displaying of the beginning ellipsis
      if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        pageNumberContainer.appendChild(ellipsis);
      }
    }
    // create all the page links of the range
    for (let i = startPage; i <= endPage; i++) {
      const pageLink = createPageLink(i);
      if (i === currentPage) {
        pageLink.classList.add('active'); // for the current page, add 'active' as class property for CSS styling
      }
      pageNumberContainer.appendChild(pageLink);
    }
    // decide when to display the ending ellipsis
    if (endPage < totalPage) {
      if (endPage < totalPage - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        pageNumberContainer.appendChild(ellipsis);
      }
      const lastPageLink = createPageLink(totalPage); // create the link for the last page
      pageNumberContainer.appendChild(lastPageLink);
    }
  
    const nextButton = document.createElement('a');
    nextButton.href = '#';
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', goToNextPage);
    pageNumberContainer.appendChild(nextButton);

    
    // if the current page is page 1, no need to show the 'Previous' button
    if (currentPage === 1) {
      previousButton.style.display = 'none';
      // if there is just one page, hide this element
      if (totalPage < 2) {
        nextButton.style.display = 'none';
      }
    }
    // if the current page is the last page, no need to show the 'Next' button
    if (currentPage === totalPage) {
      nextButton.style.display = 'none';
    }
  }
  
  function createPageLink(pageNumber) {
    const pageLink = document.createElement('a');
    pageLink.href = '#';
    pageLink.textContent = pageNumber;
    pageLink.classList.add('page-number'); // add the 'page-number' class
    if (pageNumber === currentPage) {
        pageLink.classList.add('active'); // add the 'active' class for the current page
    }
    pageLink.addEventListener('click', () => handlePageClick(pageNumber));
    return pageLink;
  }
        
  function handlePageClick(pageNumber) {
    currentPage = pageNumber;
    localStorage.setItem('currentPage', currentPage); // store the current page number in local storage
    renderContent();
    renderPaginationControls(); // update the pagination controls after clicking a page number
  }

}
