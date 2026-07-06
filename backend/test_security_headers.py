import pytest

from app import create_app

# Regression coverage for #459: API responses were missing
# X-Content-Type-Options and X-Frame-Options (plus Referrer-Policy and
# Permissions-Policy, per the issue's own proposed fix). The issue's
# proposed fix snippet targets FastAPI, but this backend is Flask, so the
# equivalent was added as an @app.after_request hook in app/__init__.py
# alongside the existing CORS header hook.


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


EXPECTED_SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}


@pytest.mark.parametrize("path,method", [("/", "get"), ("/health", "get")])
def test_security_headers_present_on_every_response(client, path, method):
    response = getattr(client, method)(path)

    for header, expected_value in EXPECTED_SECURITY_HEADERS.items():
        assert response.headers.get(header) == expected_value, (
            f"{header} missing or incorrect on {method.upper()} {path}"
        )


def test_security_headers_present_on_error_responses(client):
    # A 404 response should carry the same protections as a success
    # response -- browsers render error pages too.
    response = client.get("/this-route-does-not-exist")

    assert response.status_code == 404
    for header, expected_value in EXPECTED_SECURITY_HEADERS.items():
        assert response.headers.get(header) == expected_value


def test_security_headers_present_on_convertpng_no_file_error(client):
    # Covers a route within a registered blueprint, not just the two
    # inline routes defined directly on the app in create_app().
    response = client.post("/convertPng")

    assert response.status_code in (400, 500)
    for header, expected_value in EXPECTED_SECURITY_HEADERS.items():
        assert response.headers.get(header) == expected_value
