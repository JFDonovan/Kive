import os
import shutil

def backup(workspace_guid):
    # Backup directory structure json file
    shutil.copyfile('app/workspace_repo/{}/tree.json'.format(workspace_guid), 
                    'app/workspace_repo/{}/tree_backup.json'.format(workspace_guid))

    # shutil.copytree doesn't work if destination repo already exists
    if (os.path.exists('app/workspace_repo/{}/index_dir_backup'.format(workspace_guid))):
        shutil.rmtree('app/workspace_repo/{}/index_dir_backup'.format(workspace_guid))

    # Backup index directory
    shutil.copytree('app/workspace_repo/{}/index_dir'.format(workspace_guid), 
            'app/workspace_repo/{}/index_dir_backup'.format(workspace_guid))

def restore_from_backup(workspace_guid):
    # Remove corrupt/inconsistent tree and index
    for file in os.listdir('app/workspace_repo/{}/index_dir'.format(workspace_guid)):
        os.remove(file)
    # os.remove('app/workspace_repo/{}/tree.json'.format(workspace_guid))

    # Restore directory structure and index from backup
    if os.path.exists('app/workspace_repo/{}/index_dir_backup'.format(workspace_guid)):
        shutil.copytree('app/workspace_repo/{}/index_dir_backup'.format(workspace_guid), 
                        'app/workspace_repo/{}/index_dir'.format(workspace_guid))
        
    if os.path.exists('app/workspace_repo/{}/tree_backup'.format(workspace_guid)):
        shutil.copyfile('app/workspace_repo/{}/tree_backup.json'.format(workspace_guid), 
                        'app/workspace_repo/{}/tree.json'.format(workspace_guid))