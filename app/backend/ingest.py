from index import index_docs
from get_json import get_json_lst
from backup import backup, restore_from_backup

import json
import shutil
import sys
import time

def ingest(path, import_type, workspace_guid):
    '''
    Called whenever a user imports webpages.
    '''
    try:
        # Get JSON objects for a web page or all of the web pages in a directory
        json_tree, json_lst = get_json_lst(path, import_type)
        
        # Write json to file
        with open('app/workspace_repo/{}/temp.json'.format(workspace_guid), 'w') as json_file:
            json.dump(json_tree, json_file)
        print('import-success'+':*:'+workspace_guid)

        # Index documents
        index_docs(json_lst, 'add', workspace_guid)
        
        backup(workspace_guid)
        print('index-success' + ':*:' + workspace_guid)
    except Exception as e:
        restore_from_backup(workspace_guid)

def update(json_lst, workspace_guid):
    '''
    Called whenever a user modifies a web page
    e.g. renaming, accessing, etc.
    '''
    try:
        index_docs(json.loads(json_lst), 'update', workspace_guid)

        backup(workspace_guid)
        print('update-success' + ':*:' + workspace_guid)
    except Exception as e:
        restore_from_backup(workspace_guid)

def delete(json_lst, workspace_guid):
    '''
    Called whenever a user modifies a web page
    e.g. renaming, accessing, etc.
    '''
    try:
        index_docs(json.loads(json_lst), 'delete', workspace_guid)

        backup(workspace_guid)
        print('delete-success:*:' + workspace_guid)
    except Exception as e:
        restore_from_backup(workspace_guid)