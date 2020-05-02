from datetime import datetime
from selectolax.parser import HTMLParser

import os
import uuid
import ast

def parse_meta(tree_dir):
    '''
    Parses the meta.js file located in the tree/ directory.
    This file contains all of the metadata for each folder
    in the repository.
    '''
    with open('{}/meta.js'.format(tree_dir), 'r') as f:
        # Remove the surrounding scrapbook.meta() constructor
        file_str = ''

        for _ in range(3):
            next(f)
        for line in f:
            file_str += line

        return ast.literal_eval(file_str
                                .replace('\n', '')
                                .replace('scrapbook.meta(', '')[:-1])

def parse_toc(tree_dir):
    '''
    Parses the toc.js file located in the tree/ directory.
    This file describes the repository structure/hierarchy.
    '''
    with open('{}/toc.js'.format(tree_dir), 'r') as f:
        # Remove the surrounding scrapbook.toc() constructor
        file_str = ''

        for _ in range(3):
            next(f)
        for line in f:
            file_str += line

        return ast.literal_eval(file_str
                                .replace('\n', '')
                                .replace('scrapbook.toc(', '')[:-1])

def build_json(path, toc, meta):
    '''
    Runs Depth First Search to create a JSON file for jqTree,
    '''
    json_lst = []

    def recurse(cur_folder):
        cur_meta = meta[cur_folder]

        # Reformat all existing fields to reflect non-legacy field format
        cur_meta['children'] = []
        cur_meta['name'] = cur_meta.pop('title')

        # Set absolute path
        cur_meta['path'] = '{}/data/{}'.format(path, cur_folder)
        # Replace json attributes with our attribute names
        # and store additional attributes (i.e., ingest)
        if cur_meta['type'] == '':  # Check to see if cur_folder is actually a file
            index_path = '{}/data/{}'.format(path, cur_meta.pop('index'))
            if 'icon' in cur_meta: # Check if icon exists
                icon_path = '{}/data/{}/{}'.format(path, cur_folder, cur_meta['icon'])
                cur_meta['icon'] = icon_path
            else:
                cur_meta['icon'] = ''

            cur_meta['legacy_ingest'] = cur_meta.pop('create')[:8]
            cur_meta['ingest'] = datetime.now().strftime('%Y%m%d')
            cur_meta['last_accessed'] = cur_meta.pop('modify')[:8]
            cur_meta['type'] = 'file'
            cur_meta['path'] = index_path
            json_lst.append(cur_meta)
            
        cur_meta['id'] = str(uuid.uuid4())

        if cur_folder not in toc:
            return cur_meta

        for child in toc[cur_folder]:
            cur_meta['children'].append(recurse(child))

        return cur_meta

    json_tree = [recurse(folder) for folder in toc['root']]
    return json_tree, json_lst

def get_html_title(path):
    with open(path, 'r', encoding='utf8', errors='ignore') as f:
        html = f.read()    
        tree = HTMLParser(html)
        node = tree.css_first('title')
        if node:
            text = node.text(deep=False)
            return text if text else None # Return title text if title tag exists
        else:
            return None # Else, return None

def build_json_no_tree(folder):
    def find_files_helper(folder, json_obj):
        folder_list = os.listdir(folder)
        folders = []

        html_files = set()

        for entity in folder_list:
            if os.path.isdir(folder + "/" + entity):
                folders.append(folder + "/" + entity)
            else:
                ext = os.path.splitext(entity)
                if ext[1] in ('.html', '.htm'):
                    html_files.add(folder + "/" + entity.split(".htm")[0] + "_files")
                    name = get_html_title(folder + "/" + entity)
                    if not name:
                        name = entity
                    new_file_obj = {
                        'type': 'file',
                        'name': name,
                        'legacy_ingest': '',
                        'ingest': datetime.now().strftime('%Y%m%d'),
                        'last_accessed': datetime.fromtimestamp(os.path.getmtime(folder + '/' + entity)).strftime('%Y%m%d'),
                        'path': folder + "/" + entity,
                        'id': str(uuid.uuid4()),
                        'children': []
                    }
                    json_obj['children'].append(new_file_obj)
                    json_lst.append(new_file_obj) # talk later?

        for f in folders:
            go_in = True
            if f in html_files:
                go_in = False
            if go_in:
                new_folder_obj = {
                    'type': 'folder',
                    'name': os.path.basename(f),
                    #'path': f, DONT NEED
                    'id': str(uuid.uuid4()),
                    'children': []
                }
                json_obj['children'].append(new_folder_obj)
                find_files_helper(f, new_folder_obj)

    json_lst = []

    json_tree = {
        'type': 'folder',
        'name': os.path.basename(folder),
        'id': str(uuid.uuid4()),
        'children': []
    }
    try:
        find_files_helper(folder, json_tree)
    except Exception as e:
        # print('Exception:', e)
        return None, None

    return [json_tree], json_lst

def create_wsb_json(path):
    # checks to see if WSB repo contains a tree folder
    # if not, different function used to produce JSON
    try:
        if os.path.exists('{}/tree'.format(path)):
            meta = parse_meta('{}/tree'.format(path))
            toc = parse_toc('{}/tree'.format(path))
            json_tree, json_lst = build_json(path, toc, meta)
        else:
            json_tree, json_lst = build_json_no_tree(path)
    except:
        raise Exception('WSB directory could not be imported.')

    return json_tree, json_lst