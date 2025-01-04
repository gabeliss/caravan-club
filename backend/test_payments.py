import random
from datetime import timedelta, date

from app.payment_helpers.northernMichigan.traverseCity.tent.payTimberRidgeTent import pay_timberRidgeTent
from app.payment_helpers.northernMichigan.traverseCity.tent.payLeelanauPinesTent import pay_leelanauPinesTent
from app.payment_helpers.northernMichigan.mackinacCity.tent.payIndianRiverTent import pay_indianRiverTent
from app.payment_helpers.northernMichigan.mackinacCity.tent.payTeePeeCampgroundTent import pay_teePeeCampgroundTent
from app.payment_helpers.northernMichigan.picturedRocks.tent.payUncleDuckysTent import pay_uncleDuckysTent
from app.payment_helpers.northernMichigan.picturedRocks.tent.payTouristParkTent import pay_touristParkTent
from app.payment_helpers.northernMichigan.picturedRocks.tent.payFortSuperiorTent import pay_fortSuperiorTent

def random_date_between(start_date, end_date):
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)

def generate_random_payment_info():
    return {
        "first_name": "TestFirstName",
        "last_name": "TestLastName",
        "email": f"test{random.randint(1000, 9999)}@example.com",
        "phone_number": f"{random.randint(1000000000, 9999999999)}",
        "street_address": "123 Test St",
        "city": "TestCity",
        "state": random.choice(["CA", "MI", "IL", "NY", "TX"]),
        "zip_code": f"{random.randint(10000, 99999)}",
        "country": "USA",
        "cardholder_name": "Test Cardholder",
        "card_number": "4242424242424242",  # Test card number
        "card_type": "Visa",
        "expiry_date": "01/30",
        "cvc": "123"
    }

if __name__ == "__main__":
    start_date_range = date(2025, 5, 28)
    end_date_range = date(2025, 8, 28)

    pay_functions = [
        pay_leelanauPinesTent,
        pay_timberRidgeTent,
        pay_indianRiverTent,
        pay_teePeeCampgroundTent,
        pay_uncleDuckysTent,
        pay_touristParkTent,
        pay_fortSuperiorTent
    ]

    failed_tests = []  # To store failed test information

    for pay_function in pay_functions:
        random_start_date = random_date_between(start_date_range, end_date_range)
        random_end_date = random_start_date + timedelta(days=2)
        num_adults = random.randint(1, 3)
        num_kids = random.randint(0, 3)
        payment_info = generate_random_payment_info()

        print(f"Running {pay_function.__name__} with start date: {random_start_date}, end date: {random_end_date}, "
              f"adults: {num_adults}, kids: {num_kids}")

        try:
            response_data = pay_function(random_start_date.strftime("%m/%d/%y"),
                                         random_end_date.strftime("%m/%d/%y"),
                                         num_adults, num_kids, payment_info)

            print(f"Response Data: {response_data} \n")
            assert response_data["payment_successful"] is True, f"Payment failed for {pay_function.__name__}"
        except AssertionError as e:
            print(f"AssertionError: {e}")
            failed_tests.append((pay_function.__name__, str(e)))
        except Exception as e:
            print(f"An error occurred during {pay_function.__name__}: {e}")
            failed_tests.append((pay_function.__name__, str(e)))

    print("\nTest Summary:")
    if not failed_tests:
        print("All tests passed successfully!")
    else:
        print("The following tests failed:")
        for func_name, error in failed_tests:
            print(f"{func_name}: {error}")
    
    print("Done testing payments")