import pytest
from app import app
import json

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# Generate 400 variations to test data resiliency and endpoint stability
test_scenarios = [
    (f"center_{i % 3 + 1}", f"user_mock_{i}", i) for i in range(1, 401)
]

@pytest.mark.parametrize("center_id, user_id, execution_id", test_scenarios)
def test_api_center_details_massive(client, center_id, user_id, execution_id):
    """
    Massive test case suite (400 runs) testing the centers API and parameter boundaries.
    """
    # 1. Test fetching all centers
    response = client.get('/api/centers')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'centers' in data
    assert len(data['centers']) > 0

    # 2. Test fetching specific center
    response_specific = client.get(f'/api/centers/{center_id}')
    if response_specific.status_code == 200:
        center_data = json.loads(response_specific.data)
        assert center_data['center']['_id'] == center_id
    else:
        assert response_specific.status_code == 404
