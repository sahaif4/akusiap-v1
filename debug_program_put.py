import requests
import json

try:
    # 1. Login
    login_resp = requests.post('http://localhost:8000/api/login/', json={'username': 'wisnu', 'password': 'pepi123'})
    login_data = login_resp.json()
    token = login_data.get('access')
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Get Profile
    profile_resp = requests.get('http://localhost:8000/api/upm-profiles/', headers=headers)
    profiles = profile_resp.json()
    profile_id = profiles[0]['id']

    # 3. Get Existing Program (ID 1)
    # Assuming ID 1 exists from previous run
    program_id = 1 
    
    long_text = """Menyelenggarakan workshop mutu (SPMI, AMI, instrumen, PPEPP)
Menyusun panduan praktis implementasi standar
Mendampingi unit memahami dokumen mutu
Menumbuhkan budaya refleksi dan perbaikan"""
    
    payload = {
        'id': program_id,
        'name': long_text,
        'description': '',
        'is_active': True,
        'profile': profile_id
    }
    
    print(f"Updating Program ID {program_id}...")
    resp = requests.put(f'http://localhost:8000/api/upm-programs/{program_id}/', json=payload, headers=headers)
    
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")

except Exception as e:
    print(f"Error: {e}")
