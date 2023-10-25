from django.contrib import admin

# Register your models here.
from .models import PronunciationPart, User, AudioFile, Word, Explanation, Sentence, Note, Grammar, WiseWords, Question, Transaction, UserProfile, StudyProfile, StudyRecord, QuestionAnswerRecord, StudyRecord, Exam, ExamRecord, UserPost, FocalItem, ImageFile, Text

admin.site.register(User)
admin.site.register(UserProfile)
admin.site.register(PronunciationPart)
admin.site.register(Word)
admin.site.register(Sentence)
admin.site.register(WiseWords)
admin.site.register(Question)
admin.site.register(Transaction)
admin.site.register(StudyProfile)
admin.site.register(StudyRecord)
admin.site.register(QuestionAnswerRecord)
admin.site.register(AudioFile)
admin.site.register(Explanation)
admin.site.register(Note)
admin.site.register(Grammar)
admin.site.register(Exam)
admin.site.register(ExamRecord)
admin.site.register(FocalItem)
admin.site.register(UserPost)
admin.site.register(ImageFile)
admin.site.register(Text)
