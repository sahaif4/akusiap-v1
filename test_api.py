import requests
import json

try:
    response = requests.get('http://127.0.0.1:8000/api/upm/members/')
    if response.status_code == 200:
        data = response.json()
        print(f'Total members returned: {len(data)}')
        for member in data[:5]:  # Show first 5
            children_count = len(member.get('children', []))
            print(f'ID {member["id"]}: {member["name"]} ({member["role"]}) - Children: {children_count}')
            if children_count > 0:
                for child in member['children'][:2]:  # Show first 2 children
                    grandchild_count = len(child.get('children', []))
                    print(f'  └─ {child["name"]} ({child["role"]}) - Children: {grandchild_count}')
    else:
        print(f'API Error: {response.status_code} - {response.text}')
except Exception as e:
    print(f'Error: {e}')
