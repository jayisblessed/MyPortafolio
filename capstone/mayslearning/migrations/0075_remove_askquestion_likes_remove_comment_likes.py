# Generated by Django 4.1.7 on 2023-06-07 16:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0074_comment_question_alter_askquestion_comments'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='askquestion',
            name='likes',
        ),
        migrations.RemoveField(
            model_name='comment',
            name='likes',
        ),
    ]
