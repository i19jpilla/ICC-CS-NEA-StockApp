"""
Run this once to download React + Babel into frontend/libs/.
Requires internet. After this, the app runs fully offline.

Usage: python setup.py
"""

import urllib.request
import os

LIBS_DIR = os.path.join("frontend", "libs")

LIBS = [
    (
        "react.development.js",
        "https://unpkg.com/react@18/umd/react.development.js",
    ),
    (
        "react-dom.development.js",
        "https://unpkg.com/react-dom@18/umd/react-dom.development.js",
    ),
    (
        "babel.standalone.min.js",
        "https://unpkg.com/@babel/standalone/babel.min.js",
    ),
]


def download():
    os.makedirs(LIBS_DIR, exist_ok=True)

    for filename, url in LIBS:
        dest = os.path.join(LIBS_DIR, filename)
        if os.path.exists(dest):
            print(f"  skip  {filename} (already exists)")
            continue
        print(f"  downloading {filename}...")
        urllib.request.urlretrieve(url, dest)
        print(f"  done  → {dest}")

    print("\nAll libs ready. Run `python main.py` to start the app.")


if __name__ == "__main__":
    download()