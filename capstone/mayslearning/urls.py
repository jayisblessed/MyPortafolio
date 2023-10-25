from django.urls import path

from . import views


urlpatterns = [
    path("", views.index, name="index"),
    path('login/', views.login_view, name='login'),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('upload/', views.upload_audio, name='upload_audio'),
    path('generate_questions/', views.generate_questions, name='generate_questions'),
    path('top_up_balance/', views.top_up_balance, name='top_up_balance'),
    path('check_balance/', views.check_balance, name='check_balance'),
    path('profile/', views.profile, name='profile'),
    path('toggleSubscription/', views.toggleSubscription, name='toggleSubscription'),
    path('learnWords/', views.learnWords, name='learnWords'),
    path('learnSentences/', views.learnSentences, name='learnSentences'),
    path('edit_audio/<int:record_id>/', views.edit_audio, name='edit_audio'),
    path('delete_audio/<int:record_id>/', views.delete_audio, name='delete_audio'),
    path("learnEngIPA", views.learnEngIPA, name="learnEngIPA"),
    path("learn_IPA", views.learn_IPA, name="learn_IPA"),
    path("learnGrammar", views.learnGrammar, name="learnGrammar"),
    path("learnText", views.learnText, name="learnText"),
    path('search/', views.search, name='search'),
    path('theExam/', views.theExam, name='theExam'),
    path('examResult/<int:theId>/', views.examResult, name='examResult'),
    path('questionAnswerRecord/create/', views.create_question_answer_record, name='create_question_answer_record'),
    path('create_timing_record/', views.create_timing_record, name='create_timing_record'),
    path('post_question/', views.post_question, name='post_question'),
    path('examResults/', views.examResults, name='examResults'),
    path('api/userQuestions/', views.userPosts_api, name='userQuestions_api'),
    path('api/learnSentences/', views.api_learnSentences, name='api_learnSentences'),
    path('api/learnWords/', views.api_learnWords, name='api_learnWords'),
    path('api/learnGrammar/', views.api_learnGrammar, name='api_learnGrammar'),
    path('api/learnText/', views.learnText_api, name='learnText_api'),
    path('api/pastMistakes/', views.pastMistakes_api, name='pastMistakes_api'),
    path('api/examResults/', views.examResults_api, name='examResults_api'),
    path('editpost/<int:post_id>/', views.edit_post, name='edit_post'),
    path('wisewords/', views.wisewords, name='wisewords'),
    path('api/wisewords/', views.wisewordsAPI, name='wisewordsAPI'),
    path('pastMistakes/', views.pastMistakes, name='pastMistakes'),
    path('createFocalItems/', views.createFocalItems, name='createFocalItems'),
    path('api/question/<int:question_id>/comments/', views.userComments_api, name='get_question_comments'),
    path('question/<int:question_id>/comment/', views.post_comment, name='post_comment'),
    path('api/comment/<int:comment_id>/delete/', views.deleteComment, name='delete_comment'),
    path('api/comment/<int:comment_id>/edit/', views.editComment, name='edit_comment'),
]

# serve my media files during development
from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)