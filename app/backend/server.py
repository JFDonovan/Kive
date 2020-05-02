#import sumTwoNumbers
import os

from flask import Flask, request, jsonify

from ingest import ingest, update, delete
from dir_manage import create_workspace, delete_workspace, import_folder
from search import search_from_strs

app = Flask(__name__)

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

@app.route('/shutdown/', methods=['GET'])
def shutdown():
    shutdown_server()
    return 'Shutting down server..'


@app.route('/test/<name>', methods=['GET'])
def test(name):
    response = "success"
    try:
        os.mkdir("G:/Users/jfdon/PycharmProjects/Kive latest/app/workspace_repo/" + name + "/")
        os.mkdir("G:/Users/jfdon/PycharmProjects/Kive latest/app/workspace_repo/" + name + "/index_dir/")
    except:
        response = "workspace already exists"

    return {'data': response}


@app.route('/create-workspace/<name>', methods=['GET'])
def create_workspace_ep(name):
    response = None
    try:
        response = create_workspace(name=name)
    except:
        response = "CREATE WORKSPACE FAILED"
    return jsonify(response)


@app.route('/delete-workspace/<guid>', methods=['GET'])
def delete_workspace_ep(guid):
    response = None
    try:
        response = delete_workspace(guid=guid)
    except:
        response = "DELETE WORKSPACE FAILED"
    return jsonify(response)



# Runs main (should stay at bottom)
if __name__ == '__main__':
    app.run()
