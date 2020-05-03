import os
import time
import sys
import platform
import psutil
import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description=
    '''
        This script tests non-legacy ingest latency and provides
        statistics to benchmark performance, averaging time taken
        to ingest over a specified number of trials.

        Instructions:
        Run this script with the --path flag set to the
                path to the directory you want to ingest and the
                --trials flag to specify the number of trials you
                want to run.
                e.g., python3 latency_tests.py --path path/to/dir --trials 10
    ''',
        formatter_class=argparse.RawTextHelpFormatter)

    parser.add_argument('--path', type=str, dest='ingest_dir_path', help='Path to the directory you want to ingest.')
    parser.add_argument('--trials', type=int, dest='num_trials', help='Number of trials you want to average over.')
    args = parser.parse_args()

    # This section finds creates workspace and passes their GUIDs to the ingest workflow
    num_trials = args.num_trials
    for i in range(num_trials):
        os.system('echo "create-workspace:*:workspace_{}" | python3 app/backend/cmd_interpret.py'.format(i))

    workspace_guids = []
    for dir in os.listdir(config.app_data_path + '/workspace_repo'):
        if os.path.isdir(config.app_data_path + '/workspace_repo/{}'.format(dir)):
            workspace_guids.append(dir)

    print('****************** System Information *******************')
    print('Operating System: {}'.format(sys.platform))
    print('CPU: {}'.format(platform.processor()))
    print('CPU Clock Speed: {} GHz'.format(psutil.cpu_freq().max / 1000))
    print('CPU Num Logical Processors: {}'.format(psutil.cpu_count()))
    available_ram = psutil.virtual_memory().available / 1024**3
    total_ram = psutil.virtual_memory().total / 1024**3
    print('Available RAM: {}/{}'.format(str(round(available_ram, 2)), total_ram))
    
    print('**************** Running Ingest Workflow ****************')
    ingest_dir_path = args.ingest_dir_path

    print("Repeating ingest {} times.".format(num_trials))
    print(workspace_guids)
    times = []
    for i, guid in enumerate(workspace_guids):
        start = time.time()
        os.system('echo "import-folder:*:{}:*:{}" | python3 app/backend/cmd_interpret.py'.format(ingest_dir_path, guid))
        end = time.time()
        print('{}: Time taken to fully ingest: {} seconds'.format(i + 1, end - start))
        times.append(end - start)

    print('\nAverage Ingest Time: {} seconds'.format(sum(times) / len(times)))

    print('**************** Cleaning Up Workspaces ****************')
    for guid in workspace_guids:
        os.system('echo "delete-workspace:*:{}" | python3 app/backend/cmd_interpret.py'.format(guid))
