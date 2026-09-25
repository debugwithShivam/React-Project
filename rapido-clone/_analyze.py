import re

with open(r'D:\code\project\rapido-clone\backend\src\services\auth.service.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all throw new Error messages
msgs = re.findall(r"throw new Error\(['\"]([^'\"]+)['\"]", content)
print("=== Error messages in auth.service.js ===")
for m in sorted(set(msgs)):
    print(repr(m))

print()

# Check how mockPool is exported - the issue is how mock.module exports work
# The service imports pool from database.js
# mock.module replaces the module, but the mock functions need to be accessible
# Look at how getConnection is called in the service
idx = content.find('getConnection')
print("getConnection usage:", repr(content[idx-30:idx+80]))
