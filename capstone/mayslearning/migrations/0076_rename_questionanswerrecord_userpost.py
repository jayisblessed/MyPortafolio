# Generated by Django 4.1.7 on 2023-06-11 00:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0075_remove_askquestion_likes_remove_comment_likes'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='QuestionAnswerRecord',
            new_name='UserPost',
        ),
    ]