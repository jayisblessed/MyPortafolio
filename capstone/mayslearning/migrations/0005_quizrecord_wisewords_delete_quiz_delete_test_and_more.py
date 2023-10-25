# Generated by Django 4.1.7 on 2023-04-22 22:44

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0004_question_delete_culturalknowledge_delete_flashcard_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuizRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('correctOrNot', models.BooleanField(null=True)),
                ('userAnswer', models.CharField(max_length=500)),
            ],
        ),
        migrations.CreateModel(
            name='WiseWords',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.CharField(max_length=512)),
                ('author', models.CharField(blank=True, max_length=128, null=True)),
                ('timestamp', models.DateTimeField(null=True)),
            ],
        ),
        migrations.DeleteModel(
            name='Quiz',
        ),
        migrations.DeleteModel(
            name='Test',
        ),
        migrations.RenameField(
            model_name='question',
            old_name='modified_time',
            new_name='timestamp',
        ),
        migrations.AlterField(
            model_name='grammar',
            name='explanation',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='grammar',
            name='topic',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='sentence',
            name='translation',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name='studyrecords',
            name='theLevel',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
        migrations.AlterField(
            model_name='text',
            name='additionalContent',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='text',
            name='title',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='renewal_date',
            field=models.DateTimeField(null=True),
        ),
        migrations.AlterField(
            model_name='word',
            name='explanation',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AlterField(
            model_name='word',
            name='explanationTranslation',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
        migrations.AlterField(
            model_name='word',
            name='sentences',
            field=models.ManyToManyField(null=True, to='mayslearning.sentence'),
        ),
        migrations.AlterField(
            model_name='word',
            name='theIPA',
            field=models.CharField(blank=True, max_length=16, null=True),
        ),
        migrations.AlterField(
            model_name='word',
            name='wordClass',
            field=models.CharField(blank=True, max_length=32, null=True),
        ),
        migrations.AddField(
            model_name='quizrecord',
            name='question',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mayslearning.question'),
        ),
        migrations.AddField(
            model_name='quizrecord',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
