# from find_files import get_json_lst
from ingest import ingest, update, delete
from dir_manage import create_workspace, delete_workspace, import_folder
from search import search_from_strs

import sys

if __name__ == '__main__':
    # Incoming argument from front end
    # incoming = sys.argv[1]

    # cmd_list = incoming.split(":*:")
    # command = cmd_list[0]
    recv_msg = ''
    for line in sys.stdin:
        recv_msg = line.rstrip()
        break
    # cmd_list = [sys.argv[1]]
    # raise Exception(recvMsg.split(':*:'))
    # cmd_list.extend(recvMsg.split(':*:'))
    # cmd_list = recvMsg.split(':*:')
    
    first_delim_end = recv_msg.find(':*:') + 3 # Marks the index after the first delimiter
    command = recv_msg[:first_delim_end - 3]
    args = []

    last_delim_start = len(recv_msg) # Marks where the last seen delimiter begins, from the right side
    
    num_args = 0

    if command in ('create-workspace', 'delete-workspace'):
        num_args = 1
    elif command in ('import-folder', 'import-file', 'import-wsb', 'import-sb', 'delete-files', 'update-files'):
        num_args = 2
    elif command == 'search':
        num_args = 7

    for _ in range(num_args - 1):
        cur_delim_end = recv_msg.rfind(':*:', 0, last_delim_start) + 3 # Marks the index after the current delimiter
        args.insert(0, recv_msg[cur_delim_end:last_delim_start])
        last_delim_start = cur_delim_end - 3
    # raise Exception('First Delim: ', first_delim_end, 'Last delim: ', cur_delim_end - 3)
    # raise Exception(args)
    args.insert(0, recv_msg[first_delim_end:last_delim_start])

    # command = cmd_list[0]

    # This dictionary uses the command passed from the frontend to run the relevant workspace-/index-related functions
    # print(args)
    cmd_dict = {
        'create-workspace': lambda: create_workspace(name=args[0]),
        'delete-workspace': lambda: delete_workspace(guid=args[0]),
        'import-folder': lambda: ingest(path=args[0], import_type='kive', workspace_guid=args[1]),
        'import-file': lambda: ingest(path=args[0], import_type='kive', workspace_guid=args[1]),
        'import-wsb': lambda: ingest(path=args[0], import_type='wsb', workspace_guid=args[1]),
        'import-sb': lambda: ingest(path=args[0], import_type='sb', workspace_guid=args[1]),
        'delete-files': lambda: delete(json_lst=args[0], workspace_guid=args[1]),
        'update-files': lambda: update(json_lst=args[0], workspace_guid=args[1]),
        'search': lambda: search_from_strs(search_text=args[0], 
                                leg_datetime_range=args[1],
                                kive_datetime_range=args[2],
                                la_datetime_range=args[3],
                                media_text_lst=args[4],
                                fields_lst=args[5],
                                workspace_guid=args[6])
    }

    cmd_dict[command]()
