# Generated by Django 4.1.7 on 2023-05-20 16:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0045_question_audio_alter_questionanswerrecord_examrecord'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='note',
            field=models.CharField(blank=True, max_length=32, null=True),
        ),
    ]
