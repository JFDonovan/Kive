from html.parser import HTMLParser
from datetime import datetime

import json
import sys
import os
import uuid

'''
ScrapBook directory ingest workflow.
'''


#Declaring global variables needed to be accessed everywhere
folder_path = ''
child_dict = {}
json_dict = {}

class MyRDFParser(HTMLParser):
    # Declaring class variable
    global child_dict
    global json_dict
    current_parent = ''
    
    # Helper method to get ScrapBook name from 'RDF:about' attribute
    def get_sb_name(self, full_string):
        return full_string.split(':')[2]

    # Method to handle behavior upon reading various tags
    def handle_starttag(self, tag, attrs):
        
        # 'RDF:Description' tag creates a new json object (file or folder) to be stored in json_dict
        if (tag == 'rdf:description'):
            name = self.get_sb_name(attrs[0][1])
            sb_date = name.split('item')[1]
            date = datetime.today().strftime('%Y%m%d')
            file_path = folder_path + sb_date + '/index.html'
            
            # Fields that will be read from RDF attributes
            item_type = ''
            source_url = ''
            icon_src = ''
            title = ''

            # Loop through attributes to get desired data
            for attr in attrs:
                if attr[0] == 'ns1:type':
                    if attr[1] == 'folder':
                        item_type = 'folder'
                        file_path = ''
                    else:
                        item_type = 'file'
                elif attr[0] == 'ns1:title':
                    title = attr[1]
                elif attr[0] == 'ns1:source':
                    source_url = attr[1]
                elif attr[0] == 'ns1:icon':
                    full_icon_str = attr[1]
                    if full_icon_str.startswith('resource://scrapbook'):
                        icon_src = folder_path + full_icon_str.split('data/')[1]
                    else:
                        icon_src = full_icon_str
                    

            # Creating new JSON object with desired fields
            new_json = {
                "type": item_type,
                "legacy_ingest": sb_date[0:8],
                "ingest": date,
                "last_accessed": date,
                "source": source_url,
                "icon": icon_src,
                "name": title,
                "path": file_path,
                "id": str(uuid.uuid4()),
                "children": [],
            }

            # Adding new JSON to json_dict
            json_dict[name] = new_json
        
        #'RDF:Seq' tag adds folder name to child_dict keys and makes it current_parent
        if (tag == 'rdf:seq'):
            name = self.get_sb_name(attrs[0][1])
            MyRDFParser.current_parent = name
            child_dict[name] = []
        
        #'RDF:li' tag adds current resource to current_parrent's field in child_dict
        if (tag == 'rdf:li'):
            name = self.get_sb_name(attrs[0][1])
            child_dict[MyRDFParser.current_parent].append(name)
    
    # Method to handle behavior on 'RDF:Seq' end tag
    def handle_endtag(self, tag):
        if (tag == 'rdf:seq'):
            MyRDFParser.current_parent = ''
      

# Method to build JSON object from global variables  
def build_tree_json():
    global child_dict
    global json_dict
    final_json = []
    file_json_list = []

    for item in json_dict.values():
        if (item['type'] == 'file'):
            file_json_list.append(item)
    
    # Iterate over every folder, represented by keys in 'child_dict'
    for parent in child_dict:

        # Check if parent is root, we will take care of root children later
        if (parent != 'root'):
            parent_json = json_dict[parent]

            # Iterate over children of parent in top level loop
            for child in child_dict[parent]:
                # Append child JSON to parent JSON
                parent_json['children'].append(json_dict[child])

            # Update parent JSON in json_dict
            json_dict[parent] = parent_json
    
    # Add 'root' children to top level 'final_json'
    for child in child_dict['root']:
        final_json.append(json_dict[child])

    # Return newly built nested JSON object respresenting full tree
    return final_json, file_json_list

# Method to be called from outside scripts.
# Accepts filepath pointing to 'scrapbook.rdf' file in a valid ScrapBook repository
def parse_rdf(filepath):
    global child_dict
    global json_dict
    child_dict = {}
    json_dict = {}
   
    # Open given filepath as 'rdf' and turn it into a string to be fed to MyRDFParser
    with open (filepath) as rdf:
            rdf_str = rdf.read()
        
    # Updating global folder path to be accessed in MyRDFParser
    global folder_path 
    folder_path = filepath.split('scrapbook.rdf')[0] + 'data/'

    # Checking if 'data/' folder exists
    if (os.path.exists(folder_path)):
        
        # Creating MyRDFParser object and feeding it 'rdf_str'
        parser = MyRDFParser()
        parser.feed(rdf_str)
        parser.close()
        # Build tree JSON and return it
        return build_tree_json()
    else:
        # 'data/' folder doesn't exist, reset global 'folder_path' and return None
        folder_path = ""
        raise Exception('ScrapBook directory could not be imported.')
    
    

    
    



    
