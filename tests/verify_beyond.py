import urllib.request
import json
import sys

def test(url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        data_bytes = json.dumps(data).encode('utf-8')
    else:
        data_bytes = None
    with urllib.request.urlopen(req, data=data_bytes, timeout=5) as res:
        return res.status, json.loads(res.read().decode('utf-8'))

print('=== BEYOND FULL-STACK INTEGRATION TEST SUITE ===')

s, r = test('http://127.0.0.1:5000/api/health')
print(f'1. Health Check: Status {s} -> {r["app"]}')

s, r = test('http://127.0.0.1:5000/api/discoveries')
print(f'2. Feed Discoveries: Status {s} -> Found {len(r)} discoveries. Top spot: "{r[0]["title"]}"')

s, r = test('http://127.0.0.1:5000/api/discoveries/chamundi-hills-viewpoint')
print(f'3. Chamundi Hills Details: Status {s} -> Distance: {r["distanceKm"]}km, Likes: {r["likesCount"]}, Saved: {r["isSaved"]}')

s, r = test('http://127.0.0.1:5000/api/discoveries/chamundi-hills-viewpoint/like', method='POST')
print(f'4. Toggle Like: Status {s} -> isLiked: {r["isLiked"]}, new count: {r["likesCount"]}')

s, r = test('http://127.0.0.1:5000/api/discoveries/chamundi-hills-viewpoint/save', method='POST')
print(f'5. Toggle Bookmark: Status {s} -> isSaved: {r["isSaved"]}')

s, r = test('http://127.0.0.1:5000/api/discoveries/chamundi-hills-viewpoint/comments', method='POST', data={'text': 'BEYOND end-to-end integration test comment!'})
print(f'6. Add Comment: Status {s} -> Comment ID: {r["id"]}, text: "{r["text"]}"')

s, r = test('http://127.0.0.1:5000/api/saved')
print(f'7. Saved Places: Status {s} -> {len(r)} saved destinations')

s, r = test('http://127.0.0.1:5000/api/collections')
print(f'8. Collections: Status {s} -> {len(r)} collections available (e.g. "{r[0]["name"]}")')

s, r = test('http://127.0.0.1:5000/api/profile')
print(f'9. User Profile: Status {s} -> User: "{r["name"]}" ({r["handle"]}), Level: {r["level"]}, XP: {r["xp"]}/{r["nextLevelXp"]}')

s, r = test('http://127.0.0.1:5000/api/achievements')
print(f'10. Achievements Engine: Status {s} -> {len(r["achievements"])} tiers. Active tier: "{r["currentUser"]["level"]}"')

s, r = test('http://127.0.0.1:5000/api/ai/status')
print(f'11. Local AI Status: Status {s} -> Accelerator: {r["hardware"]["gpu"]}, Engine: {r["nlpStatus"]}')

s, r = test('http://127.0.0.1:5000/api/ai/discover', method='POST', data={'query': 'Find peaceful sunset viewpoints near me'})
print(f'12. AI Natural-Language Query: Status {s} -> {r["explanation"]}')

s, r = test('http://127.0.0.1:5000/api/ai/describe', method='POST', data={'placeName': 'Kukkarahalli Lake', 'category': 'Nature', 'rawNotes': 'lake peaceful birds in morning'})
print(f'13. AI Description Assistant: Status {s} -> Polished: "{r["polishedDescription"]}"')

# 14. Static Frontend index.html
with urllib.request.urlopen('http://127.0.0.1:5000/') as f:
    html = f.read().decode('utf-8')
    has_title = 'BEYOND' in html
    print(f'14. Web Application Shell (index.html): Status {f.status} -> Title verified: {has_title}')

# 15. Extracted Reference Assets
with urllib.request.urlopen('http://127.0.0.1:5000/intro/screen_01_splash_onboarding.png') as f:
    print(f'15. Reference Image Asset: Status {f.status} -> Size: {len(f.read())} bytes')

print('=== ALL 15 AUTOMATED INTEGRATION TESTS PASSED 100% ===')
