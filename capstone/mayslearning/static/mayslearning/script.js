document.addEventListener('DOMContentLoaded', function() {
    // The code here is for the search functionality.
    const csrftokenLayout = getCookie('csrftoken');
    var searchInput = document.getElementById('searchInput');
    var searchButton = document.getElementById('searchButton');

    // Function to display the search results
    function displaySearchResults(data) {
        var searchResultTitle = document.getElementById('searchResultTitle');
        searchResultTitle.textContent = '';
        var searchResultContainer = document.getElementById('searchResultContainer');
        searchResultContainer.innerHTML = '';
        // if an exact match is found
        if (data.word) {
            var wordDiv = document.createElement('h3');
            wordDiv.textContent = data.word;
            searchResultContainer.appendChild(wordDiv);

            var theIPADiv = document.createElement('div');
            theIPADiv.textContent = '/' + data.theIPA + '/';
            searchResultContainer.appendChild(theIPADiv);

            data.explanations.forEach(function (explanation) {
                var explanationDiv = document.createElement('div');
                explanationDiv.textContent = explanation.explanation;
                searchResultContainer.appendChild(explanationDiv);

                var explanationTransDiv = document.createElement('div');
                explanationTransDiv.textContent = explanation.explanationTrans;
                searchResultContainer.appendChild(explanationTransDiv);

                explanation.sentences.forEach(function (sentence) {
                    var sentenceDiv = document.createElement('div');
                    sentenceDiv.textContent = sentence.sentence;
                    searchResultContainer.appendChild(sentenceDiv);

                    var translationDiv = document.createElement('div');
                    translationDiv.textContent = sentence.translation;
                    searchResultContainer.appendChild(translationDiv);
                });
            });
        } else if (data.matching_words.length > 0) {
            searchResultTitle.textContent = 'Not found. Here are the matching words:';
            // create a list of all the matching words
            data.matching_words.forEach(function (matchingWord) {
                const wordDiv = document.createElement('div');
                wordDiv.textContent = matchingWord;
                wordDiv.className = "matching-word";
                // add click event listener to the wordDiv
                wordDiv.addEventListener('click', function() {
                    fetchSearchData(matchingWord);
                });

                searchResultContainer.appendChild(wordDiv);
            });
            
        } else {
            searchResultTitle.textContent = 'No results found.';
        }
    }

    // fetch request to the API endpoint
    async function fetchSearchData(userInput) {
        if (userInput !== '') {
          try {
            const response = await fetch('/search/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftokenLayout,
              },
              body: JSON.stringify({ searchQuery: userInput }),
            });
      
            if (!response.ok) {
              throw new Error('Search request failed.');
            }
      
            const data = await response.json();
            displaySearchResults(data);
          } catch (error) {
            console.error(error);
          }
        }
    }

    // the search button event listener
    searchButton.addEventListener('click', function () {
        const userInput = searchInput.value.trim();
        fetchSearchData(userInput);
    });
    // user 'enter' key to trigger the searching
    searchInput.addEventListener('keydown', function(event){
        if (event.key === 'Enter') {
            event.preventDefault(); // prevent any default behavior
            searchButton.click();
        }
    })

    // Show Django messages for a few seconds
    setTimeoutForDjangoMessages();

});