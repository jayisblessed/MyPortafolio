# Generated by Django 4.1.7 on 2023-06-11 00:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0076_rename_questionanswerrecord_userpost'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='UserPost',
            new_name='QuestionAnswerRecord',
        ),
    ]