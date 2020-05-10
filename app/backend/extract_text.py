import os
from selectolax.parser import HTMLParser
from get_json import find_icon

'''
Parses the HTML of a file to extract visible text, tab icons, and multimedia file paths.
'''

def parse_html(json_entry):
    path = json_entry['path']
    with open(path, 'r', encoding='utf8', errors='ignore') as f:
        html = f.read()

    tree = HTMLParser(html)
    
    if tree.body is None:
        return None

    # Look for canonical tag and set to source URL

    source_url = ''
    for node in tree.css('link'):
        if 'rel' in node.attributes and node.attributes['rel'] == 'canonical':
            source_url = node.attributes['href']
            break

    # Find all multimedia filepaths in all tags that could possible contain such paths
    # using a CSS selector.
    media_lst = []
    media_tags_selector = 'img,video,audio,object,embed,source'
    for node in tree.css(media_tags_selector):
        tag = node.tag
        if tag == 'img':
            if 'src' in node.attributes and node.attributes['src']:
                    media_lst.append(node.attributes['src'])
        elif tag == 'video':
            if 'src' in node.attributes and node.attributes['src']:
                media_lst.append(node.attributes['src'])
            if 'poster' in node.attributes and node.attributes['poster']:
                media_lst.append(node.attributes['poster'])
        elif tag == 'audio':
            if 'src' in node.attributes and node.attributes['src']:
                media_lst.append(node.attributes['src'])
        elif tag == 'object':
            if 'data' in node.attributes and node.attributes['data']:
                media_lst.append(node.attributes['data'])
        elif tag == 'embed':
            if 'src' in node.attributes and node.attributes['src']:
                media_lst.append(node.attributes['src'])
        elif tag == 'source':
            if 'src' in node.attributes and node.attributes['src']:
                media_lst.append(node.attributes['src'])
            if 'srcset' in node.attributes and node.attributes['srcset']:
                media_lst.append(node.attributes['srcset'])

    # These tags will never contain visible text.
    ignore_tags = ['img', 'video', 'audio', 'object', 'embed', 'source', 'script', 'style', 'head', 'meta', '[document]']
    tree.strip_tags(ignore_tags)
    text = tree.body.text()

    if source_url != '':
        update_src_dict = {}
        update_src_dict['id'] = json_entry['id']
        update_src_dict['source'] = source_url
        update_src_dict['icon'] = find_icon(update_src_dict)
        
        
        return json_entry, text, media_lst, update_src_dict
    else:
        return json_entry, text, media_lst, None
    
    

# Add multithreading
from multiprocessing import Pool
import concurrent.futures
import multiprocessing
import time

def scrape_paths(json_lst):
    '''
    Map parse_html() to all elements in JSON list using multiprocessing.
    '''

    p = Pool(processes=os.cpu_count())
    results = p.map(parse_html, json_lst)
    p.close()
    p.join()

    return results