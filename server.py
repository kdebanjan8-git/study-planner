#!/usr/bin/env python3
"""
Smart Study Planner - Local Web Server
Runs a local HTTP server and automatically opens the application in your browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Always route root path to the Login & Sign In portal
        if self.path == '/' or self.path == '':
            self.send_response(302)
            self.send_header('Location', '/login.html')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self):
        # Prevent any stale caching of HTML, CSS, or JS in student browsers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Keep console output clean
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

def main():
    os.chdir(DIRECTORY)
    # Allow socket address reuse so restarting works without port conflicts
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/login.html"
        print("=" * 60)
        print("🎓 SMART STUDY PLANNER IS RUNNING!")
        print(f"📡 Login Page URL: {url}")
        print(f"📡 Dashboard URL:  http://localhost:{PORT}/index.html")
        print("💡 Press Ctrl+C anytime to stop the server.")
        print("=" * 60)
        try:
            webbrowser.open(url)
        except Exception:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server. Good luck with your studies! 🚀")

if __name__ == "__main__":
    main()
