from django.db import migrations, models


def backfill_match_fields(apps, schema_editor):
    UserJobMatch = apps.get_model('jobs', 'UserJobMatch')

    matches = UserJobMatch.objects.select_related('job').filter(
        models.Q(title__isnull=True)
        | models.Q(company__isnull=True)
        | models.Q(location__isnull=True)
        | models.Q(link__isnull=True)
    )

    for match in matches:
        match.title = match.title or match.job.title
        match.company = match.company or match.job.company
        match.location = match.location or match.job.location
        match.link = match.link or match.job.url
        match.save(update_fields=['title', 'company', 'location', 'link'])


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0005_alter_userjobmatch_company_alter_userjobmatch_title'),
    ]

    operations = [
        migrations.RunPython(backfill_match_fields, migrations.RunPython.noop),
        migrations.AlterUniqueTogether(
            name='userjobmatch',
            unique_together={('user', 'job')},
        ),
        migrations.AlterField(
            model_name='userjobmatch',
            name='company',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='userjobmatch',
            name='link',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='userjobmatch',
            name='location',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='userjobmatch',
            name='title',
            field=models.CharField(max_length=500),
        ),
    ]
