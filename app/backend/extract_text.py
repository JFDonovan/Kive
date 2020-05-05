import os
from selectolax.parser import HTMLParser

# extracted_texts = []

def parse_html(json_entry):
    path = json_entry['path']
    with open(path, 'r', encoding='utf8', errors='ignore') as f:
        html = f.read()
    # html.replace('\n', ' ')
    tree = HTMLParser(html)

    if tree.body is None:
        return None

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

    ignore_tags = ['img', 'video', 'audio', 'object', 'embed', 'source', 'script', 'style', 'head', 'meta', '[document]']
    tree.strip_tags(ignore_tags)
    text = tree.body.text()
    # extracted_texts.append(text)
    return json_entry, text, media_lst

# Add multithreading
from multiprocessing import Pool
import concurrent.futures

import time

# MAX_THREADS = 30

def scrape_paths(json_lst):
    # start = time.time()
    # threads = min(MAX_THREADS, len(paths))
    p = Pool(processes=os.cpu_count())
    results = p.map(parse_html, json_lst)
    #results = [parse_html(json_lst[0])]
    # end = time.time()
    # print('Time to scrape: {}'.format(str(end - start)))
    return results
