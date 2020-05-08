from datetime import datetime
from parse_sb import parse_rdf
from parse_wsb import create_wsb_json
from parse_nonlegacy import find_files

import os
import time
import ast
import uuid
import json

'''
This file contains code for walking through directories/parsing through legacy workspaces
to retrieve directory structure and lists of web page metadata.
'''

########################## CALLED BY MAIN INGEST FILE #########################
def get_json_lst(path, import_type): 
    '''
    Returns directory structure and list of actual web page paths in JSON format.
    '''

    # If path is actually a path to an HTML file and not a directory
    if not os.path.isdir(path) and (path.endswith('.html') or path.endswith('.htm') or path.endswith('.mhtml')):
        json_tree = [{
            'type': 'file',
            'name': os.path.basename(path),
            'legacy_ingest': '',
            'ingest': datetime.now().strftime('%Y%m%d'),
            'last_accessed': datetime.fromtimestamp(os.path.getmtime(path)).strftime('%Y%m%d'),
            'path': path,
            'source': '',
            'icon': '',
            'id': str(uuid.uuid4()),
            'children': []
        }]

        return json_tree, json_tree

    if import_type == 'wsb':
        if not os.path.exists('{}/data'.format(path)):
            raise Exception('WSB data folder not found.')
        
        json_tree, json_lst = create_wsb_json(path)
        #if json_lst is None: # Triggered if meta.js, toc.js, or tree dirs don't exist
        #    json_tree, json_lst = find_files('{}/data'.format(path))
    elif import_type == 'sb':
        if not os.path.exists('{}/data'.format(path)):
            raise Exception('ScrapBook data folder not found.')
        try: # Try to parse scrapbook.rdf and turn into JSON file tree.
           json_tree, json_lst = parse_rdf('{}/scrapbook.rdf'.format(path)) 
        except: # Triggered if scrapbook.rdf isnt found. 
            json_tree, json_lst = find_files('{}/data'.format(path))
    else:
        json_tree, json_lst = find_files(path)

    
    for obj in json_tree:
        find_icon_recursive(obj)

    return json_tree, json_lst

def find_icon_recursive(obj):
    if obj['type'] == 'file':
        obj['icon'] = find_icon(obj)
    elif obj['type'] == 'folder':
        for child in obj['children']:
            find_icon_recursive(child)    

def find_icon(file_json):
    '''
    Finds path of tab icon.
    '''

    json_icon = file_json.get('icon', '')
    url_source = file_json.get('source', '')
    icon_src = "app/assets/icons/world-icon.png"
    # If node has valid icon field
    if ((json_icon.strip() != "") and (json_icon != None)):
        icon_src = json_icon
        # Check if icon field is actually a valid icon
        if not((icon_src.endswith('.png') or icon_src.endswith('.jpg') or icon_src.endswith('.jpeg') or icon_src.endswith('.ico') or ('https://s2.googleusercontent.com/s2/favicons?domain_url=' in icon_src))):
            # Grab icon from web if icon field doesn't point to valid icon    
            icon_src = 'https://s2.googleusercontent.com/s2/favicons?domain_url=' + icon_src
    # If node has valid url source field     
    elif ((url_source != "") and (url_source != None) and ('localhost' not in url_source)):
        # Grab icon from web using url source field
        icon_src = 'https://s2.googleusercontent.com/s2/favicons?domain_url=' + url_source

    return icon_src                           
            
