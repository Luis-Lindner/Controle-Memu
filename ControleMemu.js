const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const shortcut = require('windows-shortcuts');
let count = true;
    
function openApp(appPath) {
    console.log(`Iniciando a abertura do aplicativo: ${appPath}`);

    if (!appPath) {
        return Promise.reject(new Error('Caminho do aplicativo não fornecido.'));
    }

    return new Promise((resolve, reject) => {
        const process = spawn(appPath, [], { detached: true, stdio: 'ignore' });

        process.on('error', (error) => {
            console.error(`Erro ao abrir o aplicativo: ${error.message}`);
            reject(error);
        });

        process.unref();
        console.log(`Aplicativo aberto com sucesso: ${appPath}`);
        resolve();
    });
}

function closeApp(realAppPath) {
    console.log(`Tentando fechar o aplicativo: ${realAppPath}`);
    const appName = path.basename(realAppPath, '.exe');

    return new Promise((resolve, reject) => {
        exec('tasklist', (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }

            console.log(`Lista de processos:\n${stdout}`);

            const regex = new RegExp(`${appName}`, 'i');
            const matchedProcess = stdout.match(regex);

            if (matchedProcess) {
                console.log(`Processo encontrado, fechando: ${appName}.exe`);
                exec(`taskkill /IM "${appName}.exe" /F`, (killError, killStdout, killStderr) => {
                    if (killError) {
                        return reject(killError);
                    }
                    console.log(`Aplicativo fechado com sucesso: ${killStdout}`);
                    resolve();
                });
            } else {
                console.log(`Processo ${appName}.exe não encontrado.`);
                resolve();
            }
        });
    });
}

async function resolveShortcut(appPath) {
    console.log(`Verificando se o arquivo é um atalho: ${appPath}`);

    return new Promise((resolve, reject) => {
        if (appPath.endsWith('.lnk')) {
            shortcut.query(appPath, (err, result) => {
                if (err) {
                    return reject(err);
                }
                if (result && result.target) {
                    resolve(result.target);
                } else {
                    return reject(new Error('Caminho do atalho inválido.'));
                }
            });
        } else {
            resolve(appPath);
        }
    });
}

async function runAllExecutablesInFolder(folderPath) {
    console.log(`Lendo o conteúdo da pasta: ${folderPath}`);
do{
    try {
        const files = await fs.readdir(folderPath);
        const exeFiles = files.filter(file => file.endsWith('.exe') || file.endsWith('.lnk'));

        for (const file of exeFiles) {
            const appPath = path.join(folderPath, file);
            const realAppPath = await resolveShortcut(appPath);

            try {
                await openApp(realAppPath);
                console.log(`Esperando 5 segundos antes de fechar o aplicativo.`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (err) {
                console.error(`Erro ao abrir o aplicativo: ${err.message}`);
                continue;
            }

            console.log(`Tentando fechar o processo do executável real.`);
            await closeApp(realAppPath);

            console.log(`Aplicativo ${file} processado com sucesso.`);
        }

        console.log('Todos os aplicativos foram processados.');
    } catch (err) {
        console.error(`Erro ao processar a pasta: ${err.message}`);
    }
    console.log("Aguardando 20 segundos para iniciar o código novamente");
    await new Promise(resolve => setTimeout(resolve,20000));

}while(count = true)

}

const folderPath = "C:/Users/SDR Naty/Desktop/testeAbrirMemu";
runAllExecutablesInFolder(folderPath);
