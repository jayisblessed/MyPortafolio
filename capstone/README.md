# Capstone

## Description
This Capstone is a project I hoped to build for a very long time. As a language teacher, I often felt it would be of great help to have an application to help my students focus and review on some core content that they really need to master. I will personally curate and input the content into the database. My students can learn pronunciation, words, sentences, grammar, text, quotes, ask a question, reply to other people's questions, take tests, and view past mistakes.

## Distinctiveness and Complexity
## Distinctiveness
My project is sufficiently distinct, because it is a web app for education. It is to help students learn English words, sentences, texts, and grammar. It also has a question library for the exam function to generate a random exam. Additionally, it utilizes audio and image files.
  
## Complexity
- Most of the webpages use Javascript to fetch data from the server and dynamically create the HTML content, thus no need to reload the webpage. My application plays audio files and shows local images. It allows uploading audio files and image files to store in a local folder. The audio player icon changes according to the playing status. If there is no image content, the text content will extend over and take advantage of the full width.

- Altogether there are at least 20 data models: PronunciationPart, User, AudioFile, Word, Explanation, Sentence, Note, Grammar, WiseWords, Question, Transaction, UserProfile, StudyProfile, StudyRecord, QuestionAnswerRecord, StudyRecord, Exam, ExamRecord, UserPost, FocalItem, ImageFile, Text.

- The view functions for Learn words/sentences/texts/grammar and Mistakes are protected by my subscription wrapper, so the webpage can only be opened by a subscribed user. My wrapper function 'subscriptionRequired' will check if a user is authenticated, has a related userprofile object attached to it using hasattr(request.user, 'userprofile'), and if the 'renewal_date' attribute greater than the current time.

- The pagination is also more advanced. The number of the current active page is highlighted, and when you go to a new page it will be updated too. You can also directly input a page number and press enter key or click on the Go button to go the page. All the pagination buttons include: Previous, Page 1, the page range, Page last, Next, input field, Go button. When the star page of the range is greater than 2, then an ellipsis is displayed; when the end page is less than total page minus 1, then an ellipsis is displayed. This pagination also has a random page functionality to allow a user to go to a random page.

- In the Learn IPA part, a virtual keyboard is created for users to type the pronunciation symbols. It also has a VFD style display which mimic a vacuum fluorescent display.

- In Learn words part, the JSON data is more complex. The main data contains the item's id, title, IPA, explanations {part of speech, explanation, explanation translation, sentences { sentence, translation, audio { id, url } } }, note, audio { id, url }, image { id, url }. Additionally along with the main data I also pass along the id for the item studied last time which serves as the page number from last time sent by the server, and then in javascript, the index number of the id is looked up in the data array to calculate its appropriate page number.

- Under Mistakes, the mistake count was a little tricky, because I had to calculate how many times each question had appeared in the whole list. For the exact same question the user can give a different wrong answer each time when a mistake is made.

- The exam part is complex too. When 'Take a random exam' button is clicked, an exam page will show up with 5 random questions. The exam title is the string of 'Random Exam + date + time'. Above the 'Start' button is a live clock of the current time, updating every second. The 'Submit' button and all the input fields are disabled before the 'Start' button is clicked. After the 'Start' button is clicked, the 'Start' button will be disabled and the 'Submit' button and all the input fields will be enabled, and below the exam title, two elements will be shown: 'Time limit' and the 'End time', and a timer is activated. If the time is up, and the user still hasn't clicked 'Submit', then it will automatically trigger submitting. Because there are multiple questions and input fields, I use an array of key-value pairs to store them. When the exam is submitted, the array will be sent to the view function. In the POST data body, the object of key-value pairs include: { action: 'submit', examID: examID, answers: answers }. 'action' will let my view function determine what kind of action it needs to take. 'examID' is the ID of the exam. 'answers' is the key-value pairs of the question IDs and answers.

- For the exam view function, if the request is via GET, it first obtains the Exam instances with is_random=True and no related Exam_record instances, and then delete these exams to erase any unused random exams. Then it creates a new random exam. It will randomly select 5 Question objects that do not have the note 'IPA', 'SENTENCE', 'TEXT', 'WORD'. It also uses the timezone.localtime() function to convert the UTC timestamp to the desired timezone. It assigns the set of questions to the data model field. It calculates the exam end time, and render the page.

