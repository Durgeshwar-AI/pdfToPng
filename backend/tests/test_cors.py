def test_cors_headers(client):
    response = client.get("/health")

    assert response.status_code == 200

    assert "Access-Control-Allow-Origin" in response.headers
    assert "Access-Control-Allow-Methods" in response.headers
    assert "Access-Control-Allow-Headers" in response.headers

def test_allowed_http_methods(client):
    response = client.open("/health", method="OPTIONS")

    assert response.status_code == 200

    methods = response.headers.get("Access-Control-Allow-Methods")

    assert "GET" in methods
    assert "POST" in methods
    assert "OPTIONS" in methods

def test_access_control_allow_origin(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.headers["Access-Control-Allow-Origin"] == "*"


def test_disallowed_origin_headers(monkeypatch):
    from app import create_app
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://mysite.com,https://www.mysite.com")
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as c:
        response = c.get("/health", headers={"Origin": "https://evil.com"})
        assert response.status_code == 200
        assert response.headers.get("Access-Control-Allow-Origin") != "https://mysite.com,https://www.mysite.com"
        assert response.headers.get("Access-Control-Allow-Origin") is None

        response_allowed = c.get("/health", headers={"Origin": "https://mysite.com"})
        assert response_allowed.status_code == 200
        assert response_allowed.headers.get("Access-Control-Allow-Origin") == "https://mysite.com"