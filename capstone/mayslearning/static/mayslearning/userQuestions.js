document.addEventListener('DOMContentLoaded', function () {

  const userNameElement = document.getElementById('loggedInUsername');
  var loggedInUsername = userNameElement.textContent.trim(); // retrieve the logged-in user name
  const theQuestionContainer_main = document.getElementById('theQuestionContainer_main'); // Main Display for question content
  const theCommentContainer_main = document.getElementById('theCommentContainer_main'); // Main Display for replies
  const csrftokenQuestions = getCookie('csrftoken');
  const newPostBtn = document.querySelector('#newPostBtn');
  newPostBtn.addEventListener('click', postQuestion);
  const postTextArea = document.querySelector('#postTextArea');
  const itemsPerPage = 5;

  // function for posting a question
  function postQuestion() {
    const content = postTextArea.value.trim();
    if (content === '') {
      showAlertBanner('rgba(220, 20, 60, 0.9)', 'Please enter some content.');
      return;
    }
    
    const url = '/post_question/';
    const data = { content }; // Object Property Shorthand
    // call the function to send a 'fetch' request
    fetchRequest(csrftokenQuestions, url, data)
      .then((response) => {
        console.log(response);
        postTextArea.value = '';
        getCreateTheContent(); // refresh by re-creating the content
      })
      .catch((error) => {
        console.error('Error:', error);
      }); 
  }

  // fetch and create the content
  function getCreateTheContent() {
    fetch('/api/userQuestions/')
      .then(response => response.json())
      .then(data => {
        const questions = data.data_list;
        paginationB(questions, createTheContent, itemsPerPage);
      })
      .catch(error => {
        console.error(error);
      });
  }

  getCreateTheContent(); // call the function

  // create the content for the questions
  function createTheContent(questions) {
    questionsContainer.innerHTML = '';

    questions.forEach(question => {
      const card = document.createElement('div'); // create a card element
      card.classList.add('card');
      const cardBody = document.createElement('div'); // create a card body
      cardBody.classList.add('card-body');
      
      const badgeElement = document.createElement('span'); // create a span element for a badge
      badgeElement.textContent = question.replyCount;
      badgeElement.classList.add('position-absolute', 'top-0', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');

      const questionTitle = document.createElement('h4');
      questionTitle.dataset.questionId = question.id;
      questionTitle.classList.add('user-question', 'pointer-underline'); // add the class property for CSS to underline and change the cursor to a pointer
      questionTitle.innerHTML = `${question.content}`;
      questionTitle.addEventListener('click', () => showUserComments(question.id));

      const authorTimestamp = document.createElement('p');
      authorTimestamp.classList.add('author-timestamp');
      authorTimestamp.textContent = `By: ${question.author}, Time: ${question.timestamp}`;

      cardBody.appendChild(badgeElement);
      cardBody.appendChild(questionTitle);
      cardBody.appendChild(authorTimestamp);

      const editButton = createButton('Edit', question.id, 'edit-question btn btn-primary btn-sm'); // create the edit button
      editButton.addEventListener('click', handleEditButtonClick);
      const deleteButton = createButton('Delete', question.id, 'delete-question btn btn-danger btn-sm'); // create the delete button
      deleteButton.addEventListener('click', handleDeleteButtonClick);
      // if the logged-in user is not the author, hide the buttons
      if (question.author != loggedInUsername) {
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';
      }

      cardBody.appendChild(deleteButton);
      cardBody.appendChild(editButton);
      card.appendChild(cardBody);
      questionsContainer.appendChild(card);
    });
  }

  // Function to create a button. Parameters are: button text, an ID, class name.
  function createButton(text, id, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.dataset.id = id; // set up a custom data attribute
    button.className = className;
    return button;
  }

  // handle the delete button click
  async function handleDeleteButtonClick() {
    const postId = this.dataset.id;
    const url = `/editpost/${postId}/`;
    const postData = { action: 'DELETE', text: '', theId: postId };

    fetchRequest(csrftokenQuestions, url, postData)
      .then((response) => {
        console.log(response);
        getCreateTheContent(); // refresh by re-drawing the content
        showAlertBanner('rgba(46, 139, 87, 0.9)', 'Your post has been successfully deleted.');
      })
      .catch((error) => {
        showAlertBanner('rgba(220, 20, 60, 0.9)', error.message);
        console.error('Error:', error);
      });
  }

  // handle the edit button click
  function handleEditButtonClick() {
    const postId = this.dataset.id;
    const postText = document.querySelector(`.user-question[data-question-id="${postId}"]`);
    const content = postText.textContent.trim(); // read the text content
    const cardBody = postText.parentNode;

    const textArea = createTextArea(content); // create a text area and set its initial content
    textArea.setAttribute('rows', '3');
    const saveBtn = createButton('Save', postId.id, 'btn save-post-btn btn-primary btn-sm');
    const cancelBtn = createButton('Cancel', postId.id, 'cancelButton btn btn-danger btn-sm');
  
    cardBody.replaceChild(textArea, postText); // use 'textArea' to replace 'postText'
    cardBody.insertBefore(saveBtn, this.nextSibling); // insert the button before the reference element
    cardBody.insertBefore(cancelBtn, this.nextSibling); // insert the button before the reference element
  
    this.style.display = 'none'; // hide 'Edit' button
    this.previousSibling.style.display = 'none'; // hide 'Delete' button
  
    saveBtn.addEventListener('click', () => handleSaveButtonClick(postId, textArea));
    cancelBtn.addEventListener('click', getCreateTheContent);
  }

  // handle 'Save' button click
  function handleSaveButtonClick(postId, textArea) {
    const updatedText = textArea.value.trim();
    const url = `/editpost/${postId}/`;
    const postData = { action: 'EDIT', text: updatedText, theId: postId };

    fetchRequest(csrftokenQuestions, url, postData)
      .then((response) => {
        console.log(response);
        getCreateTheContent();
        showAlertBanner('rgba(46, 139, 87, 0.9)', 'Your post has been successfully edited.');
      })
      .catch((error) => {
        showAlertBanner('rgba(220, 20, 60, 0.9)', error.message);
        console.error('Error:', error);
      });
  }



  // THE COMMENT/REPLY SECTION:
  const commentsListDiv = document.getElementById('commentsListDiv');
  const theQuestionDiv = document.getElementById('questionDiv');
  var question_id = 0; // global variable for wide access

  // function to show user comments of a specific question id
  function showUserComments(questionId) {
    question_id = questionId; // update the global variable
    theQuestionContainer_main.style.display = 'none'; // hide the question display
    theCommentContainer_main.style.display = 'block'; // show the comment display
    fetchUserComments(question_id); // call the fetch function
    // event delegation for handling click events on the comments list
    commentsListDiv.addEventListener('click', handleCommentButtonClick);
    // Event listener for posting a comment. Also prevent duplicate event listeners from being attached.
    const postNewCommentBtn = document.getElementById('postNewCommentBtn');
    postNewCommentBtn.removeEventListener('click', postComment);
    postNewCommentBtn.addEventListener('click', postComment);
    // event listener for close button click
    document.getElementById('closeCommentContainerBtn').addEventListener('click', () => {
      theQuestionContainer_main.style.display = 'block';
      theCommentContainer_main.style.display = 'none';
      getCreateTheContent(); // refresh by redrawing
    });
  }
  
  // fetch user comments of the specific question id
  function fetchUserComments(question_id) {  
    fetch(`/api/question/${question_id}/comments/`)
      .then(response => response.json())
      .then(data => {
        renderQuestion(theQuestionDiv, data.question); // render the question
        renderComments(commentsListDiv, data.comments); // render the comments
      })
      .catch(error => {
        console.error(error);
      });
  }

  // Render the question. The parameters are: HTML element, the object
  function renderQuestion(element, question) {
    element.innerHTML = `<p class="comment-question">The Question: ${question.content}</p> <div class="comment-question-author">By: ${question.user} Time: ${question.timestamp}</div>`;
  }

  // Render the comments. The parameters are: HTML element, the object
  function renderComments(element, comments) {
    element.innerHTML = '';
    comments.forEach(comment => {
      const commentElement = createCommentElement(comment);
      element.appendChild(commentElement);
    });
    // prevent duplicate event listeners from being attached
    element.removeEventListener('click', handleCommentButtonClick); // first remove the event listener
    element.addEventListener('click', handleCommentButtonClick); // then add the event listener
  }

  // create a comment element
  function createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.dataset.commentId = comment.id;
  
    const contentElement = document.createElement('div');
    contentElement.innerHTML = `<div class="comment-content">${comment.content}</div> <div class="comment-author">By: ${comment.user} Time: ${comment.timestamp}</div>`;
    
    commentElement.appendChild(contentElement);
  
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'comment-buttons';
  
    const editButton = createButton('Edit', comment.id, 'editCommentButton btn btn-primary btn-sm');
    // if the logged-in user is not the author of the comment, hide the button
    if (comment.user != loggedInUsername) {
      editButton.style.display = 'none';
    }
  
    const deleteButton = createButton('Delete', comment.id, 'deleteCommentButton btn btn-danger btn-sm');
    // if the logged-in user is not the author of the comment, hide the button
    if (comment.user != loggedInUsername) {
      deleteButton.style.display = 'none';
    }

    buttonsContainer.appendChild(deleteButton);
    buttonsContainer.appendChild(editButton);
    commentElement.appendChild(buttonsContainer);
    return commentElement;
  }
  
  // update comment element
  function updateCommentElement(commentElement, content) {
    const contentElement = commentElement.querySelector('.comment > p');
    if (!contentElement) return;
  
    contentElement.textContent = content;
  }
  
  // replace save button with edit button
  function replaceSaveButtonWithEditButton(commentElement, commentId) {
    const editButton = createButton('Edit', commentId, 'editComment');
    const saveButton = commentElement.querySelector('.saveCommentButton');
    if (saveButton) {
      saveButton.replaceWith(editButton);
    }
  }

  // function to save a comment 
  function saveComment(commentId, textarea, commentElement) {
    const content = textarea.value.trim();
    const url = `/api/comment/${commentId}/edit/`;
    const postData = { content };

    fetchRequest(csrftokenQuestions, url, postData)
      .then((response) => {
        console.log(response);
        updateCommentElement(commentElement, response.content); // update with data returned from server
        replaceSaveButtonWithEditButton(commentElement, commentId); // replace save button with edit button
        fetchUserComments(question_id); // refresh with re-drawing
        showAlertBanner('rgba(46, 139, 87, 0.9)', 'Your post has been successfully edited.');
      })
      .catch((error) => {
        showAlertBanner('rgba(220, 20, 60, 0.9)', error.message);
        console.error('Error:', error);
      });
  }
  
  // create a text area and set its initial content
  function createTextArea(content) {
    const textArea = document.createElement('textarea');
    textArea.classList.add('form-control');
    textArea.value = content;
    return textArea;
  }

  // function to restore the original view
  function restoreOriginalState(commentElement, originalContentElement, authorDiv, originalButtons) {
    const commentId = commentElement.dataset.commentId;
    commentElement.innerHTML = '';
    commentElement.appendChild(originalContentElement);
    commentElement.appendChild(authorDiv);
    commentElement.appendChild(originalButtons);
    // select and conditionally add an event listener
    const editButton = commentElement.querySelector('.editComment');
    if (editButton) {
      editButton.addEventListener('click', handleEditCommentButtonClick);
    }
    // select and conditionally add an event listener
    const deleteButton = commentElement.querySelector('.deleteCommentButton');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => deleteComment(commentId));
    }
  }

  // functionality for editing
  function editComment(commentElement) {
    const commentId = commentElement.dataset.commentId;
    const contentElement = commentElement.querySelector('.comment-content');
    const authorDiv = commentElement.querySelector('.comment-author');
    if (!contentElement) return;
  
    const content = contentElement.textContent.trim(); // read the text content of the comment
  
    const textarea = createTextArea(content); // create a text area and set its initial content
    textarea.setAttribute('rows', '3');
    // create the 'Cancel' button
    const cancelButton = createButton('Cancel', commentId, 'cancelButton btn btn-danger btn-sm');
    cancelButton.addEventListener('click', () => {
      restoreOriginalState(commentElement, originalContentElement, authorDiv, originalButtons);
    });
    // create the 'Save' button
    const saveButton = createButton('Save', commentId, 'save-comment-btn btn btn-primary btn-sm');
    saveButton.addEventListener('click', () => {
      saveComment(commentId, textarea, commentElement);
      restoreOriginalState(commentElement, originalContentElement, authorDiv, originalButtons);
    });
    // clone HTML elements, using argument 'true' to include all child elements and their descendants
    const originalContentElement = contentElement.cloneNode(true); 
    const originalButtons = commentElement.querySelector('.comment-buttons').cloneNode(true);
    // replace 'contentElement' with 'textarea'
    contentElement.replaceWith(textarea);
    commentElement.querySelector('.deleteCommentButton').replaceWith(cancelButton); // replace 'Delete' button with 'Cancel' button
    commentElement.querySelector('.editCommentButton').replaceWith(saveButton); // replace 'Edit' button with 'Save' button    
  }

  // handle edit comment button click
  function handleEditCommentButtonClick(event) {
    const commentElement = event.target.closest('.comment'); // find the nearest ancestor element of the event target
    editComment(commentElement);
  }

  // handle comment button click
  function handleCommentButtonClick(event) {
    const target = event.target;
    if (target.classList.contains('editCommentButton')) {
      handleEditCommentButtonClick(event);
    } else if (target.classList.contains('deleteCommentButton')) {
      const commentId = target.dataset.id; // read the commentId of the target
      deleteComment(commentId);
      event.stopPropagation(); // prevent the event from further propagating up the DOM tree
    }
  }

  // delete a comment via 'fetch' request
  function deleteComment(commentId) {
    const url = `/api/comment/${commentId}/delete/`;

    fetchRequest(csrftokenQuestions, url)
    .then((data) => {
      console.log(data);
      fetchUserComments(question_id); // refresh by re-drawing
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }    
  
  // function to post a comment
  function postComment() {
    const newCommentInput = document.getElementById('newCommentInput');
    const content = newCommentInput.value.trim();
    if (content === '') {
      showAlertBanner('rgba(220, 20, 60, 0.9)', 'Please enter some content.');
      return;
    }

    const url = '/question/' + question_id + '/comment/';
    const data = { content }; // Object Property Shorthand

    fetchRequest(csrftokenQuestions, url, data)
    .then(() => {
      newCommentInput.value = ''; // clear the input field
      fetchUserComments(question_id); // refresh by re-drawing
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  

});