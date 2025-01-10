from scrapers.scrape_teePeeCampgroundTent import baseline_scraper

def lambda_handler(event, context):
    print("Lambda handler started")
    try:
        success = baseline_scraper()
        print(f"Baseline scraper result: {success}")
        return {
            'statusCode': 200,
            'body': '{"success": true}' if success else '{"success": false}'
        }
    except Exception as e:
        print(f"Error occurred: {e}")
        return {
            'statusCode': 500,
            'body': f'{{"error": "{str(e)}"}}'
        }
    # No sys.exit(0) — let AWS Lambda handle termination