- If the request is via POST, the exam view function will first try to see if such an exam already exists, if not, create a new exam. It uses timedelta to calculate time. It reads the JSON payload of data sent from the frontend Javascript code and parse it into a Python dictionary. If in the data the value of the key 'action' is 'start', then it creates an ExamRecord instance. It returns the calculated end time. If the value of the the key 'action' is 'submit', then it will safely access the examRecord instance, check the user's answer for each question, create a questionAnswerRecord instance for the question of the exam, and save it.

- Everytime when the user clicks the 'Exams' nav link, the view function will check if there are any unfinished/abandoned exams, if yes,  these will be deleted. It usually is caused by the user only clicking the 'Start' button but then failed to 'Submit' an exam.

- Since most of the content is created by Javascript dynamically, how to load another webpage in Javascript was a little tricky. I decided to create a new anchor element for the div that should cause opening another page. To achieve that, I set the href attribute for the anchor element, use a 'while' loop to move the contents of the div into the anchor, and then append the anchor to the div.

- For 'Ask' page, I used a single data model for both questions and replies, by setting up the 'parent' field, a ForeignKey that references the same model ('self'), which allows me to create a hierarchical relationship between the instances. In the future I plan to upgrade the question/answer part to support threaded conversations.

- For some automation, I built the 'generate_questions' view function to generate sentence questions using all the existing sentences and word questions using all the existing words in the database. First it checks if such a question alread exists and if not, generate the questions. The url is: 'generate_questions/'. Before running it, first go to the admin page to delete all the existing word questions and sentence questions. It only needs to run once.

- The Learn Center has a vivid bar chart to show the status and progress of learning. 

- For 'Test' functionality, I use a Bootstrap modal to cover up the other content and give the user an interface to input the answer and Submit.

- On the 'Profile' page, the color and text will change according to 'Subscribe/Unsubscribe' button's toggling.

## How to run the application?
Simply run the usual command: python3 manage.py runserver

## The files list
- audioPlayer.js      Javascript code to create an audio player.
- compareTest.js      Javascript code to check if the user's answer matches the answer key.
- examResults.js      Javascript code for displaying the exam results.
- learnEngIPA.js      Javascript code for learning English IPA pronunciation.
- learnGrammar.js     Javascript code for learning grammar rules.
- learnSentences.js   Javascript code for learning sentences.   
- learnText.js        Javascript code for learning whole texts.
- learnWord.js        Javascript code for learning English words.
- paginationA.js      Javascript pagination, including: Previous, Page 1, the page range, Page last, Next, input field, Go button. 
- paginationB.js      Javascript pagination, including: Previous, Page 1, the page range, Page last, Next. It uses local storage to store the current page number
- pastMistakes.js     Javascript code to show the past mistakes of the logged-in user.
- script.js           Javascript code for the word search function, and calls the 'setTimeoutForDjangoMessages' function from utilFunction.js.
- styles.css          It contains all of the CSS code for the entire application.
- theExam.js          The javascript code to disable/enable elements, create a live clock, start the exam and set a timer, and Submit an exam.
- userQuestions.js    The Javascript code for a user to ask questions and reply to questions. 
- utilFunctions.js    It contains these Javascript functions: ‘getCookie’ for creating a CSRF token. ‘fetchRequest’ to send a POST request with parameters. ‘sendTimingData’ to time how much time a user stays on the page and when the page unloads or closes, send it to the server. ‘createFocalItems’ to send a request to the server to create a FocalItem instance. ‘setTimeoutForDjangoMessages’ to disappear Django messages in 1.5 seconds. ‘showAlertBanner’ to show an alert message. 
- wiseWords.js        The Javascript code for displaying and controling the quotes/wise words.
- favicon.ico         The icon file.
- delete_audio.html   The page for deleting an audio file of the IPA part.
- edit_audio.html     The page for editing an audio file of the IPA part.
- error.html          A generic error page.
- examResult.html     This page shows the detailed results of a specific exam.
- examResults.html    This page shows general results cards for all the exams.
- layout.html         The layout file.
- learnCenter.html    This page serves as the index page. It is the start point to most learning activities. 
- learnEngIPA.html    This is the page for learnging the English IPA. 
- learnGrammar.html   This page is for learning grammar.
- learnSentences.html This page is for learning sentences.
- learnText.html      This page is for learning texts.
- learnWords.html     This page is for learning words.
- login.html          The login page.
- pastMistakes.html   This page displays a user's past mistakes.
- profile.html        User's profile page.
- register.html       The page to register an account.
- success.html        A generic page to show a success of a process.
- theExam.html        This page let's a user take a random exam. 
- upload.html         This is the page to upload an IPA item.
- userQuestions.html  This page is for a user to ask a question/reply to a question.
- wiseWords.html      This page shows the wise words/quotes for motivation.
- forms.py            It contains the forms.
- urls.py             This has all the urls.
- utils.py            It contains these functions: 'updateSubscription' (for calculating and setting the balance and renewal date), 'subscriptionRequired' (my wrpper funtion to ensure 'subscribed users only')
- views.py            This file contains all of the view functions.

