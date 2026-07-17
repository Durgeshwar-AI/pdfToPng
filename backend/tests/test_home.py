def test_home(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.get_json()["message"] == "Server running"