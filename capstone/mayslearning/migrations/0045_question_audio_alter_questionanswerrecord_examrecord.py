# Generated by Django 4.1.7 on 2023-05-20 14:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0044_alter_examrecord_end_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='audio',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='questions', to='mayslearning.audiofile'),
        ),
        migrations.AlterField(
            model_name='questionanswerrecord',
            name='examRecord',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='question_answer_records', to='mayslearning.examrecord'),
        ),
    ]
