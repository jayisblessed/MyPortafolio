# Generated by Django 4.1.7 on 2023-05-13 15:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0031_questionanswerrecord_examrecord_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='feedback',
            old_name='theFeedback',
            new_name='feedback',
        ),
        migrations.RenameField(
            model_name='feedback',
            old_name='theResponse',
            new_name='response',
        ),
    ]