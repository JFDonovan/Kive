import uuid
import os
import json
import shutil
from whoosh.index import create_in
from whoosh.fields import *

# For importing Non-legacy folder
def import_folder(folder):
    # global tempStr
    return_val = find_files(folder)

    json_tree = return_val[0]
    try:
        with open('app/workspace_repo/temp.json', 'w') as f:
            json.dump([json_tree], f)
    except Exception:
        print('import-folder-error')

    # tempStr = "import-folder-success"
    print('import-folder-success')


# For creating new workspace
def create_workspace(name):
    # global tempStr
    workspace_guid = str(uuid.uuid4())

    try:
        os.mkdir("app/workspace_repo/"+workspace_guid+"/")
        os.mkdir("app/workspace_repo/"+workspace_guid+"/index_dir/")
        # Create index based on schema
        create_in('app/workspace_repo/{}/index_dir'.format(workspace_guid), Schema(name=TEXT(stored=True, analyzer=analysis.StandardAnalyzer(stoplist=None, minsize=1)),
                    path=TEXT(stored=True),
                    content=TEXT(analyzer=analysis.StandardAnalyzer(stoplist=None, minsize=1)),
                    legacy_ingest=TEXT,
                    ingest=TEXT,
                    last_accessed=TEXT,
                    media_files=TEXT(stored=True, analyzer=analysis.StandardAnalyzer(stoplist=None)),
                    indexed_time=DATETIME(stored=True),
                    id=ID(stored=True, unique=True)))

        tree_file = open("app/workspace_repo/"+workspace_guid+"/tree.json", "w")
        #tree_file.write("[]")
        tree_file.close()

        workspaces_r = open("app/workspace_repo/workspaces.json", "r")
        ws_obj = json.loads(workspaces_r.read())
        workspaces_r.close()

        ws_obj[workspace_guid] = {
            "name": name,
            "path": workspace_guid+"/"
        }

        with open('app/workspace_repo/workspaces.json', 'w') as f:
            json.dump(ws_obj, f)

        print("create-workspace-success:*:"+workspace_guid+":*:"+name)
    except OSError:
        print("create-workspace-error")


# For deleting workspace
def delete_workspace(guid):
    global tempStr
    workspace_guid = guid

    try:
        shutil.rmtree("app/workspace_repo/"+workspace_guid+"/")
        workspaces_r = open("app/workspace_repo/workspaces.json", "r")
        ws_obj = json.loads(workspaces_r.read())
        workspaces_r.close()

        del ws_obj[workspace_guid]

        with open('app/workspace_repo/workspaces.json', 'w') as f:
            json.dump(ws_obj, f)

        print("delete-workspace-success:*:"+guid)
    except Exception:
        print("delete-workspace-failure")

