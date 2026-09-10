from celery import shared_task
from .scraper import scrape_linkedin_jobs, save_jobs, match_jobs_to_user

@shared_task
def scrape_jobs_task(keyword, location, user_id):
    jobs = scrape_linkedin_jobs(keyword, location)
    result = save_jobs(jobs)
    match_job = match_jobs_to_user(user_id, keyword, result['new_job_ids'])
    return (
        f"Scraped {len(jobs)} jobs, "
        f"saved {result['saved']}, "
        f"updated {result['updated']}, "
        f"skipped {result['skipped']}"
    )
