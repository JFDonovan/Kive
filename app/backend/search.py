from whoosh.index import open_dir
from whoosh.fields import *
from whoosh.qparser import MultifieldParser, OperatorsPlugin
from whoosh.qparser.dateparse import DateParserPlugin
from whoosh.query import Variations

from datetime import datetime

import time
import sys
import os
import ast
import json

def search_from_strs(search_text, leg_datetime_range, kive_datetime_range,
                la_datetime_range, media_text_lst, fields_lst, workspace_guid):
    # Evaluate strings into objects for search_docs
    leg_datetime_range = ast.literal_eval(leg_datetime_range)
    kive_datetime_range = ast.literal_eval(kive_datetime_range)
    la_datetime_range = ast.literal_eval(la_datetime_range)
    media_text_lst = ast.literal_eval(media_text_lst)
    fields_lst = ast.literal_eval(fields_lst)

    results = search_docs(search_text, leg_datetime_range, kive_datetime_range, la_datetime_range,
                        media_text_lst, fields_lst, workspace_guid)
    json_results = json.dumps(results)
    print('search-success:*:' + json_results)

def search_docs(search_text, leg_datetime_range, kive_datetime_range,
                la_datetime_range, media_text_lst, fields_lst, workspace_guid):
    # start = time.time()
    ix = open_dir('app/workspace_repo/{}/index_dir'.format(workspace_guid))
    # print(ix.schema)
    with ix.searcher() as searcher:
        ####### FOR DEBUGGING #########
        # print(searcher.doc_count())
        # for doc in searcher.documents():

        #     print(doc['media_files'])


        # Create parser.
        # Set termclass so that it accounts for grammatical variations in word spelling.
        # Change default query operators so that ANDs, ORs, and NOTs in actual
        # search text do not get parsed as operators.
        parser = MultifieldParser(fields_lst, schema=ix.schema, termclass=Variations)
        op = OperatorsPlugin(And=' &!AND!& ', Or=' &!OR!& ', Not=' &!NOT!& ')
        parser.replace_plugin(op)

        ########### Build query based on filters sent from front-end ##########
        query_lst = []
        # raise Exception('Search text:', search_text)
        if search_text and ('name' in fields_lst or 'content' in fields_lst):
            if 'name' in fields_lst and 'content' in fields_lst:
                query_lst.append('(name:(*{}*) &!OR!& content:(*{}*))'.format(search_text, search_text))
            elif 'name' in fields_lst:
                query_lst.append('(name:(*{}*))'.format(search_text))
            elif 'content' in fields_lst:
                query_lst.append('(content:(*{}*))'.format(search_text))

            
        if 'legacy_ingest' in fields_lst:
            leg_from_datetime = leg_datetime_range[0]
            leg_to_datetime = leg_datetime_range[1]
            if not leg_from_datetime and not leg_to_datetime:
                pass
            elif leg_from_datetime and leg_to_datetime:
                query_lst.append('(legacy_ingest:[{} to {}])'.format(leg_from_datetime, leg_to_datetime))
            elif not leg_to_datetime:
                query_lst.append('(legacy_ingest:[{} to])'.format(leg_from_datetime))
            elif not leg_from_datetime:
                query_lst.append('(legacy_ingest:[to {}])'.format(leg_to_datetime))

        if 'ingest' in fields_lst:
            kive_from_datetime = kive_datetime_range[0]
            kive_to_datetime = kive_datetime_range[1]
            if not kive_from_datetime and not kive_to_datetime:
                pass
            elif kive_from_datetime and kive_to_datetime:
                query_lst.append('(ingest:[{} to {}])'.format(kive_from_datetime, kive_to_datetime))
            elif not kive_to_datetime:
                query_lst.append('(ingest:[{} to])'.format(kive_from_datetime))
            elif not kive_from_datetime:
                query_lst.append('(ingest:[to {}])'.format(kive_to_datetime))

        if 'last_accessed' in fields_lst:
            la_from_datetime = la_datetime_range[0]
            la_to_datetime = la_datetime_range[1]
            if not la_from_datetime and not la_to_datetime:
                pass
            elif la_from_datetime and la_to_datetime:
                query_lst.append('(last_accessed:[{} to {}])'.format(la_from_datetime, la_to_datetime))
            elif not la_to_datetime:
                query_lst.append('(last_accessed:[{} to])'.format(la_from_datetime))
            elif not la_from_datetime:
                query_lst.append('(last_accessed:[to {}])'.format(la_to_datetime))

        if 'media_files' in fields_lst and len(media_text_lst) > 0:
            for file in media_text_lst:
                query_lst.append('(media_files:*{}*)'.format(file))

        query_string = ' &!AND!& '.join(query_lst)
        query = parser.parse(query_string) # Parse query string to create actual query
        # print(query_string)
        # print(query)
        # raise Exception(query)
        results = searcher.search(query, limit=None) # Perform search and store results
        if len(results) == 0:
            # print('No results found.')
            return []
        else:
            result_json_lst = []
            for result in results:
                # Concat paths into asterisk-delimited string to send to front-end
                result_json_lst.append({'name': result['name'], 'path': result['path'], 'id': result['id']})

            # end = time.time()
            return result_json_lst

if __name__ == '__main__':
    # FOR DEBUGGING

    search_text = sys.argv[1]
    # print(search_text)
    leg_datetime_range = ast.literal_eval(sys.argv[2]) # legacy ingest (from_datetime,to_datetime) tuple
    # print(leg_datetime_range)
    kive_datetime_range = ast.literal_eval(sys.argv[3]) # kive ingest (from_datetime,to_datetime) tuple
    # print(kive_datetime_range)
    la_datetime_range = ast.literal_eval(sys.argv[4]) # last access (from_datetime,to_datetime) tuple
    # print(la_datetime_range)
    media_text_lst = ast.literal_eval(sys.argv[5]) # media filenames/extensions e.g. ['.jpg','foo.pdf','.mp3'] list
    # print(media_text_lst)
    fields_lst = ast.literal_eval(sys.argv[6]) # Fields selected from advanced search filters
                                               # e.g. ['name','content','legacy_ingest'] list

    workspace_guid = sys.argv[7]
    # print(fields_lst)
    # Send results to front-end through std out
    print(search_docs(search_text, leg_datetime_range, kive_datetime_range, la_datetime_range, media_text_lst, fields_lst, workspace_guid))
    sys.stdout.flush()
