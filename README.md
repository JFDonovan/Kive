# Kivé

### INSTRUCTIONS FOR STARTING 
##### ALL within Kive/ directory 

1. make sure you have python3
2. create a virtual environment 
   - OS X and Linux: 
```python3 -m venv venv``` 
   - Windows: 
```py -m venv venv```
3. activate virtual environment 
   - OS X and Linux: 
```. venv/bin/activate```
   - Windows: 
```.\venv\Scripts\activate``` 
   - (exit virtual environment with ```deactivate```)
4. install dependencies
```pip install -r requirements.txt```

5. install Node dependencies
```npm install```

6. start app
```npm start```

### VERSIONS 
- **npm**: 6.13.4
- **node**: v12.14.1
- **python**: 3.8
- **electron**: ^8.2.0
- **python-shell**: ^1.0.8

## PACKAGING 
##### For packaging Python Backend
1. ```cd app/backend/ ```
2. - OS X & Linux: ```pyinstaller --onefile -c server.py```
   - Windows: ```pyinstaller.exe --onefile -c server.py```
3. ```server.exe``` will be in ```dist/``` directory within ```app/backend/```

##### For packaging Electron Frontend
1. Copy Kive repo locally
2. ```rm -rf node-modules venv package-lock.json```
3. Install yarn if not already installed (```yarn --version``` to test)
   - OS X & Linux: ```brew install yarn```
   - Windows: ```choco install yarn```
   - if ```yarn``` command is not found then make sure yarn ```bin/``` folder is added to path correctly 
4. run cmd ```yarn``` in ```Kive/``` repo, which will create ```yarn.lock```
 - now ```yarn start``` is same as ```npm start```
5. run cmd ```yarn dist``` to package
   - OS X & Linux: find ```kive-1.0.0.dmg``` in ```dist/``` folder
   - Windows: find ```kive.exe``` in ```dist/``` folder
