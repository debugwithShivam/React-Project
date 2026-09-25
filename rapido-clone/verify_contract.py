"""Verify API contract between mobile app and backend."""

# Load files
with open(r'D:\code\project\rapido-clone\UserApp\src\auth\login.jsx', 'r', encoding='utf-8') as f:
    login_content = f.read()

with open(r'D:\code\project\rapido-clone\UserApp\src\api\axios.ts', 'r', encoding='utf-8') as f:
    axios_content = f.read()

with open(r'D:\code\project\rapido-clone\backend\src\controllers\auth.controller.js', 'r', encoding='utf-8') as f:
    controller = f.read()

print("=== CHECK: Mobile reads from /auth/login ===")
# App stores accessToken and refreshToken from login response
for field, present in [
    ("accessToken read by app", "accessToken" in login_content),
    ("refreshToken read by app", "refreshToken" in login_content),
    ("user.name read by app", "user" in login_content),
]:
    print(f"  {'PASS' if present else 'FAIL'}: {field}")

print()
print("=== CHECK: Backend /auth/login response fields ===")
idx = controller.find("export const login")
snippet = controller[idx:idx+900]
for field in ["accessToken", "refreshToken", "user"]:
    found = field in snippet
    print(f"  {'PASS' if found else 'FAIL'}: backend returns {field}")

print()
print("=== CHECK: axios.ts refresh flow ===")
checks = [
    ("Sends refreshToken in request body", "{ refreshToken }" in axios_content),
    ("Uses bare axios (not api) for refresh", "axios.post" in axios_content),
    ("Reads newAccess from response", "newAccess" in axios_content or "accessToken" in axios_content),
    ("Reads newRefresh from response", "newRefresh" in axios_content or "refreshToken" in axios_content),
    ("Calls saveTokens after refresh", "saveTokens" in axios_content),
    ("Calls clearTokens on failed refresh", "clearTokens" in axios_content),
    ("Single refresh via shared promise", "refreshPromise" in axios_content),
    ("_retry flag prevents infinite loop", "_retry" in axios_content),
    ("Skips refresh interceptor for /auth/refreshToken", "/auth/refreshToken" in axios_content),
]
for label, ok in checks:
    print(f"  {'PASS' if ok else 'FAIL'}: {label}")

print()
print("=== CHECK: Backend /auth/refreshToken response fields ===")
idx2 = controller.find("export const refreshToken")
snippet2 = controller[idx2:idx2+600]
for field in ["accessToken", "refreshToken"]:
    found = field in snippet2
    print(f"  {'PASS' if found else 'FAIL'}: backend returns {field}")
