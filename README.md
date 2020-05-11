# Kivé

Kivé will be a standalone desktop application that allows users to import cached web pages and store them in workspaces that resemble a tree-like directory structure. While within a given workspace, users can browse, preview, add, move, delete, and search over their cached web pages. When importing web pages, Kivé stores the file path relating to the imported file, not the file itself. For this reason, Kivé is very space efficient and respects the structural integrity of imported web pages.

## IMPORTING

Kivé operates under the assumption that users have already saved their web pages locally. In order to retain the integrity of resources embedded within a web page, users should be saving those pages as “complete web pages”. Browsers such as Google Chrome, Internet Explorer, and Firefox all have the capabilities to save complete web pages.

#### Legacy Imports

Kivé will have support for legacy ScrapBook or WebScrapBook users looking for a new platform to host their already existing archive. When a user wants to import a legacy workspace, they will be prompted to select the root directory that contains the ScrapBook/WebScrapBook ```data/``` folder.  We will need access to this folder in order to import the workspace into Kivé, since this folder contains the complete web page files. Once the ```data/``` folder has been located, Kivé then looks for the ```scrapbook.rdf``` file or ```tree/``` folder for ScrapBook and WebScrapBook repos respectively; this file/folder contains the information Kivé needs to infer the structuring of the imported legacy workspace. If not present, the web pages found in the ```data/``` folder will be ingested as a flat structure.


## DOWNLOAD
``` git clone https://github.com/JFDonovan/Kive/ ```
## INSTRUCTIONS FOR STARTING 
##### ALL within ```Kive/``` directory 

1. Make sure you have python3: 
   ```python3 --version```
2. Create a virtual environment: 
   - **OS X and Linux:** 
   ```python3 -m venv venv``` 
   - **Windows:** 
   ```py -m venv venv```
3. Activate the virtual environment: 
   - **OS X and Linux:** 
   ```. venv/bin/activate```
   - **Windows:** 
   ```.\venv\Scripts\activate``` 
   - (exit virtual environment with ```deactivate```)
4. Install dependencies: 
   ```pip install -r requirements.txt```

5. Install Node dependencies: 
```npm install```

6. Start application: 
```npm start```

### VERSIONS 
- **npm**: ```6.13.4```
- **node**: ```v12.14.1```
- **python**: ```3.8```
- **electron**: ```^8.2.0```
- **python-shell**: ```^1.0.8```

## PACKAGING 
#### For packaging Python Backend
1. ```cd app/backend/ ```
2. - **OS X & Linux:** ```pyinstaller --onefile server.py```
   - **Windows:** ```pyinstaller.exe --onefile server.py```
3. ```server.exe``` will be in ```dist/``` directory within ```app/backend/```

#### For packaging Electron Frontend
1. Make sure you are in ```Kive/``` directory
2. ```rm -rf node-modules/ venv/ yarn.lock```
3. Install yarn if not already installed (```yarn --version``` to test)
   - **OS X & Linux:**
   ```brew install yarn```
   - **Windows:** 
   ```choco install yarn```
   - if ```yarn``` command is not found then make sure yarn ```bin/``` folder is added to path correctly 
4. run cmd ```yarn``` in ```Kive/``` repo, which will create ```yarn.lock```
   - now ```yarn start``` is same as ```npm start```
5. run cmd ```yarn dist``` to package
   - **OS X & Linux:** <br/>
   find ```kive-1.0.0.dmg``` in ```dist/``` folder
   - **Windows:** <br/>
   find ```kive.exe``` in ```dist/``` folder
