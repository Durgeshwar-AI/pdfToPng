
def test_home_returns_200(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.is_json
    assert response.get_json() == {
        "message": "Server running"
    }

def test_home(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.get_json()["message"] == "Server running"

