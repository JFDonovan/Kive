from urllib import request

import sys


'''
This "script" shuts down the Flask server whenever the user quits.
Intended to be a quick workaround for the server not completely
shutting down when closing the packaged application on Windows.
'''


if __name__ == '__main__':
    req = request.Request('http://localhost:5000/shutdown')
    request.urlopen(req)