function compareTest(answerKey) {
    const refreshButton = document.getElementById('refreshButton');
    const submitButton = document.getElementById('submitButton');
    const rightOrWrongIndicator = document.getElementById('rightOrWrongIndicator');
    const userAnswerInput = document.getElementById('quizInput');

    refreshButton.addEventListener('click', function () {
        userAnswerInput.value = '';
        rightOrWrongIndicator.innerHTML = '';
        userAnswerInput.focus();
    });

    submitButton.addEventListener('click', function() {
        // retrieve the value entered by the user
        const inputValue = userAnswerInput.value.trim();

        // compare user input with answerKey string  
        if (inputValue === answerKey) {
            // display 'correct' if the input matches
            rightOrWrongIndicator.innerHTML = '正确✅';
        } else {
            // display 'incorrect' if the input does not match
            rightOrWrongIndicator.innerHTML = '错误❌';
        }
    });
}
