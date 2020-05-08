import uuid
import os
import json
import shutil
from whoosh.index import create_in
from whoosh.fields import *

import config

'''
Functionality to allow users to create and delete workspaces.
'''

# For creating new workspace
def create_workspace(name):
    # global tempStr
    workspace_guid = str(uuid.uuid4())

    try:
        # Make workspace directory and empty index folder
        os.mkdir(config.app_data_path + "/workspace_repo/"+workspace_guid+"/")
        os.mkdir(config.app_data_path + "/workspace_repo/"+workspace_guid+"/index_dir/")

        tree_file = open(config.app_data_path + "/workspace_repo/"+workspace_guid+"/tree.json", "w")
        #tree_file.write("[]")
        tree_file.close()

        workspaces_r = open(config.app_data_path + "/workspace_repo/workspaces.json", "r")
        ws_obj = json.loads(workspaces_r.read())
        workspaces_r.close()

        ws_obj[workspace_guid] = {
            "name": name,
            "path": workspace_guid+"/"
        }

        with open(config.app_data_path + '/workspace_repo/workspaces.json', 'w') as f:
            json.dump(ws_obj, f)

        return {
                'message': 'create-workspace-success',
                'name': name,
                'workspace_guid': workspace_guid
                }
    except OSError as e:
        return {
                'message': 'create-workspace-failure',
                'workspace_guid': workspace_guid,
                'error': str(e)
                }


# For deleting workspace
def delete_workspace(guid):
    global tempStr
    workspace_guid = guid

    try:
        shutil.rmtree(config.app_data_path + "/workspace_repo/"+workspace_guid+"/")
        workspaces_r = open(config.app_data_path + "/workspace_repo/workspaces.json", "r")
        ws_obj = json.loads(workspaces_r.read())
        workspaces_r.close()

        del ws_obj[workspace_guid]

        with open(config.app_data_path + '/workspace_repo/workspaces.json', 'w') as f:
            json.dump(ws_obj, f)

        return {
                'message': 'delete-workspace-success',
                'workspace_guid': workspace_guid
                }
    except Exception as e:
        return {
                'message': 'delete-workspace-failure',
                'workspace_guid': workspace_guid,
                'error': str(e)
                }