## Specification
For this project, I used Javascript, HTML, and CSS. For storing media files, in Setting.py, the base URL for serving media files is: '/media/'. Here is the index of specifications of the main parts:

- [Learn Center](#learn-center)
- [Learn IPA](#learn-ipa)
- [Pagination](#pagination)
- [Learn Text](#learn-text)
- [Learn Grammar](#learn-grammar)
- [Learn Words](#learn-words)
- [Learn Sentences](#learn-sentences)
- [Mistakes](#mistakes)
- [Profile](#profile)
- [Quotes](#quotes)
- [Exams](#exams)
- [Ask - Q&A](#ask---qa)
- [Search](#search)
- [Alerts & Messages](#alerts--messages)
- [Other functions](#other-functions)

## Learn Center
Users who are signed in will be routed to this page, as the index page. Users can click buttons to go to other sections and can also view the progress and status of learning.

## Learn IPA
In this part, a user an learn all about the English IPA, and even take a test. In order to play the appropriate sound when a user clicks on a cell, an audio player has to be implemented. The data model utilizes the FileField for storing and reading a file. 'Learn IPA' includes 4 subsections:

1. IPA
All the vowel sounds and consonant sounds are listed here, when you move your cursor to any cell, it becomes a hand symbol. When you click, it will play the associated sound. Altogether there are 5 groups of element sounds: Long Vowels, Short Vowels, Diphthongs, Unvoiced Consonants, and Voiced Consonants. Each group uses a table caption to display a title. Each group has a variant number of elements.

2. IPA example words
Similarly, you can click any cell and it will play the appropriate audio file.

3. Alphabet
Similarly, you can click any cell and it will play the appropriate audio file.

4. Test
Here the user will get a random question. He can play the audio of the question, go to the next question, backspace, clear, show the answer, or submit. If 'Show the Answer' is clicked, then this question becomes invalid and must click 'Next Question'. The VFD style display will show the result and the LCD style display shows a user's input. When 'Submit' is clicked, the Javascript will send a POST request to the view function to create a test recored. Below the LCD display is the virtual keyboard. Six rows of data generate six rows of keys. When each key is pressed, it will appear on the LCD screen. 'Backspace' will delete backward character by character, while 'Clear' will clear off all characters. When 'Submit' is clicked, if the user's answer is right, it will play an audio of success, if wrong an audio of wrong.

## Pagination
This is for pages that need pagination. Because I needed a different pagination style for certain pages, I coded two paginations.

Pagination A:
I've set the variable for items per page to 5. If there are 2 pages or more , and the current page is not the last page a “Next” button appears. If not on the first page, a “Previous” button appears. The number of the current active page is highlighted, and when you go to a new page it will be updated too. You can also input a number of the page number range and press enter or click on the 'Go' button to go to the page. The pagination buttons include: Previous, Page 1, the page range, Page last, Next, input field, 'Go' button. The start of the page range is set as either 1 or currentPage - 3, while the end of the page range either currentPage + 3 or totalPage. When the start page is greater than 2, then a ellipsis is displayed. When the end page is less than 'total page - 1', then an ellipsis is displayed. There is also a random page functionality to go to a random page.

Pagination B:
Similar to Pagination A. Additionally, it utilizes the local storage to store the current page number.

## Learn Text
This page is intended for learning a piece of text, like a paragraph worth memorizing. When the Test button is clicked, a full-page modal view will appear and let the user type in text. After clicking 'Submit', Javascript will dynamically create a full page to show the user if it was correct, along with the standard answer and the user's answer. It will also create a record via a POST request for the test in the database. When a user clicks on the 'Need more learning' button, it will send a POST request to the server to create a record so that I know the user would like to learn more frequently on certain items.

If the user studied this item before, the webpage will show the user the page studied last time. The view function will read the user's most recent study record of this item category and return the item ID. And then in javascript, the index number of the item ID is looked up in the data array to calculate its page number.

The view function is protected by my subscription wrapper, so this page can only be opened by a subscribed user. My wrapper function 'subscriptionRequired' will check if the is authenticated, has a related userprofile object attached to it using hasattr(request.user, 'userprofile'), and if the 'renewal_date' attribute greater than the current time. 

When the user first register an account, 7 days of a trial period will be granted. If the user is not subscribed and there is no more valid time remaining, then the user will see an error message reminding to subscribe. When the 'Subscribe/Unsubscribe' button is clicked, and if the user's balance is insufficient, then it will remind the user to add money. The function 'updateSubscription' calculates and sets the balance and renewal date.

When the webpage is unloaded or closed, it uses the 'beforeunload' event to send a POST request to the server to create a study record with the amount of time the user has spent on the page, if the user has stayed on this page for more than 3 seconds.

## Learn Grammar
This page is intended for learning grammar rules. In addition to the 'Need more learning' button, the user can click a button to 'Show/Hide English' sentences or 'Show/Hide Chinese' translations. For example sentences, there can be an audio player icon. The user can click it to play/pause.

Like that in the 'Learn Text' part, the page number studied last time is retrieved using data received from the server.

When the webpage is unloaded or closed, it uses the 'beforeunload' event to send a POST request to the server to create a study record with the amount of time the user has spent on the page, if the user has stayed on this page for more than 3 seconds.

This page can only be opened by a subscribed user.

## Learn Words
The main content is word title, the IPA symbols, audio player buttons, part of speech, explanation(s), Chinese translation of the explanation(s), example sentence(s), translation of the example sentence(s). Usually a word has more than a couple of explanations and parts of speech, so I need to make sure to loop through correctly, because each explanation also can contain multiple example sentences.

This part includes 'Need more learning' button, 'Test' button to take a quick test, 'Random' button to go to a random word, buttons to 'Show/Hide English' sentences or 'Show/Hide Chinese' translations.

Like that in the 'Learn Text' part, the page number studied last time is retrieved using data received from the server.

Optionally, it allows a picture to be shown to make it more appealing. The image div is created dynamically. If there is no image, then the text part will extend over and use the full width.

When the webpage is unloaded or closed, it uses the 'beforeunload' event to send a POST request to the server to create a study record with the amount of time the user has spent on the page, if the user has stayed on this page for more than 3 seconds.

This page can only be opened by a subscribed user.

## Learn Sentences
The main content is sentence, the Chinese translation of the sentence, optionally an audio player icon and an image div. The optional image div is created dynamically. If there is no image, then the text content will extend over and use the full width.

This part includes 'Need more learning' button, 'Test' button to take a quick test, 'Random' button to go to a random word, buttons to 'Show/Hide English' sentence or 'Show/Hide Chinese' translation.

Like that in the 'Learn Text' part, the page number studied last time is retrieved using data received from the server.

When the webpage is unloaded or closed, it uses the 'beforeunload' event to send a POST request to the server to create a study record with the amount of time the user has spent on the page, if the user has stayed on this page for more than 3 seconds.

This page can only be opened by a subscribed user.

## Mistakes
This page lists all the failed questions the user has answered for any tests and exams. The content includes: mistake count, question title, answer key, user's answer, the timestamp. If the question type is dictation, then an audio player is also implemented.

The mistake count was a little tricky, because I had to use a loop to calculate how many times each question has appeared in the whole list.

This page can only be opened by a subscribed user.

## Profile
Clicking on a username loads that user’s profile page. It displays the user's current balance, subscription status, valid use time until what date, the user's regiter date and time. Also it has a 'Add money to Balance' button to add more money to uesr's account and an 'Subscribe/Unsubscribe' button to toggle subscription status.

When the user clicks the 'Add money to Balance' button, it will open a modal dialogue box for the user to input a number to Add money. It must be a positive integer greater than 0.

## Quotes
This page shows wise words/quotes to motivate users to have a growth mindset. Here I use local storage to store the current page number. I've made an automatic carousel. Therefore, it automatically plays the next slide every 5 seconds. The user can click on the main content to toggle between 'Playing' and 'Stopped', and there will be a translucent Javascript message ribbon at the top of page notifying you of the change of status.

## Exams
It shows all the past exams taken. When clicked on a title of the exam records, it will show the detailed exam result, which includes correctness percentage, start time, end time of the exam, the questions of the exam, answer keys, the user's answers, whether the user's answer is correct.

There is also a 'Take a random exam' button. When it is clicked, it will route a user to the exam page with 5 random questions. The exam title is the string of 'Random Exam + date + time'. The time limit shows the amount of time allowed for taking this exam. Above the 'Start' button is the live clock of current time. Below the exam title, two elements are shown: 'Time limit' and the 'End time'. The 'Submit' button and all the input fields are disabled before the 'Start' button is clicked. After the 'Start' button is clicked, the 'Start' button will be disabled and the 'Submit' button and all the input fields will be enabled, and a timer is activated. If the time is up, and the user still hasn't clicked 'Submit', then it will automatically trigger submitting.

Because there are multiple questions and input fields, I use an array of key-value pairs to store the data. When the exam is submitted, the array will be sent to the view function to process. In the POST data body, I send this object of key-value pairs: { action: 'submit', examID: examID, answers: answers }. 'action' will let my view function know what kind of action to take. 'examID' is the ID of the exam. 'answers' is the key-value pairs of the question IDs and answers. 

## Ask - Q&A
The Ask link in the navigation bar takes users to a page where they can ask a question or see all question asked by other users, with the most recent ones first.

Each question card includes the question body, the username, the timestamp, 'Delete' and 'Edit' buttons (if the logged-in user is the author of the question). On the top right corner, there is a number badge showing how many replies it has received. When the title is clicked, it dynamically opens a view page which shows, in addition to the question, all the replies from other users. Similarly, if the logged-in user is the author of the replies, 'Delete' and 'Edit' buttons will be shown in the replies elements.

Users can write a new text-based question or reply by filling in a text area and then clicking a button to submit.

Users can click an “Edit” button to edit a question or a reply. When “Edit” is clicked, the content part is replaced with a textarea where the user can edit the content, and the 'Delete' button is replaced with 'Cancel' button, the 'Edit' button with 'Save' button. Additionally the view function is designed so that it is not possible for a user to edit another user’s question or reply.

## Search
Users can search for word entries by typing a query in the navigation bar's search box. If the query matches a word entry's name, its details will be displayed. Otherwise, a list of words containing the query as a substring will be shown. Clicking on any entry in the search results page will display the details of that entry.

## Alerts & Messages
For Django messages, my Javascript function 'setTimeoutForDjangoMessages' will make it stay for 1.5 seconds and then disappear.

Also, my Javascript function 'showAlertBanner' will show a nice looking alert banner notification for 1.5 seconds. The parameters are the color code and the message.

## Other functions
The 'upload_audio' function is for uploading the IPA entries. In the input fields you can input the title, note, tag, the IPA, and select and upload an audio file. The webpage also lists all the relevant items in the database and you can 'Edit' or 'Delete' each of the entries. The url is: 'upload/'

