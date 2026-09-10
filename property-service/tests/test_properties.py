def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"

def test_graphql_endpoint_exists(client):
    response = client.post("/graphql", json={"query": "{ __typename }"})
    assert response.status_code == 200

def test_get_properties(client):
    response = client.post("/graphql", json={
        "query": """
            query {
                properties {
                    id
                    title
                    price
                }
            }
        """
    })
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data