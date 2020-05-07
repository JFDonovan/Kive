import os
import shutil
import config

'''
Backup and restore-from-backup functionality.
'''

def backup(workspace_guid):
    '''
    Backs up index directory.
    '''

    # shutil.copytree doesn't work if destination repo already exists
    if (os.path.exists(config.app_data_path + '/workspace_repo/{}/index_dir_backup'.format(workspace_guid))):
        shutil.rmtree(config.app_data_path + '/workspace_repo/{}/index_dir_backup'.format(workspace_guid))

    # Backup index directory
    shutil.copytree(config.app_data_path + '/workspace_repo/{}/index_dir'.format(workspace_guid), 
            config.app_data_path + '/workspace_repo/{}/index_dir_backup'.format(workspace_guid))

def restore_from_backup(workspace_guid):
    '''
    Restores index directory from backup.
    '''

    # Remove corrupt/inconsistent tree and index
    for file in os.listdir(config.app_data_path + '/workspace_repo/{}/index_dir'.format(workspace_guid)):
        os.remove(file)

    # Restore directory structure and index from backup
    if os.path.exists(config.app_data_path + '/workspace_repo/{}/index_dir_backup'.format(workspace_guid)):
        shutil.copytree(config.app_data_path + '/workspace_repo/{}/index_dir_backup'.format(workspace_guid), 
                        config.app_data_path + '/workspace_repo/{}/index_dir'.format(workspace_guid))
        
    if os.path.exists(config.app_data_path + '/workspace_repo/{}/tree_backup'.format(workspace_guid)):
        shutil.copyfile(config.app_data_path + '/workspace_repo/{}/tree_backup.json'.format(workspace_guid), 
                        config.app_data_path + '/workspace_repo/{}/tree.json'.format(workspace_guid))