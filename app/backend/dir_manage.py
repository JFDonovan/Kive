import uuid
import os
import json
import shutil
from whoosh.index import create_in
from whoosh.fields import *

# For creating new workspace
def create_workspace(name):
    # global tempStr
    workspace_guid = str(uuid.uuid4())

    try:
        # Make workspace directory and empty index folder
        os.mkdir("/Users/chrisyue/workspace_repo/"+workspace_guid+"/")
        os.mkdir("/Users/chrisyue/workspace_repo/"+workspace_guid+"/index_dir/")

        tree_file = open("/Users/chrisyue/workspace_repo/"+workspace_guid+"/tree.json", "w")
        #tree_file.write("[]")
        tree_file.close()

        workspaces_r = open("/Users/chrisyue/workspace_repo/workspaces.json", "r")
        ws_obj = json.loads(workspaces_r.read())
        workspaces_r.close()

        ws_obj[workspace_guid] = {
            "name": name,
            "path": workspace_guid+"/"
        }

        with open('/Users/chrisyue/workspace_repo/workspaces.json', 'w') as f:
            json.dump(ws_obj, f)

        return {
                'message': 'create-workspace-success',
                'data': name,
                'workspace-guid': workspace_guid
                }
    except OSError:
        return {
                'message': 'create-workspace-error',
                'data': None,
                'workspace-guid': workspace_guid
                }


# For deleting workspace
def delete_workspace(guid):
    global tempStr
    workspace_guid = guid

    try:
        shutil.rmtree("/Users/chrisyue/workspace_repo/"+workspace_guid+"/")
        workspaces_r = open("/Users/chrisyue/workspace_repo/workspaces.json", "r")
        ws_obj = json.loads(workspaces_r.read())
        workspaces_r.close()

        del ws_obj[workspace_guid]

        with open('app/Users/chrisyue/workspace_repo/workspaces.json', 'w') as f:
            json.dump(ws_obj, f)

        return {
                'message': 'delete-workspace-success',
                'data': None,
                'workspace-guid': workspace_guid
                }
    except Exception:
        return {
                'message': 'delete-workspace-error',
                'data': None,
                'workspace-guid': workspace_guid
                }

