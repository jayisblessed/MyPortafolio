function paginationA(dataReceived, currentPage, itemsPerPage, createContent, mainContentDiv) {

  totalPage = Math.ceil(dataReceived.length / itemsPerPage);

  handlePageClick(currentPage); // initialize the view of the current page

  function renderContent() {
      mainContentDiv.innerHTML = ''; // clear off any old content

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageData = dataReceived.slice(startIndex, endIndex); // to extract a portion of the array
      
      // if no data, send a 'null' variable to render, so as to neatly render a notice to the user in the function of creating content.
      if (totalPage == 0) {
        emptyData = null;
        createContent(emptyData);
      }
      
      // render the content for each page
      for (const data of pageData) {
        createContent(data);
      };
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
    pageNumberContainer.innerHTML = '';

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
        // create the link for page 1
        const firstPageLink = createPageLink(1);
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
        pageLink.classList.add('active'); // for the current page, add 'active' as class property
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

    // go to a specific page - functionality
    const pageNumberInput = document.createElement('input'); // create a page number input field
    pageNumberInput.id = 'pageNumberInput';
    pageNumberInput.type = 'number';
    pageNumberInput.min = '1';
    pageNumberInput.max = totalPage;
    pageNumberInput.value = currentPage;
    const goToPageBtn = document.createElement('a'); // create go to page button
    goToPageBtn.href = '#';
    goToPageBtn.textContent = 'Go';  
    pageNumberContainer.appendChild(pageNumberInput); // append the input field
    pageNumberContainer.appendChild(goToPageBtn); // append the button
    
    // event listener for go-to-page button
    goToPageBtn.addEventListener('click', function() {
      const pageNumber = parseInt(pageNumberInput.value.trim());
      if (pageNumber > 0 && pageNumber <= totalPage) {
        currentPage = pageNumber;
        pageNumberInput.value = currentPage;
        handlePageClick(currentPage);
      } else {
        alert('Invalid page number.');
      }
    });
    // trigger when 'enter' key is pressed
    pageNumberInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        goToPageBtn.click();
      }
    });
    // if the current page is page 1, no need to show the 'Previous' button
    if (currentPage === 1) {
      previousButton.style.display = 'none';
      // if there is just one page, hide these elements
      if (totalPage < 2) {
        nextButton.style.display = 'none';
        pageNumberInput.style.display = 'none';
        goToPageBtn.style.display = 'none';
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
    renderContent();
    renderPaginationControls(); // update the pagination controls after clicking a page number
  }

  // random button functionality
  const randomBtn = document.querySelector(".randomBtn");
  if (randomBtn) {
    randomBtn.addEventListener("click", function () {
      const pageNumber = Math.floor(Math.random() * totalPage) + 1;
      handlePageClick(pageNumber);
    });
  } else {
    console.log('The randomBtn not found')
  }

  // for also using additional big buttons of 'Next' and 'Previous' for convenience
  const nextBtn = document.querySelector(".nextBtn");
  const previousBtn = document.querySelector(".previousBtn");
  if (nextBtn) {
    nextBtn.addEventListener('click', goToNextPage);
  } else {
    console.log('The nextBtn not found');
  }
  if (previousBtn) {
    previousBtn.addEventListener('click', goToPreviousPage);
  } else {
    console.log('The previousBtn not found');
  }

}
