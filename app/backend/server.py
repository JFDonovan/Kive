#import sumTwoNumbers
import os
import sys

from flask import Flask, request, jsonify

from ingest import get_files, send_to_indexer, update, delete
from dir_manage import create_workspace, delete_workspace
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

## May need to decode paths here.
@app.route('/import/<path>/<type>/<guid>', methods=['GET'])
def import_ep(path, type, guid):
    response = None
    try:
        response = get_files(path=path, import_type=type, workspace_guid=guid)
    except:
        response = "IMPORT FAILED"
    return jsonify(response)

## Subsequent call after import
## Should receive JSON as a POST request argument
@app.route('/index/<operation>/<guid>', methods=['GET', 'POST'])
def index_ep(operation, guid):
    response = None
    try:
        json_lst = request.get_json()
        if operation == 'add':
            response = send_to_indexer(json_lst=json_lst, workspace_guid=guid)
        elif operation == 'update':
            response = update(json_lst=json_lst, workspace_guid=guid)
        elif operation =='delete':
            response = delete(json_lst=json_lst, workspace_guid=guid)
        else:
            response = "INVALID INDEX OPERATION"
    except:
        response = "IMPORT FAILED"
    return jsonify(response)

## Search request
## Should receive JSON as a POST request argument
## Schema: 
# {
#     searchQuery: string
#     dil: [startDil, endDil]
#     dik: [startDik, endDik]
#     dla: [startDla, endDla]
#     mediaQuery: string
#     options: [array of selected options]
# }
@app.route('/search/<guid>', methods=['GET', 'POST'])
def search_ep(guid):
    response = None
    try:
        json = request.get_json()
        response = search_from_strs(
            search_text=json['searchQuery'],
            leg_datetime_range=json['dil'],
            kive_datetime_range=json['dik'],
            la_datetime_range=json['dla'], 
            media_text_lst=json['mediaQuery'], 
            fields_lst=json['options'], 
            workspace_guid=guid)
    except:
        response = "IMPORT FAILED"
    return jsonify(response)

def start_server():
    # Set path to AppData/Local Resources/etc. folder
    app_data_path = sys.argv[1]
    # TODO: Set config class's app data path to above variable
    app.run()

# Runs main (should stay at bottom)
if __name__ == '__main__':
    start_server()
