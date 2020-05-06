# Kivé

Kivé will be a standalone desktop application that allows users to import cached web pages and store them in workspaces that resemble a tree-like directory structure. While within a given workspace, users can browse, preview, add, move, delete, and search over their cached web pages. When importing web pages, Kivé stores the file path relating to the imported file, not the file itself. For this reason, Kivé is very space efficient and respects the structural integrity of imported web pages.

### DOWNLOAD
``` git clone https://github.com/JFDonovan/Kive/ ```
### INSTRUCTIONS FOR STARTING 
##### ALL within ```Kive/``` directory 

1. Make sure you have python3: <br/>
   ```python3 --version```
2. Create a virtual environment: 
   - OS X and Linux: <br/>
   ```python3 -m venv venv``` 
   - Windows: <br/>
   ```py -m venv venv```
3. Activate the virtual environment: 
   - OS X and Linux: <br/>
   ```. venv/bin/activate```
   - Windows: <br/>
   ```.\venv\Scripts\activate``` 
   - (exit virtual environment with ```deactivate```)
4. Install dependencies: <br/>
   ```pip install -r requirements.txt```

5. Install Node dependencies: <br/>
```npm install```

6. Start application: <br/>
```npm start```

### VERSIONS 
- **npm**: 6.13.4
- **node**: v12.14.1
- **python**: 3.8
- **electron**: ^8.2.0
- **python-shell**: ^1.0.8

## PACKAGING 
#### For packaging Python Backend
1. ```cd app/backend/ ```
2. - OS X & Linux: ```pyinstaller --onefile -c server.py```
   - Windows: ```pyinstaller.exe --onefile -c server.py```
3. ```server.exe``` will be in ```dist/``` directory within ```app/backend/```

#### For packaging Electron Frontend
1. Make sure you are in ```Kive/``` directory
2. ```rm -rf node-modules venv package-lock.json```
3. Install yarn if not already installed (```yarn --version``` to test)
   - OS X & Linux: <br/>
   ```brew install yarn```
   - Windows: <br/>
   ```choco install yarn```
   - if ```yarn``` command is not found then make sure yarn ```bin/``` folder is added to path correctly 
4. run cmd ```yarn``` in ```Kive/``` repo, which will create ```yarn.lock```
   - now ```yarn start``` is same as ```npm start```
5. run cmd ```yarn dist``` to package
   - OS X & Linux: <br/>
   find ```kive-1.0.0.dmg``` in ```dist/``` folder
   - Windows: <br/>
   find ```kive.exe``` in ```dist/``` folder
