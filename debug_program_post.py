import requests
import json

try:
    # 1. Login
    login_resp = requests.post('http://localhost:8000/api/login/', json={'username': 'wisnu', 'password': 'pepi123'})
    login_data = login_resp.json()
    token = login_data.get('access')
    
    if not token:
        print("Login failed:", login_data)
        exit(1)
        
    print(f"Token acquired.")
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Get Profile
    profile_resp = requests.get('http://localhost:8000/api/upm-profiles/', headers=headers)
    profiles = profile_resp.json()
    
    if not profiles:
        print("No profiles found.")
        exit(1)
        
    profile_id = profiles[0]['id']
    print(f"Profile ID: {profile_id}")

    # 3. Post Program with long name
    long_text = """Menyelenggarakan workshop mutu (SPMI, AMI, instrumen, PPEPP)
Menyusun panduan praktis implementasi standar
Mendampingi unit memahami dokumen mutu
Menumbuhkan budaya refleksi dan perbaikan"""
    
    payload = {
        'name': long_text,
        'is_active': True,
        'profile': profile_id
    }
    
    print(f"Posting payload with name length: {len(long_text)}")
    resp = requests.post('http://localhost:8000/api/upm-programs/', json=payload, headers=headers)
    
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")

except Exception as e:
    print(f"Error: {e}")
