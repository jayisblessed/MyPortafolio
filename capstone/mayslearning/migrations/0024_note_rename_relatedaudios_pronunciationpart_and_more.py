# Generated by Django 4.1.7 on 2023-05-12 19:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0023_remove_explanation_word'),
    ]

    operations = [
        migrations.CreateModel(
            name='Note',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=200, null=True)),
                ('note', models.TextField()),
                ('extraNote', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.RenameModel(
            old_name='RelatedAudios',
            new_name='PronunciationPart',
        ),
        migrations.DeleteModel(
            name='Text',
        ),
        migrations.RenameField(
            model_name='explanation',
            old_name='explanationTranslation',
            new_name='explanationTrans',
        ),
        migrations.RenameField(
            model_name='grammar',
            old_name='topic',
            new_name='title',
        ),
        migrations.RemoveField(
            model_name='explanation',
            name='wordClass',
        ),
        migrations.RemoveField(
            model_name='question',
            name='created_by',
        ),
        migrations.RemoveField(
            model_name='sentence',
            name='wordRelated',
        ),
        migrations.RemoveField(
            model_name='word',
            name='note',
        ),
        migrations.AddField(
            model_name='explanation',
            name='partOfSpeech',
            field=models.CharField(blank=True, choices=[('n', 'Noun'), ('pron', 'Pronoun'), ('adj', 'Adjective'), ('v', 'Verb'), ('adv', 'Adverb'), ('prep', 'Preposition'), ('conj', 'Conjunction'), ('art', 'Article'), ('inter', 'Interjection')], max_length=18, null=True),
        ),
        migrations.AddField(
            model_name='word',
            name='grammar',
            field=models.ManyToManyField(blank=True, null=True, related_name='words', to='mayslearning.grammar'),
        ),
        migrations.AlterField(
            model_name='sentence',
            name='sentence',
            field=models.CharField(max_length=512),
        ),
        migrations.AlterField(
            model_name='sentence',
            name='translation',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AddField(
            model_name='word',
            name='notes',
            field=models.ManyToManyField(blank=True, null=True, related_name='words', to='mayslearning.note'),
        ),
    ]
