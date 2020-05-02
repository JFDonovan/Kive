#import sumTwoNumbers
import os

from flask import Flask, request
from flask_restful import Resource, Api

from ingest import ingest, update, delete
from dir_manage import create_workspace, delete_workspace, import_folder
from search import search_from_strs

app = Flask(__name__)
api = Api(app)


def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()


class shutdown(Resource):
    def get(self):
        shutdown_server()
        return 'Shutting down server..'


class sumNumbers(Resource):
    def get(self, first_number, second_number, workspace_guid):
        result = "success"
        try:
            os.mkdir("/Users/chrisyue/workspace_repo/" + workspace_guid + "/")
            os.mkdir("/Users/chrisyue/workspace_repo/" + workspace_guid + "/index_dir/")
        except:
            result = "workspace already exists"

        return {'data': str(int(first_number)+int(second_number))+" "+result}


class create_workspace_req(Resource):
    def get(self, name):
        create_workspace(name)
        return {'data': "TBD"}



api.add_resource(shutdown, '/shutdown/')
api.add_resource(sumNumbers, '/sumtwonumbers/<first_number>/<second_number>/<workspace_guid>/')
#api.add_resource(create_workspace_req, '/create-workspace/<name>')








# Runs main (should stay at bottom)
if __name__ == '__main__':
    app.run()
