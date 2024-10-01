const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

function openApp(appPath) {
    return new Promise((resolve, reject) => {
        exec(`start "" "${appPath}"`, (error) => {
            if (error) {
                console.error(`Erro ao abrir o aplicativo: ${error.message}`);
                return reject(error);
            }
            console.log(`Aplicativo aberto: ${appPath}`);
            resolve();
        });
    });
}

function closeApp(appPath) {
    return new Promise((resolve, reject) => {
        const appName = path.basename(appPath, '.exe');
        console.log(`Tentando fechar: ${appName}.exe`);

        exec(`taskkill /IM "${appName}.exe" /F`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao fechar o app: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`Erro: ${stderr}`);
                return reject(new Error(stderr));
            }
            console.log(`App fechado: ${stdout}`);
            resolve();
        });
    });
}

async function runAllExecutablesInFolder(folderPath) {
    try {
        const files = await fs.readdir(folderPath);
        const exeFiles = files.filter(file => file.endsWith('.exe'));

        for (const file of exeFiles) {
            const appPath = path.join(folderPath, file);
            await openApp(appPath);
            await new Promise(resolve => setTimeout(resolve, 10000));
            await closeApp(appPath);
        }

        console.log('Todos os aplicativos foram processados.');
    } catch (err) {
        console.error(`Erro ao processar a pasta: ${err.message}`);
    }
}

const folderPath = "C:\\Users\\gs4vo\\AppData\\Local\\Postman";
runAllExecutablesInFolder(folderPath);
