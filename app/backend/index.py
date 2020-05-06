from whoosh.index import create_in, open_dir
from whoosh.writing import BufferedWriter, AsyncWriter
from whoosh.fields import *
from whoosh import analysis
from whoosh.support.charset import accent_map
from extract_text import scrape_paths
from datetime import datetime

import os
import time
import sys
import multiprocessing

import config


def get_schema():
    # Specifies what fields are stored in the index
    analyzer = analysis.StandardAnalyzer(stoplist=None, minsize=1) | analysis.CharsetFilter(accent_map)
    return Schema(name=TEXT(stored=True, analyzer=analyzer),
                    path=TEXT(stored=True),
                    content=TEXT(analyzer=analyzer),
                    legacy_ingest=TEXT,
                    ingest=TEXT,
                    last_accessed=TEXT,
                    media_files=TEXT(analyzer=analyzer),
                    indexed_time=DATETIME(stored=True),
                    id=ID(stored=True, unique=True))


def index_docs(json_lst, operation, workspace_guid):
    try:
        index(json_lst, operation, workspace_guid)
    except Exception as e:
        raise e

def index(json_lst, operation, workspace_guid):
    try:
        # The schema specifies the fields of documents in an index
        schema = get_schema()

        # Index directory has to be made before index gets written
        if len(os.listdir(config.app_data_path + '/workspace_repo/{}/index_dir'.format(workspace_guid))) == 0:
            # Create index based on schema
            ix = create_in(config.app_data_path + '/workspace_repo/{}/index_dir'.format(workspace_guid), schema)
        else:
            ix = open_dir(config.app_data_path + '/workspace_repo/{}/index_dir'.format(workspace_guid))

        # Prepare to write paths to index
        # multiprocessing.set_start_method('spawn')
        writer = ix.writer(procs=os.cpu_count(), multisegment=True)
        searcher = ix.searcher()
        id_check = ""
        if operation == 'add':
            index_lst = scrape_paths(json_lst)

            for entry, content, media_files in index_lst:
                path = entry['path']
                name = entry['name']
                legacy_ingest = entry['legacy_ingest']
                ingest = entry['ingest']
                last_accessed = entry['last_accessed']
                indexed_time = datetime.utcnow()
                id = entry['id']

                writer.add_document(name=name,
                                    path=path,
                                    content=content,
                                    legacy_ingest=legacy_ingest,
                                    ingest=ingest,
                                    last_accessed=last_accessed,
                                    media_files=media_files,
                                    indexed_time=indexed_time,
                                    id=id)
        elif operation == 'update':
            index_lst = scrape_paths(json_lst)
            for entry, content, media_files in index_lst:
                path = entry['path']
                name = entry['name']
                legacy_ingest = entry['legacy_ingest']
                ingest = entry['ingest']
                last_accessed = entry['last_accessed']
                indexed_time = datetime.utcnow()
                id = entry['id']
                id_check = id
                # raise Exception(entry)
                # cur_fields = searcher.document(id=id)
                # raise Exception(cur_fields)
                # content = cur_fields['content']
                # media_files = cur_fields['media_files']
                # raise Exception(entry)
                writer.update_document(name=name,
                                        path=path, 
                                        content=content, 
                                        legacy_ingest=legacy_ingest, 
                                        ingest=ingest, 
                                        last_accessed=last_accessed,
                                        media_files=media_files,
                                        indexed_time=indexed_time,
                                        id=id)
        elif operation == 'delete':
            for entry in json_lst:
                id = entry['id']

                writer.delete_by_term('id', id)

        writer.commit()
    except Exception as e:
        writer.commit()
        raise e

