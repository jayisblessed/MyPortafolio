from django import forms
from .models import PronunciationPart, Word, Explanation, Sentence, Grammar, Note, AudioFile

class UploadAudioForm(forms.ModelForm):
    class Meta:
        model = PronunciationPart
        fields = ('title', 'audioFile', 'note', 'ATag', 'theIPA')
        labels = {
            'title': 'Title',
            'audioFile': 'Audio File',
            'note': 'Note',
            'ATag': 'A Tag'
        }


class EditAudioForm(forms.ModelForm):
    class Meta:
        model = PronunciationPart
        fields = ('title', 'audioFile', 'note', 'ATag', 'theIPA')
        labels = {
            'title': 'Title',
            'audioFile': 'Audio File',
            'note': 'Note',
            'ATag': 'A Tag'
        }

    def __init__(self, *args, **kwargs):
        super(EditAudioForm, self).__init__(*args, **kwargs)
        self.fields['title'].label = "Title"
        self.fields['audioFile'].label = "File"
        self.fields['note'].label = "Note"
        self.fields['ATag'].label = "A Tag"


class WordForm(forms.ModelForm):
    class Meta:
        model = Word
        fields = ['word', 'theIPA']


class ExplanationForm(forms.ModelForm):
    class Meta:
        model = Explanation
        fields = ['partOfSpeech', 'explanation', 'explanationTrans']


class SentenceForm(forms.ModelForm):
    class Meta:
        model = Sentence
        fields = ['sentence', 'translation', 'audio']


class GrammarForm(forms.ModelForm):
    class Meta:
        model = Grammar
        fields = ['title', 'grammar', 'note']


class NoteForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ['title', 'note', 'explanation']


class AudioForm(forms.ModelForm):
    class Meta:
        model = AudioFile
        fields = ['audioFile']