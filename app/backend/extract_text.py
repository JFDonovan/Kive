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
import multiprocessing
import time

# MAX_THREADS = 30

def scrape_paths(json_lst):
    # start = time.time()
    # threads = min(MAX_THREADS, len(paths))
    # multiprocessing.set_start_method('spawn')

    # MULTIPROCESSING
    p = Pool(processes=os.cpu_count())
    results = p.map(parse_html, json_lst)
    p.close()
    p.join()

    # NON_MULTIPROCESSING
    # results = []
    # for item in json_lst:
    #     results.append(parse_html(json_lst[0]))

    # end = time.time()
    # print('Time to scrape: {}'.format(str(end - start)))
    return results


# from bs4 import BeautifulSoup
# from bs4.element import Comment

# import urllib.request
# import os
# import string

# def tag_visible(element):
#     if element.parent.name in ['img', 'video', 'audio', 'object', 'embed', 'source', 'script', 'style', 'head', 'meta', '[document]']:
#         return False
#     if isinstance(element, Comment):
#         return False
#     return True


# def parse_html(json_entry):
#     path = json_entry['path']

#     with open(path, 'r', encoding='utf8', errors='ignore') as f:
#         body = f.read()

#     soup = BeautifulSoup(body, 'html.parser')
#     texts = soup.findAll(text=True)
#     visible_texts = filter(tag_visible, texts)
#     extracted_text = u' '.join(t.strip() for t in visible_texts)

#     media_tags = ['img', 'video', 'audio', 'object', 'embed', 'source']
#     media_entities = soup.findAll(media_tags)

#     media_lst = []    
#     for entity in media_entities:
#         tag = entity.name
#         if tag == 'img':
#             if 'src' in entity and entity['src']:
#                 media_lst.append(entity['src'])
#         elif tag == 'video':
#             if 'src' in entity and entity['src']:
#                 media_lst.append(entity['src'])
#             if 'poster' in entity and entity['poster']:
#                 media_lst.append(entity['poster'])
#         elif tag == 'audio':
#             if 'src' in entity and entity['src']:
#                 media_lst.append(entity['src'])
#         elif tag == 'object':
#             if 'data' in entity and entity['data']:
#                 media_lst.append(entity['data'])
#         elif tag == 'embed':
#             if 'src' in entity and entity['src']:
#                 media_lst.append(entity['src'])
#         elif tag == 'source':
#             if 'src' in entity and entity['src']:
#                 media_lst.append(entity['src'])
#             if 'srcset' in entity and entity['srcset']:
#                 media_lst.append(entity['srcset'])

#     return json_entry, extracted_text, media_lst
#     # # Filter out all non-ASCII characters to avoid any indexing issues
#     # printable = set(string.printable)
#     # extracted_text = ''.join(filter(lambda x: x in printable, extracted_text))


# # Add multithreading
# from multiprocessing import Pool
# import concurrent.futures
# import multiprocessing

# import time

# # MAX_THREADS = 30

# def scrape_paths(json_lst):
#     # start = time.time()
#     # threads = min(MAX_THREADS, len(paths))
#     # multiprocessing.set_start_method('spawn')
#     p = Pool(processes=os.cpu_count())
#     results = p.map(parse_html, json_lst)
#     # p.close()
#     # p.join()
#     # results = [parse_html(json_lst[0])]
#     # end = time.time()
#     # print('Time to scrape: {}'.format(str(end - start)))
#     return results 
