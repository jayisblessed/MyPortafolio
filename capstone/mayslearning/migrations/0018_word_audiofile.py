# Generated by Django 4.1.7 on 2023-05-11 23:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0017_remove_word_sentences_explanation_sentences_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='word',
            name='audioFile',
            field=models.FileField(blank=True, null=True, upload_to='audios/'),
        ),
    ]