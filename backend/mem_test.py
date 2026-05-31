import requests
import psutil
import time
import os
import sys

IMAGE_PATH = r"C:\Users\hp\OneDrive\Pictures\Saved Pictures\my caricature_files\49dd2a14-017c-42cb-ae07-5fb0ae845304.png"
OUT_CSV = r"E:\Projects\pdfToPngV1\backend\mem_test.csv"
N = 30

# find a python process that is not this process (heuristic for server)
me = os.getpid()
server_proc = None
for p in psutil.process_iter(['pid','name','cmdline']):
    try:
        if p.info['pid'] == me:
            continue
        name = (p.info.get('name') or '').lower()
        cmd = ' '.join(p.info.get('cmdline') or [])
        if 'python' in name:
            # heuristics: prefer processes that reference main.py or app
            if 'main.py' in cmd or 'flask' in cmd or 'app' in cmd:
                server_proc = p
                break
            if server_proc is None:
                server_proc = p
    except Exception:
        continue

if not server_proc:
    print('Could not find server python process to monitor.', file=sys.stderr)
    sys.exit(1)

with open(OUT_CSV, 'w') as f:
    f.write('iter,timestamp,ws\n')

for i in range(1, N+1):
    t = time.time()
    try:
        with open(IMAGE_PATH, 'rb') as fd:
            r = requests.post('http://localhost:5000/removeBg', files={'image': fd})
        status = r.status_code
    except Exception as e:
        status = 0
    try:
        ws = server_proc.memory_info().rss
    except Exception:
        ws = -1
    with open(OUT_CSV, 'a') as f:
        f.write(f"{i},{t},{ws},{status}\n")
    time.sleep(0.2)

print('DONE')
