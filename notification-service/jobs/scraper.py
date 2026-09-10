from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from urllib.parse import quote_plus
import time
from .models import JobListing, UserJobMatch


def clean_text(value, default='N/A'):
    value = (value or '').strip()
    return value or default


def element_text(element, default='N/A'):
    for attr in ('text', 'textContent', 'innerText', 'aria-label', 'title'):
        if attr == 'text':
            value = element.text
        else:
            value = element.get_attribute(attr)

        value = clean_text(value, default='')
        if value:
            return value
    return default


def card_text(card, selectors, default='N/A'):
    for selector in selectors:
        try:
            value = element_text(card.find_element(By.CSS_SELECTOR, selector), default='')
            if value:
                return value
        except:
            pass

    return default


def get_driver():

    options = Options()

    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_argument('--window-size=1920,1080')

    options.add_argument(
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    )
    options.binary_location = '/usr/bin/google-chrome'


    driver = webdriver.Chrome(
        options=options
    )

    return driver

def scrape_linkedin_jobs(keyword, location):
    driver = get_driver()
    try:
        ecoded_keyword = quote_plus(keyword)
        ecoded_location = quote_plus(location)
        url = f"https://www.linkedin.com/jobs/search/?keywords={ecoded_keyword}&location={ecoded_location}"
        driver.get(url)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, '.job-search-card, .jobs-search__results-list li'))
        )
        try:
            close_btn = driver.find_element(By.CSS_SELECTOR, 'button[data-tracking-control-name="public_jobs_contextual-sign-in-modal_modal_dismiss"]')
            close_btn.click()
            time.sleep(1)
        except:
            pass
        for i in range(3):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
        job_cards = driver.find_elements(By.CSS_SELECTOR, '.job-search-card')
        if not job_cards:
            job_cards = driver.find_elements(By.CSS_SELECTOR, '.jobs-search__results-list li')
        print(f"Found {len(job_cards)} jobs")
        jobs = []
        for card in job_cards:
            Title = card_text(card, [
                '.base-search-card__title',
                'h3',
                'a[data-tracking-control-name="public_jobs_jserp-result_search-card"]',
            ])
            Company = card_text(card, [
                '.base-search-card__subtitle',
                '.hidden-nested-link',
                'h4',
            ])
            Location = card_text(card, [
                '.job-search-card__location',
                '.base-search-card__metadata',
                '.job-search-card__metadata',
            ])
            try:
                Link = clean_text(card.find_element(By.TAG_NAME, 'a').get_attribute('href'))
            except:
                Link ='N/A'

            jobs.append({'title' : Title, 
                        'company':Company, 
                        'location':Location,
                         'link': Link})
        return jobs
    
    finally:
        driver.quit()

def save_jobs(jobs):
    saved = 0
    updated = 0
    skipped = 0
    new_job_ids = []

    for job in jobs:
        title = clean_text(job.get('title'))
        company = clean_text(job.get('company'))
        location = clean_text(job.get('location'))
        link = clean_text(job.get('link'))

        if title == 'N/A' or link == 'N/A':
            print(f"Skipped incomplete job: {job}")
            skipped += 1
            continue

        link_id = link.split('/view/')[-1].split('?')[0]
        if not link_id or link_id == link:
            print(f"Skipped job with invalid LinkedIn URL: {job}")
            skipped += 1
            continue

        job_obj, created = JobListing.objects.update_or_create(linkedin_job_id=link_id, defaults={
            'title': title,
            'company': company,
            'location': location,
            'url': link,
            'source': 'linkedin'
        })
        new_job_ids.append(job_obj.id)  
        if created:
            print(f"New job saved: {job_obj.title}")
            saved += 1
        else:
            print(f"Existing job updated: {job_obj.title}")
            updated += 1

    return {
        'saved': saved,
        'updated': updated,
        'skipped': skipped,
        'new_job_ids' : new_job_ids,
    }


def match_jobs_to_user(user_id, keyword, new_job_ids):
    UserJobMatch.objects.filter(
        user_id=user_id,
        searched_keyword=keyword
    ).delete()

    jobs = JobListing.objects.filter(id__in=new_job_ids)
    matched = 0
    for job in jobs:
        _, created = UserJobMatch.objects.update_or_create(
            user_id=user_id,
            job=job,
            defaults={
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'link': job.url,
                'searched_keyword': keyword,
            },
        )
        matched += int(created)

    print(f"matched {jobs.count()} jobs, created {matched} new matches")
