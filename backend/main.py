from app import create_app

import os

app = create_app()

 # ← moved AFTER app is created

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    # threaded=True so a slow conversion request doesn't block other
    # concurrent requests when running the dev server directly (matches
    # the gthread worker used in the production gunicorn command).
    app.run(host="0.0.0.0", port=port, threaded=True)