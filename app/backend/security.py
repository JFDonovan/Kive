'''
Uncomment things that deal with "config" after app data path functionality is implemented.
'''

import os
import datetime
import config

from cryptography.fernet import Fernet

# If secret key doesn't exist, use this function to write it
def write_secret_key():
    '''
    Writes a secret key to the user's app data folder.
    '''
    with open('{}/secret_key'.format(config.app_data_path), 'w') as secret_key_file:
        secret_key_file.write(Fernet.generate_key())

def encrypt_response(response):
    '''
    Attempts to encrypt the request response to be given to the client.
    Returns the encrypted data if successful, else, throws an error.
    '''
    try:
        secret_key = open('{}/secret_key'.format(config.app_data_path), 'r').read()
        cipher = Fernet(secret_key)
        return cipher.encrypt(response.encode('utf-8'))
    except Exception as e:
        raise e

def decrypt_request(request):
    '''
    Attempts to decrypt the request given from the client.
    Returns the decrypted data if successful, else, throws an error.
    '''
    try:
        secret_key = open('{}/secret_key'.format(config.app_data_path), 'r').read()
        cipher = Fernet(secret_key)
        return cipher.decrypt(request)
    except Exception as e:
        raise e