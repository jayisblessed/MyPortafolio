# Generated by Django 4.1.7 on 2023-06-01 22:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mayslearning', '0063_focalitems'),
    ]

    operations = [
        migrations.AlterField(
            model_name='focalitems',
            name='level',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
    ]
