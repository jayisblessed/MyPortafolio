# Generated by Django 4.1.7 on 2023-05-28 19:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0053_sentence_notes'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sentence',
            name='notes',
        ),
        migrations.AddField(
            model_name='sentence',
            name='notes',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
    ]
