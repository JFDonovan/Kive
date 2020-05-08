#import sumTwoNumbers
import os
import sys
import config
import traceback

from flask import Flask, request, jsonify
from urllib import parse
from ingesta import get_files, add, update, delete
from dir_manage import create_workspace, delete_workspace
from search import get_search_results

import traceback

from multiprocessing import Process, freeze_support

'''
This file defines the endpoints of and runs the API.
'''

app = Flask(__name__)

app_data_path = "none"
platform = "none"
#config.app_data_path = '/Users/josh/Library/Application Support/kive_data'

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()


@app.route('/shutdown', methods=['GET'])
def shutdown():
    shutdown_server()
    return 'Shutting down server..'


@app.route('/check', methods=['GET'])
def check():
    return 'Server is running...'


@app.route('/get_platform', methods=['GET'])
def get_platform():
    return platform


@app.route('/create-workspace/<name>', methods=['GET'])
def create_workspace_ep(name):
    '''
    Creates a new workspace.
    '''

    name = parse.unquote(name)
    response = None
    try:
        response = create_workspace(name=name)
    except Exception as e:
        response = {'message': "create-workspace-failure", 'error': str(traceback.format_exc())}#str(e)}
    return jsonify(response)


@app.route('/delete-workspace/<guid>', methods=['GET'])
def delete_workspace_ep(guid):
    '''
    Deletes a workspace.
    '''

    response = None
    try:
        response = delete_workspace(guid=guid)
    except Exception as e:
        response = {'message': "delete-workspace-failure", 'workspace_guid': guid, 'error': str(traceback.format_exc())}#str(e)}
    return jsonify(response)

# May need to decode paths here.
@app.route('/import/<path:path>/<type>/<guid>', methods=['GET'])
def import_ep(path, type, guid):
    '''
    Sends given path and type to the import workflow.
    '''
    
    path = parse.unquote(path)
    if platform != 'win32':
        path = '/' + path
    response = None
    try:
        response = get_files(path=path, import_type=type, workspace_guid=guid)
    except Exception as e:
        response = {'message': "import-failure", 'error': str(e)}
    return jsonify(response)

# Subsequent call after import
# Should receive JSON as a POST request argument
@app.route('/index/<operation>/<guid>', methods=['GET', 'POST'])
def index_ep(operation, guid):
    '''
    Recieves the JSON list of file metadata retrieved by import_ep() and 
    sends the list to the indexer to perform the specified operation.
    '''

    response = None
    try:
        json_lst = request.get_json()['json_lst']
        if operation == 'add':
            response = add(json_lst=json_lst, workspace_guid=guid)
        elif operation == 'update':
            response = update(json_lst=json_lst, workspace_guid=guid)
        elif operation == 'delete':
            response = delete(json_lst=json_lst, workspace_guid=guid)
        else:
            response = "INVALID INDEX OPERATION"
    except Exception as e:
        response = {'message': "index-failure", 'workspace_guid': guid, "error": str(traceback.format_exc())}#str(e)}
    return jsonify(response)


@app.route('/search/<guid>', methods=['GET', 'POST'])
def search_ep(guid):
    '''
    Schema:
    {
        'search_query': text (str),
        'leg_datetime_range': [from_date (str), to_date (str)],
        'kive_datetime_range': [from_date (str), to_date (str)],
        'la_datetime_range': [from_date (str), to_date (str)],
        'media_query': [list of media filenames/extensions (str), ...],
        'options': [selected options]
    }
    '''

    response = None
    try:
        json = request.get_json()
        response = get_search_results(
            search_text=json['search_query'],
            leg_datetime_range=json['date_ingested_legacy'],
            kive_datetime_range=json['date_ingested_kive'],
            la_datetime_range=json['date_last_accessed'],
            media_text_lst=json['media_query'],
            fields_lst=json['options'],
            workspace_guid=guid)
            
    except Exception as e:
        response = {'message': "search-failure", 'error': str(traceback.format_exc())}#str(e)}
    return jsonify(response)


@app.route('/app_data_path')
def get_app_data_path():
    return app_data_path


def start_server():
    '''
    Returns the data to a user's appdata directory 
    (e.g. /users/user1234/Library/Application Support/kive_data)
    '''
    # Set path to AppData/Local Resources/etc. folder
    global app_data_path    
    app_data_path = sys.argv[2]
    config.app_data_path = app_data_path
    # Set platform
    global platform
    platform = sys.argv[3]
    config.platform = platform
    # Run app
    app.run(host='localhost', port=sys.argv[1])


# Runs main (should stay at bottom)
if __name__ == '__main__':
    freeze_support()
    start_server()

