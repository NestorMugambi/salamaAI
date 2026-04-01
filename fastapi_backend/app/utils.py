from fastapi.routing import APIRoute
from datetime import date


def simple_generate_unique_route_id(route: APIRoute):
    return f"{route.tags[0]}-{route.name}"


def calculate_age(date_of_birth: date) -> int:
    today = date.today()
    return (
        today.year
        - date_of_birth.year
        - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    )
