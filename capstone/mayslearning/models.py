from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import timedelta


# Create your models here.
class User(AbstractUser):
    pass

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile')
    birthDate = models.DateField(blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    renewal_date = models.DateTimeField(null=True)
    balance = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    subscribed = models.BooleanField(default=False)
    description = models.CharField(max_length=255, blank=True, null=True)
    userID = models.CharField(max_length=9, unique=True, null=True, blank=True)


class AudioFile(models.Model):
    audioFile = models.FileField(upload_to='audios/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.audioFile.name}"


class ImageFile(models.Model):
    image = models.FileField(upload_to='images/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.image.name}"
    

class StudyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    comments = models.CharField(max_length=255, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    myLevel = models.IntegerField(default=0)
    growthIndex = models.IntegerField(default=0)
    

# For all the transactions and invoices
class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=[('credit', 'Credit'), ('debit', 'Debit')])
    description = models.CharField(max_length=255, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class WiseWords(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content =  models.CharField(max_length=512)
    translation =  models.CharField(max_length=512, null=True, blank=True)
    author = models.CharField(max_length=128, null=True, blank=True)
    timestamp = models.DateTimeField(null=True)


class Sentence(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sentence = models.CharField(max_length=512)
    translation = models.CharField(max_length=512, null=True, blank=True)
    note = models.CharField(max_length=256, null=True, blank=True)
    audio = models.ForeignKey(AudioFile, on_delete=models.SET_NULL, null=True, blank=True, related_name='sentences')
    image = models.ForeignKey(ImageFile, on_delete=models.SET_NULL, null=True, blank=True, related_name='sentences')

    def __str__(self):
        return self.sentence


class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, null=True, blank=True)
    note = models.TextField()
    explanation = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title    


class Text(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, null=True, blank=True)
    text = models.TextField()
    notes = models.ManyToManyField(Note, null=True, blank=True, related_name='texts')


class Explanation(models.Model):
    PARTS_OF_SPEECH = [
        ("n", "noun"),
        ("pron", "pronoun"),
        ("adj", "adjective"),
        ("v", "verb"),
        ("adv", "adverb"),
        ("prep", "preposition"),
        ("conj", "conjunction"),
        ("art", "article"),
        ("inter", "interjection")
    ]
    partOfSpeech = models.CharField(max_length=18, choices=PARTS_OF_SPEECH, null=True, blank=True)
    explanation = models.CharField(max_length=512, null=True, blank=True)
    explanationTrans = models.CharField(max_length=512, null=True, blank=True)
    sentences = models.ManyToManyField(Sentence, blank=True)

    def __str__(self):
        return self.explanation


class Grammar(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, blank=True, null=True)
    grammar = models.TextField()
    note = models.TextField(blank=True, null=True)
    sentences = models.ManyToManyField(Sentence, blank=True, null=True)

    def __str__(self):
        return self.title


class Word(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    word = models.CharField(max_length=128)
    theIPA = models.CharField(max_length=16, null=True, blank=True)
    explanations = models.ManyToManyField(Explanation, null=True, blank=True, related_name='words')
    grammar = models.ManyToManyField(Grammar, null=True, blank=True, related_name='words')
    notes = models.ManyToManyField(Note, null=True, blank=True, related_name='words')
    audio = models.ForeignKey(AudioFile, on_delete=models.SET_NULL, null=True, blank=True, related_name='words')
    image = models.ForeignKey(ImageFile, on_delete=models.SET_NULL, null=True, blank=True, related_name='words')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.word


class Question(models.Model):
    QUESTION_TYPES = [
        ('fill_in', 'Fill-in-the-blank'),
        ('short_answer', 'Short Answer'),
        ('dictation', 'Dictation'),
    ]
    SKILL_TYPES = [
        ('listening', 'Listening'),
        ('grammar', 'Grammar'),
        ('vocabulary', 'Vocabulary'),
    ]

    DIFFICULTY = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('pro', 'Professional'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.TextField()
    audio = models.ForeignKey(AudioFile, on_delete=models.SET_NULL, blank=True, null=True, related_name='questions')
    answer = models.TextField()
    points = models.IntegerField(default=1)
    timestamp = models.DateTimeField(auto_now=True)
    note = models.CharField(max_length=32, blank=True, null=True)
    questionType = models.CharField(max_length=20, choices=QUESTION_TYPES)
    difficultyLevel = models.CharField(max_length=20, choices=DIFFICULTY)
    skillType = models.CharField(max_length=20, choices=SKILL_TYPES)

    def __str__(self):
        return self.question


class StudyRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='study_records', blank=True, null=True)
    sentence = models.ForeignKey(Sentence, on_delete=models.CASCADE, related_name='study_records', blank=True, null=True)
    grammar = models.ForeignKey(Grammar, on_delete=models.CASCADE, related_name='study_records', blank=True, null=True)
    text = models.ForeignKey(Text, on_delete=models.CASCADE, related_name='study_records', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField()


class PronunciationPart(models.Model):
    title = models.CharField(max_length=128)
    theIPA = models.CharField(max_length=32, blank=True, null=True)
    note = models.CharField(max_length=128, blank=True, null=True)
    ATag = models.CharField(max_length=32, blank=True, null=True)
    audioFile = models.FileField(upload_to='audios/', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    def serialize(self):
        return {
            "title": self.title,
            "note": self.note,
            "ATag": self.ATag,
            "audioFile": self.audioFile,
            "timestamp": self.timestamp,
        }

    
class Exam(models.Model):
    title = models.CharField(max_length=200)
    questions = models.ManyToManyField(Question)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(default=timedelta(minutes=30))
    is_random = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class ExamRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_records')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='exam_records')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(null=True)
    is_finished = models.BooleanField(default=False)
 
    def __str__(self):
        return f"{self.exam} taken by {self.user}"


class QuestionAnswerRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='question_answer_records')
    examRecord = models.ForeignKey(ExamRecord, on_delete=models.CASCADE, related_name='question_answer_records', blank=True, null=True)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='question_answer_records')
    is_correct = models.BooleanField(null=True)
    user_answer = models.CharField(max_length=500, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.question} answered by {self.user}"


class UserPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    timestamp = models.DateTimeField()
    liked_by = models.ManyToManyField(User, related_name='liked_posts')
    def __str__(self):
        return f"Post {self.id} by {self.user.username}"



class FocalItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='focalItems', blank=True, null=True)
    sentence = models.ForeignKey(Sentence, on_delete=models.CASCADE, related_name='focalItems', blank=True, null=True)
    grammar = models.ForeignKey(Grammar, on_delete=models.CASCADE, related_name='focalItems', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.IntegerField(blank=True, null=True, default=0)
