const { spawn } = require('child_process');
const process = require('process');
const Promise = require('bluebird');
const fs = require('fs');
const mkdirp = Promise.promisify(require('mkdirp'));

let ext = '';
if (process.platform === 'win32') {
    ext += '.cmd';
} else {
    ext = '';
}

let consoleErrors;
let consoleOutput;
let migrationErrors;
let migrationOutput;
let mochaErrors;
let mochaOutput;

let truffleConsole;
function finish() {
    truffleConsole.kill();
    console.log('###### END');
}

function runTests(finish) {
    console.log('###### RUNNING TESTS');
    const mochaTests = spawn('truffle test && npm run serverTests --ansi', { shell: true });

    mochaTests.stdout.on('data', (text) => {
        console.log(text);
    });

    mochaTests.stderr.on('data', (text) => {
        console.log(text);
    });

    mochaTests.on('exit', () => {
        finish();
    });

    mochaTests.stderr.pipe(mochaErrors);
    mochaTests.stdout.pipe(mochaOutput);
    mochaTests.stdout.setEncoding('utf8');
    mochaTests.stderr.setEncoding('utf8');
}

function initMigrations(callback) {
    console.log('###### SPAWNING MIGRATIONS');
    const migrations = spawn('truffle' + ext, ['migrate', '--reset', '--seed 2c2891d4'], { shell: true });

    migrations.stderr.on('data', (text) => {
        console.log(text);
    });

    migrations.on('exit', () => {
        runTests(callback);
    });

    migrations.stderr.pipe(migrationErrors);
    migrations.stdout.pipe(migrationOutput);
    migrations.stdout.setEncoding('utf8');
    migrations.stderr.setEncoding('utf8');
}

function spawnConsole() {
    let first = false;
    console.log('###### SPAWNING DEVELOPMENT TESTRPC');
    truffleConsole = spawn('truffle' + ext, ['develop'], { shell: true });

    truffleConsole.stdout.on('data', (text) => {
        if (text.includes('truffle(develop)')) {
            if (!first) {
                initMigrations(finish);
            }
            first = true;
        }
    });

    truffleConsole.stderr.on('data', (text) => {
        console.log(text);
    });

    truffleConsole.stderr.pipe(consoleErrors);
    truffleConsole.stdout.pipe(consoleOutput);
    truffleConsole.stdout.setEncoding('utf8');
    truffleConsole.stderr.setEncoding('utf8');
}

mkdirp('../testLogs').then(() => {
    consoleErrors = fs.createWriteStream('../testLogs/consoleErrors.txt');
    consoleOutput = fs.createWriteStream('../testLogs/consoleOutput.txt');
    migrationErrors = fs.createWriteStream('../testLogs/migrationErrors.txt');
    migrationOutput = fs.createWriteStream('../testLogs/migrationOutput.txt');
    mochaErrors = fs.createWriteStream('../testLogs/mochaErrors.txt');
    mochaOutput = fs.createWriteStream('../testLogs/mochaOutput.txt');
    spawnConsole();
});