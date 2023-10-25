from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.db.models import Sum, Q
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
import json, random
from .models import User, UserProfile, Word, Note, Grammar, Explanation, Sentence, StudyProfile, StudyRecord, Exam, Question, ExamRecord, AudioFile, FocalItem, UserPost, QuestionAnswerRecord, WiseWords, PronunciationPart, Text
from datetime import datetime, timedelta
import datetime
from decimal import Decimal
from django.core.serializers import serialize
from .forms import UploadAudioForm, EditAudioForm
from .utils import updateSubscription, subscriptionRequired


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        # Check if authentication successful
        if user is not None:
            login(request, user)
            # Get the UserProfile instance for the current user
            try:
                userProfile = request.user.userprofile
                if userProfile.subscribed:
                    # Call the separated calculation function for subscription
                    userProfile = updateSubscription(userProfile)
                    userProfile.save()
            except:
                return render(request, "mayslearning/login.html", {
                "message": "Invalid username and/or password."
            })
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "mayslearning/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "mayslearning/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "mayslearning/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            # create a UserProfile instance for the user
            userProfile = UserProfile.objects.create(user=user)
            # add seven days to the current date and time, as the renewal_date of a free trial period
            userProfile.renewal_date = timezone.now() + datetime.timedelta(days=7)
            userProfile.save()
        except IntegrityError:
            return render(request, "mayslearning/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "mayslearning/register.html")


@login_required
def index(request):
    user = request.user
    question_answered_count = QuestionAnswerRecord.objects.filter(user=user).count()
    question_correct_count = QuestionAnswerRecord.objects.filter(user=user, is_correct=True).count()
    try:
        question_correctness = (question_correct_count / question_answered_count) * 100
        # round it to 2 decimal places
        question_correctness = round(question_correctness, 2)
    except:
        question_correctness = 0

    sentence_count = Sentence.objects.count()
    sentence_learned_count = StudyRecord.objects.exclude(sentence=None).values('sentence').distinct().filter(user=user).count()
    word_count = Word.objects.count()
    word_learned_count = StudyRecord.objects.exclude(word=None).values('word').distinct().filter(user=user).count()
    grammar_count = Grammar.objects.count()
    grammar_learned_count = StudyRecord.objects.exclude(grammar=None).values('grammar').distinct().filter(user=user).count()

    try: 
        sentence_learned_percentage = (sentence_learned_count / sentence_count) * 100
        sentence_percentageRound = round(sentence_learned_percentage, 2)
    except:
        sentence_percentageRound = 0

    try:
        word_learned_percentage = (word_learned_count / word_count) * 100
        word_percentageRound = round(word_learned_percentage, 2)
    except:
        word_percentageRound = 0

    try: 
        grammar_learned_percentage = (grammar_learned_count / grammar_count) * 100
        grammar_percentageRound = round(grammar_learned_percentage, 2)
    except:
        grammar_percentageRound = 0

    # Retrieve all Study_Record instances
    # calculate the total duration of the duration field (or fall back to an empty timedelta object if the result is None or 0)
    total_duration = StudyRecord.objects.filter(user=request.user).aggregate(total_duration=Sum('duration'))['total_duration'] or timedelta()

    # Use divmod() to perform both division and modulus (remainder) calculations in a single operation.
    # 'hours' captures the quotient, which represents the number of whole hours in the duration
    # 'remainder' captures the remainder, which represents the remaining seconds after calculating the hours
    hours, remainder = divmod(total_duration.seconds, 3600)
    # further break down the remaining seconds obtained from the previous step into minutes and seconds
    minutes, seconds = divmod(remainder, 60)

    # Format the total duration as XX Hours, XX Minutes, XX Seconds
    formatted_duration = f"{hours} hours, {minutes} minutes, {seconds} seconds"

    context = {
        'question_answered_count': question_answered_count,
        'question_correct_count': question_correct_count,
        'question_correctness': question_correctness,
        'sentence_count': sentence_count,
        'sentence_learned_count': sentence_learned_count,
        'sentence_percentageRound': sentence_percentageRound,
        'word_count': word_count,
        'word_learned_count': word_learned_count,
        'word_percentageRound': word_percentageRound,
        'grammar_count': grammar_count,
        'grammar_learned_count': grammar_learned_count,
        'grammar_percentageRound': grammar_percentageRound,
        'formatted_duration': formatted_duration,
    }

    return render(request, 'mayslearning/learnCenter.html', context)


@login_required
def profile(request):
    user = request.user
    # the following data is for study activity indicator
    # the end date of the study activity indicator
    end_date = timezone.now().date()
    # the start date of the study activity indicator
    start_date = end_date - timedelta(days=365)

    study_records = StudyRecord.objects.filter(user=user, timestamp__date__range=(start_date, end_date))
    study_records_serialized = serialize('json', study_records)

    return render(request, 'mayslearning/profile.html', {
        'study_records': study_records_serialized,
        'start_date': start_date,
        'end_date': end_date,
    })


@login_required
def top_up_balance(request):
    if request.method == 'POST':
        amount = request.POST.get('amount')
        try:
            amount = Decimal(amount)
            if amount > 0:
                # add money to user's profile
                request.user.userprofile.balance += amount
                request.user.userprofile.save()
                messages.success(request, f'Your balance has been topped up by ${amount:.2f}.', extra_tags='success')
                return redirect('profile')
            else:
                messages.error(request, 'Please enter a valid amount.', extra_tags='danger')
        except:
            messages.error(request, 'Please enter a valid amount.', extra_tags='danger')
    return render(request, 'mayslearning/top_up_balance.html')


@login_required
def check_balance(request):
    userProfile = request.user.userprofile
    # warn the user if the money in the account is 3 or less
    if userProfile.balance <= 3:
        messages.error(request, 'Your balance is low. Please Add money to your balance.', extra_tags='danger')
    return redirect('profile')


# to toggle the subscription
@login_required
def toggleSubscription(request):
    if request.method == 'POST':
        user = request.user
        # set up the subscription fee
        subscription_fee = Decimal('3.00')
        # Get the UserProfile instance for the current user
        userProfile = user.userprofile
        # when the user's money is more than the subscription fee, allow toggling
        if userProfile.balance >= subscription_fee:
            userProfile.subscribed = not userProfile.subscribed
            # Call the updateSubscription function
            userProfile = updateSubscription(userProfile)
            userProfile.save()
        else:
            if userProfile.subscribed: # though the user's money is low, it should still be allowed to be unsubscribed
                userProfile.subscribed = not userProfile.subscribed
                # Call the updateSubscription function
                userProfile = updateSubscription(userProfile)
                userProfile.save()
                return redirect('profile')
            messages.error(request, 'Insufficient balance. Please Add money to your account.', extra_tags='danger')
    return redirect('profile')


@subscriptionRequired
def learnWords(request):
    return render(request, 'mayslearning/learnWords.html')


@subscriptionRequired
def api_learnWords(request):
    words = Word.objects.all().order_by('word')
    data_list = []

    # Retrieve the latest instance from the StudyRecord model, selecting only the instances whose 'word' field is not null
    try:
        lastWordID = StudyRecord.objects.exclude(word__isnull=True).filter(user=request.user).latest('timestamp').word.id
    except:
        lastWordID = None

    for word_i in words:
        # select all the explanation instances of the word instance
        explanations = word_i.explanations.all()
        data = {
            'id': word_i.id,
            'word': word_i.word,
            'theIPA': word_i.theIPA,
            'explanations': [],
            'note': '',
            'audio': {
                    'id': word_i.audio.id if word_i.audio else None,
                    'url': word_i.audio.audioFile.url if word_i.audio else None
            },
            'image': {
                'id': word_i.image.id if word_i.image else None,
                'url': word_i.image.image.url if word_i.image else None
            }
        }

        for explanation_i in explanations:
            sentences = explanation_i.sentences.all()
            explanation_data = {
                'wordClass': explanation_i.get_partOfSpeech_display(), # The get_title_display() method is automatically created by Django for fields with choices to retrieve the display value of the selected choice
                'explanation': explanation_i.explanation,
                'explanationTranslation': explanation_i.explanationTrans,
                'sentences': []
            }

            for sentence_instance in sentences:
                sentence_data = {
                    'sentence': sentence_instance.sentence,
                    'translation': sentence_instance.translation,
                    'audio': {
                        'id': sentence_instance.audio.id if sentence_instance.audio else None,
                        'url': sentence_instance.audio.audioFile.url if sentence_instance.audio else None
                        }
                }
                explanation_data['sentences'].append(sentence_data)

            data['explanations'].append(explanation_data)

        data_list.append(data)

    data_package = {
            'lastWordID': lastWordID,
            'data_list': data_list
        }

    return JsonResponse(data_package, safe=False)


@subscriptionRequired
def learnSentences(request):
    return render(request, 'mayslearning/learnSentences.html')


@subscriptionRequired
def api_learnSentences(request):
    if request.method == 'POST':
        pass
    else:
        sentences = Sentence.objects.all().order_by('sentence')
        data_list = []

        # Retrieve the latest instance from the StudyRecord model, selecting only the instances whose 'sentence' field is not null
        try:
            lastSentenceID = StudyRecord.objects.exclude(sentence__isnull=True).filter(user=request.user).latest('timestamp').sentence.id
        except:
            lastSentenceID = None

        for instance in sentences:
            sentence_data = {
                'id': instance.id,
                'sentence': instance.sentence,
                'translation': instance.translation,
                'note': instance.note,
                'audio': {
                    'id': instance.audio.id if instance.audio else None,
                    'url': instance.audio.audioFile.url if instance.audio else None
                },
                'image': {
                    'id': instance.image.id if instance.image else None,
                    'url': instance.image.image.url if instance.image else None
                }
            }
            data_list.append(sentence_data)
        
        data_package = {
            'lastSentenceID': lastSentenceID,
            'data_list': data_list
        }
        # setting safe=False, to indicate that the data can be any JSON-serializable object
        return JsonResponse(data_package, safe=False)


@subscriptionRequired
def learnGrammar(request):
    return render(request, 'mayslearning/learnGrammar.html')


@subscriptionRequired
def api_learnGrammar(request):
    grammar_all = Grammar.objects.all().order_by('title')
    data_list = []

    # Retrieve the latest instance from the StudyRecord model, selecting only the instances whose 'grammar' field is not null
    try:
        lastGrammarID = StudyRecord.objects.exclude(grammar__isnull=True).filter(user=request.user).latest('timestamp').grammar.id
    except:
        lastGrammarID = None

    for grammar_i in grammar_all:
        sentences = grammar_i.sentences.all()
        data = {
            'id': grammar_i.id,
            'title': grammar_i.title,
            'grammar': grammar_i.grammar,
            'note': grammar_i.note,
            'sentences': []
        }

        for sentence_instance in sentences:
            sentence_data = {
                'sentence': sentence_instance.sentence,
                'translation': sentence_instance.translation,
                'note': sentence_instance.note,
                'audio': {
                        'id': sentence_instance.audio.id if sentence_instance.audio else None,
                        'url': sentence_instance.audio.audioFile.url if sentence_instance.audio else None
                        }
            }
            data['sentences'].append(sentence_data)

        data_list.append(data)

    data_package = {
            'lastGrammarID': lastGrammarID,
            'data_list': data_list
        }
    return JsonResponse(data_package, safe=False)


@subscriptionRequired
def learnText(request):
    return render(request, 'mayslearning/learnText.html')


@subscriptionRequired
def learnText_api(request):
    if request.method == 'POST':
        pass
    else:
        texts = Text.objects.all().order_by('title')
        data_list = []

        # Retrieve the latest instance from the StudyRecord model, selecting only the instances whose 'text' field is not null
        try:
            lastTextID = StudyRecord.objects.exclude(text__isnull=True).filter(user=request.user).latest('timestamp').text.id
        except:
            lastTextID = None

        for text in texts:
            text_data = {
                'id': text.id,
                'title': text.title,
                'text': text.text,
            }
            data_list.append(text_data)
        
        data_package = {
            'lastTextID': lastTextID,
            'data_list': data_list
        }
        # setting safe=False, to indicate that the data can be any JSON-serializable object
        return JsonResponse(data_package, safe=False)


# upload, edit, and delete audio files for the pronunciation part
@login_required
def upload_audio(request):
    if request.method == 'POST':
        form = UploadAudioForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('upload_audio')  # Redirect to the same page to refresh the list of audio records
    else:
        form = UploadAudioForm()
    audio_records = PronunciationPart.objects.all()  # Fetch all audio records from the database
    return render(request, 'mayslearning/upload.html', {'form': form, 'audio_records': audio_records})


# edit audio files for the pronunciation part
@login_required
def edit_audio(request, record_id):
    record = get_object_or_404(PronunciationPart, id=record_id)
    if request.method == 'POST':
        # provide the form with the submitted data and files, and link the form to the specific model instance
        form = EditAudioForm(request.POST, request.FILES, instance=record)
        if form.is_valid():
            form.save()
            return redirect('upload_audio') # Redirect to the same page to refresh
    else:
        # populate the form fields with the instance's data
        form = EditAudioForm(instance=record)
    return render(request, 'mayslearning/edit_audio.html', {'form': form, 'record': record})


# delete audio files for the pronunciation part
@login_required
def delete_audio(request, record_id):
    record = get_object_or_404(PronunciationPart, id=record_id)
    if request.method == 'POST':
        record.delete()
        return redirect('upload_audio')
    return render(request, 'mayslearning/delete_audio.html', {'record': record})


def linked_audios_to_dict(instance):
    return {
        'title': instance.title,
        'theIPA': instance.theIPA,
        'id': instance.id,
        'audioFile': instance.audioFile.url,
        'note': instance.note,
        'ATag': instance.ATag,
    }


def get_linked_audios_dict(tag):
    queryset = PronunciationPart.objects.filter(ATag=tag).order_by('id')
    # create a new list by iterating over each object (obj) in the queryset 
    # and applying the linked_audios_to_dict function to each object
    return [linked_audios_to_dict(obj) for obj in queryset]


@login_required
def learn_IPA(request):
    return render(request, 'mayslearning/learnEngIPA.html')


@login_required
def learnEngIPA(request):
    theIPA = {
        'stress': get_linked_audios_dict('stress'),
        'longVowels': get_linked_audios_dict('longVowel'),
        'shortVowels': get_linked_audios_dict('shortVowel'),
        'diphthongs': get_linked_audios_dict('diphthong'),
        'unvoicedConsonants': get_linked_audios_dict('unvoicedConsonant'),
        'voicedConsonants': get_linked_audios_dict('voicedConsonant'),
        'longVowelEx': get_linked_audios_dict('longVowelEx'),
        'shortVowelEx': get_linked_audios_dict('shortVowelEx'),
        'diphthongEx': get_linked_audios_dict('diphthongEx'),
        'unvoicedConsonantEx': get_linked_audios_dict('unvoicedConsonantEx'),
        'voicedConsonantEx': get_linked_audios_dict('voicedConsonantEx'),
        'EngAlphabet': get_linked_audios_dict('EngAlphabet'),
    }
    return JsonResponse(theIPA, safe=False)


# update the count for test result whinin learning pages
@login_required
def update_test_count(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        record_id = data.get('record_id')
        study_record = StudyRecord.objects.get(id=record_id)
        # mistake count += 1
        study_record.mistakes += 1
        study_record.save()
        return JsonResponse({'message': 'Mistakes updated successfully.'})
    else:
        return JsonResponse({'message': 'Invalid request method.'})
    

# the general search function
def search(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            search_query = data.get('searchQuery', '')
            
            # Perform the search logic
            found_word = Word.objects.filter(word=search_query).first()
            # If an exact match is found, return the Word instance as JSON
            if found_word:
                explanations = found_word.explanations.all()
                data_list = []

                for explanation_i in explanations:
                    sentences = explanation_i.sentences.all()
                    sentence_list = []

                    for sentence_instance in sentences:
                        sentence_data = {
                            'sentence': sentence_instance.sentence,
                            'translation': sentence_instance.translation
                        }
                        sentence_list.append(sentence_data)

                    explanation_data = {
                        'wordClass': explanation_i.get_partOfSpeech_display(), # The get_title_display() method is automatically created by Django for fields with choices to retrieve the display value of the selected choice
                        'explanation': explanation_i.explanation,
                        'explanationTrans': explanation_i.explanationTrans,
                        'sentences': sentence_list
                    }

                    data_list.append(explanation_data)

                data = {
                    'word': found_word.word,
                    'theIPA': found_word.theIPA,
                    'explanations': data_list,
                    'note': ''
                }

                return JsonResponse(data)
            # If no exact match is found, return a list of words containing the letters of the search query
            else:
                # fetche the word field from instances that match the specified filter criteria and return a flat list of the values
                matching_words = Word.objects.filter(word__icontains=search_query).values_list('word', flat=True)
                data = {
                    'matching_words': list(matching_words)
                }

                return JsonResponse(data)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    
    return JsonResponse({'error': 'Invalid request method'})


@login_required
def theExam(request):    
    if request.method == 'POST':
        # first try to see if such and exam already exists
        try:
            exam = Exam.objects.latest('created_at')
        except:
            # Create a new exam. The timezone.localtime() function is to convert the UTC timestamp to the desired timezone
            title = 'Random Exam ' + timezone.localtime(timezone.now()).strftime('%Y-%m-%d %H:%M:%S')
            exam = Exam.objects.create(title=title, created_by=request.user, duration=datetime.datetime.timedelta(minutes=30))
        # '.total_seconds()' converts a timedelta object into a numerical value representing the duration in seconds
        duration_minutes = int(exam.duration.total_seconds() // 60)
        # The request.body attribute is accessed to get the JSON payload sent from the JavaScript code. 
        # The json.loads() function is used to parse the JSON data into a Python dictionary
        payload = json.loads(request.body)
        action = payload.get('action')
        if action == 'start':
            # create an ExamRecord
            startTime = timezone.now()
            examRecord = ExamRecord(
                user=request.user,
                exam=exam,
                start_time=startTime,            
                )
            examRecord.save()
             # Calculate the end time for the exam (60 minutes from now)
            end_time = timezone.now() + timedelta(minutes=60)

            # Return the end time as a JSON response with the appropriate content type
            return JsonResponse({'end_time': end_time.strftime('%Y-%m-%d %H:%M:%S'), 'duration_minutes': duration_minutes}, content_type='application/json')

        examID = payload.get('examID')
        if action == 'submit' and examID:
            userAnswers = payload.get('answers')
            questions = exam.questions.all()
            # safely access the examRecord
            try:
                examRecord = ExamRecord.objects.get(exam__id=examID)
                examRecord.end_time = timezone.now()
                examRecord.is_finished = True
                examRecord.save()
                # check the user's answer for each question
                correctCount = 0
                for question in questions:
                    question_id = str(question.id)
                    if question_id in userAnswers:
                        userAnswer = userAnswers[question_id]
                        if question.answer == userAnswer:
                            is_correct = True
                            correctCount = correctCount + 1
                        else: 
                            is_correct = False
                        # Create a questionAnswerRecord instance for the question of the exam, and save it
                        questionAnswerRecord = QuestionAnswerRecord.objects.create(
                            user=request.user,
                            examRecord=examRecord,
                            question=question,
                            is_correct=is_correct,
                            user_answer=userAnswer
                        )
                        questionAnswerRecord.save()
                return examResult(request, examID)
            except ExamRecord.DoesNotExist:
                return JsonResponse({'error': 'Exam record not found.'})

    # For GET request:
    # Get the Exam instances with is_random=True and no related Exam_record instances
    exams_to_delete = Exam.objects.filter(is_random=True, exam_records__isnull=True)
    # Delete the exams
    exams_to_delete.delete()
    # Create a new random exam
    try:
        # randomly select 5 Question objects that do not have the note 'IPA', 'SENTENCE', 'TEXT', 'WORD'
        questions = random.sample(list(Question.objects.exclude(Q(note='IPA') | Q(note='TEXT') | Q(note='WORD') | Q(note='SENTENCE')).all()), 5) 
    except:
        return render(request, 'mayslearning/error.html', {
                    'message': 'There are no questions in the database.'
                })
    # Use the timezone.localtime() function to convert the UTC timestamp to the desired timezone
    title = 'Random Exam ' + timezone.localtime(timezone.now()).strftime('%Y-%m-%d %H:%M:%S')
    # Create a new exam
    exam = Exam.objects.create(title=title, created_by=request.user, duration=datetime.timedelta(minutes=30))
    #  assign the set of questions to the data model field
    exam.questions.set(questions)
    
    duration_minutes = int(exam.duration.total_seconds() // 60)
    # Calculate the exam end time
    end_time = timezone.now() + exam.duration

    context = {
        'exam': exam,
        'end_time': end_time,
        'duration_minutes': duration_minutes
    }

    return render(request, 'mayslearning/theExam.html', context)


# to show a specific exam result
@login_required
def examResult(request, theId):
    try:
        exam_record = ExamRecord.objects.get(exam_id=theId)
        exam = exam_record.exam
        start_time = exam_record.start_time
        end_time = exam_record.end_time
        # efficiently access the related question objects associated with the question_answer_records without making additional database queries
        question_answer_records = exam_record.question_answer_records.select_related('question')
        total_questions = question_answer_records.count()
        correct_answers = question_answer_records.filter(is_correct=True).count()
        percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

        context = {
            'exam_title': exam.title,
            'start_time': start_time,
            'end_time': end_time,
            'question_answer_records': question_answer_records,
            'percentage': percentage,
        }

        return render(request, 'mayslearning/examResult.html', context)
    
    except ExamRecord.DoesNotExist:
        return render(request, 'mayslearning/error.html', {
                    'message': 'Exam record not found.'
                })


@login_required
def examResults(request):
    return render(request, 'mayslearning/examResults.html')


@login_required
def examResults_api(request):
    user = request.user
    if request.method == 'POST':
        pass
    else:
        examResults = ExamRecord.objects.filter(user=user).order_by('-timestamp')

        data_list = []
        # for deleting the unfinished exam records
        unfinished_examRecords_to_delete = []

        for record in examResults:
            # if the exam is unfinished, append it for deletion
            if record.is_finished is False:
                unfinished_examRecords_to_delete.append(record)
            else:
                # efficiently access the related question objects associated with the question_answer_records without making additional database queries
                question_answer_records = record.question_answer_records.select_related('question')
                total_questions = question_answer_records.count()
                correct_answers = question_answer_records.filter(is_correct=True).count()
                percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

                # Convert the datetime object to a string representation
                timestamp_str = timezone.localtime(record.timestamp).strftime('%m/%d/%Y, %H:%M:%S')

                exam_record = {
                    'id': record.id,
                    'userName': record.user.username,
                    'timestamp': timestamp_str,
                    'examId': record.exam.id,
                    'examTitle': record.exam.title,
                    'percentage': percentage
                }
                data_list.append(exam_record)

        data_package = {
            'data_list': data_list
        }

        #delete the unfinished exam records
        if unfinished_examRecords_to_delete:
            for record in unfinished_examRecords_to_delete:
                record.delete()

        # setting safe=False, to indicate that the data can be any JSON-serializable object
        return JsonResponse(data_package, safe=False)
    

@login_required
def create_question_answer_record(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        is_correct = data.get('is_correct')
        user_answer = data.get('user_answer')
        questionType = data.get('questionType')
        difficultyLevel = data.get('difficultyLevel')
        skillType = data.get('skillType')
        note = data.get('note')
        question_text = data.get('question')
        answer_text = data.get('answer')
        audio_path = data.get('audio')

        user = request.user

        # Try to retrieve the AudioFile instance based on the audio path
        audio = AudioFile.objects.filter(audioFile=audio_path).first()

        # If the AudioFile instance doesn't exist, create a new one
        if not audio:
            audio = AudioFile.objects.create(audioFile=audio_path)

        # Create the Question instance
        question = Question.objects.create(
            user=user,
            question=question_text,
            answer=answer_text,
            audio=audio,
            difficultyLevel=difficultyLevel,
            skillType=skillType,
            questionType=questionType,
            note=note
        )

        # Create the QuestionAnswerRecord instance
        questionAnswerRecord = QuestionAnswerRecord.objects.create(
            user=user,
            is_correct=is_correct,
            user_answer=user_answer,
            question=question
        )

        # Return a JSON response indicating success
        response_data = {'message': 'Question_answer_record created successfully'}
        return JsonResponse(response_data)

    # Return a JSON response indicating failure if the request method is not POST
    response_data = {'message': 'Invalid request method'}
    return JsonResponse(response_data, status=400)


@login_required
def create_timing_record(request):
    if request.method == 'POST':
        # Retrieve the timing data from the request
        data = json.loads(request.body)
        itemType = data.get('itemType')
        itemId = int(data.get('itemId'))

        # Validate the item type
        if itemType not in ['sentence', 'word', 'grammar', 'text']:
            return JsonResponse({'failure': 'Bad request'}, status=400)

        # Create the study record based on the item type
        study_record = None
        if itemType == 'sentence':
            study_record = StudyRecord(user=request.user, sentence_id=itemId)
        elif itemType == 'word':
            study_record = StudyRecord(user=request.user, word_id=itemId)
        elif itemType == 'grammar':
            study_record = StudyRecord(user=request.user, grammar_id=itemId)
        elif itemType == 'text':
            study_record = StudyRecord(user=request.user, text_id=itemId)

        if study_record is None:
            return JsonResponse({'failure': 'Bad request'}, status=400)

        time = float(data.get('time'))        
        # Convert the duration from seconds to timedelta
        duration = timedelta(seconds=time)

        # Set the timestamp and duration
        study_record.timestamp = timezone.now()
        study_record.duration = duration

        # Save the study record if conditions are met
        if time >= 2 and (study_record.grammar_id is not None or study_record.sentence_id is not None or study_record.word_id is not None or study_record.text_id is not None):
            study_record.save()

        return JsonResponse({'success': True})


def wisewords(request):
    return render(request, 'mayslearning/wiseWords.html')


def wisewordsAPI(request):
    if request.method == 'POST':
        pass
    else:
        # Retrieve all WiseWords instances
        wisewords = WiseWords.objects.all().order_by('content')

        data_list = []

        for instance in wisewords:
            wiseWords_data = {
                'id': instance.id,
                'content': instance.content,
                'translation': instance.translation,
                'author': instance.author,
            }

            data_list.append(wiseWords_data)
        
        data_package = {
            'data_list': data_list
        }

        # setting safe=False, to indicate that the data can be any JSON-serializable object
        return JsonResponse(data_package, safe=False)


@login_required
def createFocalItems(request):
    if request.method == 'POST' and request.headers.get('Content-Type') == 'application/json':
        try:
            # Parse a JSON-formatted string and convert it into a Python object
            data = json.loads(request.body)
            
            # Extract the necessary data
            userId = request.user.id
            itemType = data.get('itemType')  # 'word', 'sentence', or 'grammar'
            itemId = data.get('itemId')
            level = 1 # set a default value for 'level'
            
            # Check if the DifficultItems instance already exists for the user and itemId
            focalItem = FocalItem.objects.filter(user_id=userId)
            if itemType == 'word':
                focalItem = focalItem.filter(word_id=itemId)
            elif itemType == 'sentence':
                focalItem = focalItem.filter(sentence_id=itemId)
            elif itemType == 'grammar':
                focalItem = focalItem.filter(grammar_id=itemId)
            
            if focalItem.exists():
                # Update the existing instance
                focalItem = focalItem.first()
                focalItem.level = focalItem.level + 1
            else:
                # Create a new instance
                focalItem = FocalItem.objects.create(
                    user_id=userId,
                    level=level
                )
                # Check and assign the related object to the foreign key field
                if itemType == 'word':
                    word = Word.objects.get(id=itemId)
                    focalItem.word = word
                elif itemType == 'sentence':
                    sentence = Sentence.objects.get(id=itemId)
                    focalItem.sentence = sentence
                elif itemType == 'grammar':
                    grammar = Grammar.objects.get(id=itemId)
                    focalItem.grammar = grammar
            
            # Save it
            focalItem.save()
            
            return JsonResponse({'status': 'success'})
        
        except (ValueError, KeyError, Word.DoesNotExist, Sentence.DoesNotExist, Grammar.DoesNotExist) as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)


@subscriptionRequired
def pastMistakes(request):
    return render(request, 'mayslearning/pastMistakes.html')


@login_required
def pastMistakes_api(request):
    user = request.user
    if request.method == 'POST':
        pass
    else:
        question_answer_all = QuestionAnswerRecord.objects.filter(user=user, is_correct=False).select_related('question').order_by('-timestamp')

        data_list = []
        for record in question_answer_all:
            question = record.question

            # Loop to get the count of occurences for each record
            mistakeCount = 0
            for i in question_answer_all:
                if question.id == i.question.id:
                    mistakeCount += 1

            # Convert the datetime object to a string representation
            timestamp_str = timezone.localtime(record.timestamp).strftime('%m/%d/%Y, %H:%M:%S')

            # Conditionally assign the audio url
            try:
                audioURL = question.audio.audioFile.url
                audioId = question.audio.id
            except:
                audioURL = ''
                audioId = ''

            question_answer_record = {
                'id': record.id,
                'userAnswer': record.user_answer,
                'timestamp': timestamp_str,
                'question': question.question,
                'answer': question.answer,
                'audio': {
                        'id': audioId,
                        'url': audioURL
                        },
                'mistakeCount': mistakeCount
            }
            data_list.append(question_answer_record)

        data_package = {
            'data_list': data_list
        }

        # Setting safe=False, to indicate that the data can be any JSON-serializable object
        return JsonResponse(data_package, safe=False)
    

# get all the user questions
@login_required
def userPosts_api(request):
    if request.method == 'GET':
        # retrieve all instances where the parent field is null and order the results based on the timestamp field in descending order
        userQuestions = UserPost.objects.filter(parent__isnull=True).order_by('-timestamp')
        questions = []
        for question in userQuestions:
            # for the time, use the timezone.localtime() function to convert the UTC timestamp to the desired timezone
            timestamp_str_question = timezone.localtime(question.timestamp).strftime('%m/%d/%Y, %H:%M:%S')
            userReply_list = []
            userReplies = question.replies.all()
            for userReply in userReplies:
                timestamp_str_userReply = timezone.localtime(userReply.timestamp).strftime('%m/%d/%Y, %H:%M:%S')

                # the userReply_list is not yet used in this version of my web app
                userReply_list.append({
                    'author': userReply.user.username,  # extract username directly
                    'content': userReply.content,
                    'timestamp': timestamp_str_userReply,
                })

            questions.append({
                'id': question.id,
                'author': question.user.username,
                'content': question.content,
                'timestamp': timestamp_str_question,
                'replyCount': userReplies.count()
            })

        data_package = {
            'data_list': questions,
            'loggedInUser': request.user.username
        }

        # setting safe=False, to indicate that the data can be any JSON-serializable object
        return JsonResponse(data_package, safe=False)


@login_required
def post_question(request):
    loggedInUsername = request.user.username
    if request.method == 'POST':
        data = json.loads(request.body)
        content = data.get('content')
        user = request.user
        timestamp = timezone.now()
        question = UserPost.objects.create(user=user, content=content, timestamp=timestamp)

        if question:
            return JsonResponse({'message': 'Successful.'})
        else:
            return JsonResponse({'message': 'Failed to create question.'}, status=500)
    else:
        return render(request, 'mayslearning/userQuestions.html', {'loggedInUsername': loggedInUsername})
    

@login_required
def edit_post(request, post_id):
    if request.method == 'POST':
        # fetch the Post object or raise an Http404 exception
        post = get_object_or_404(UserPost, pk=post_id)

        # if the post author is not the user of the request
        if post.user != request.user:
            return JsonResponse({'error': 'You can only edit your own post.'}, status=400)
    
        # parse the JSON string and convert it into a Python object
        body_data = json.loads(request.body)
        text = body_data['text']
        action = body_data['action']

        # deletion
        if action == 'DELETE':
            post.delete()
            return JsonResponse({'success': True, 'message': 'Operation completed successfully.'})

        # if the input is None or empty
        if text is None or text.strip() == '':
            return JsonResponse({'error': 'The post cannot be empty.'}, status=400)
        
        # if the content has not changed
        if text == post.content:
            return JsonResponse({'error': 'The content has not changed.'}, status=400)
        
        # get and assign the value of the key "text"
        post.content = body_data.get("text")
        post.timestamp = timezone.now()
        post.save()
        data = {'content': post.content}
        return JsonResponse(data)
    else:
        return render(request, 'mayslearning/error.html', {
                    'message': 'Your request must be sent via POST method.'
                })


@login_required
def post_comment(request, question_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            content = data.get('content')
            timestamp = timezone.now()
            # get the question post instance
            thePost = get_object_or_404(UserPost, pk=question_id)
            # create a new reply
            theReply = UserPost.objects.create(user=request.user, content=content, parent=thePost, timestamp=timestamp)
            
            reply_data = {
                'content': theReply.content,
            }
            
            return JsonResponse(reply_data)
        
        except UserPost.DoesNotExist:
            return JsonResponse({
                'error': 'Question not found.',
            }, status=404)
    else:
        return JsonResponse({
            'error': 'Invalid request method.',
        }, status=400)
    

@login_required
def deleteComment(request, comment_id):
    if request.method == 'POST':
        try:
            comment = UserPost.objects.get(id=comment_id)

            # if the post author is not the user of the request
            if comment.user != request.user:
                return JsonResponse({'error': 'You can only edit your own reply.'}, status=400)
        
            comment.delete()
            return JsonResponse({'success': True})
        
        except UserPost.DoesNotExist:
            return JsonResponse({'error': 'Reply not found.'}, status=404)
    
    return JsonResponse({'error': 'Invalid request method.'}, status=400)


@login_required
def editComment(request, comment_id):
    if request.method == 'POST':
        try:
            comment = UserPost.objects.get(id=comment_id)

            # if the post author is not the user of the request
            if comment.user != request.user:
                return JsonResponse({'error': 'You can only edit your own reply.'}, status=400)
            
            body_data = json.loads(request.body)
            comment.content = body_data['content']
            comment.save()
            
            return JsonResponse({'success': True, 'content': comment.content})
        except UserPost.DoesNotExist:
            return JsonResponse({'error': 'Reply not found.'}, status=404)
    
    return JsonResponse({'error': 'Invalid request method.'}, status=400)


@login_required
def userComments_api(request, question_id):
    try:
        # get the question post instance of the question_id
        userPost = UserPost.objects.get(id=question_id)
        comments = userPost.replies.all()
        timestamp_str_userPost = timezone.localtime(userPost.timestamp).strftime('%m/%d/%Y, %H:%M:%S')
        userPost_data = {
            'id': userPost.id,
            'user': userPost.user.username,
            'content': userPost.content,
            'timestamp': timestamp_str_userPost
        }
        
        comments_data = []
        for comment in comments:
            timestamp_str_comment = timezone.localtime(comment.timestamp).strftime('%m/%d/%Y, %H:%M:%S')
            comment_data = {
                'id': comment.id,
                'user': comment.user.username,
                'content': comment.content,
                'timestamp': timestamp_str_comment,
            }
            comments_data.append(comment_data)

        return JsonResponse({
            'question': userPost_data,
            'comments': comments_data
        })
    
    except UserPost.DoesNotExist:
        return JsonResponse({
            'error': 'Question not found.',
        }, status=404)


# automatically generate question using existing words and sentences in the database
@login_required
def generate_questions(request):
    user = request.user

    # generate questions for sentences
    allSentences = Sentence.objects.all()
    for instance in allSentences:
        # check if such a question alread exists, for fill-in-the-blank questions
        duplicateA = Question.objects.filter(
            Q(question__iexact=instance.translation) &
            Q(questionType='fill_in')
            ).exists()

        if not duplicateA:
            # create the fill-in-the-blank questions
            questionFill = Question.objects.create(
                user=user,
                question=instance.translation,
                answer=instance.sentence,
                difficultyLevel='medium',
                skillType='vocabulary',
                questionType='fill_in',
            )

        # check if such a question alread exists, for dictation questions
        duplicateB = Question.objects.filter(
            Q(audio__exact=instance.audio) &
            Q(questionType='dictation')
            ).exists()

        if not duplicateB:
            # create the dictation questions
            if instance.audio and instance.audio.audioFile is not None and instance.audio.audioFile != '':
                # Create dictation Question instance
                questionDict = Question.objects.create(
                    user=user,
                    question='Please type what you hear.',
                    answer=instance.sentence,
                    audio=instance.audio,
                    difficultyLevel='medium',
                    skillType='vocabulary',
                    questionType='dictation',
                )
    
    # generate questions for words
    allWords = Word.objects.all()
    for instance in allWords:
        explanations = instance.explanations.all()
        # join all the elements in the list, using a semicolon and space separator in between each itration of the lists. When done, add a semicolon. 
        explanation_text = '; '.join([f'{explanation.get_partOfSpeech_display()}, {explanation.explanation} {explanation.explanationTrans}' for explanation in explanations]) + ';'

        # check if such a question alread exists, for fill-in-the-blank questions
        duplicateA = Question.objects.filter(
            Q(question__iexact=explanation_text) &
            Q(questionType='fill_in')
            ).exists()

        if not duplicateA:
            # create the fill-in-the-blank questions
            questionFill = Question.objects.create(
                user=user,
                question=explanation_text,
                answer=instance.word,
                difficultyLevel='medium',
                skillType='vocabulary',
                questionType='fill_in',
            )

        # check if such a question alread exists, for dictation questions
        duplicateB = Question.objects.filter(
            Q(audio__exact=instance.audio) &
            Q(questionType='dictation')
            ).exists()

        if not duplicateB:
            if instance.audio and instance.audio.audioFile is not None and instance.audio.audioFile != '':
                # create the dictation questions
                questionDict = Question.objects.create(
                    user=user,
                    question='Please type what you hear.',
                    answer=instance.word,
                    audio=instance.audio,
                    difficultyLevel='easy',
                    skillType='vocabulary',
                    questionType='dictation',
                )

    return render(request, "mayslearning/success.html", {
                "message": "The questions have been successfully created."
            })
