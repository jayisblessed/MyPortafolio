# Generated by Django 4.1.7 on 2023-05-24 14:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0047_imagefile'),
    ]

    operations = [
        migrations.AddField(
            model_name='word',
            name='image',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='words', to='mayslearning.imagefile'),
        ),
    ]
