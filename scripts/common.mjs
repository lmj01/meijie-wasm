import { exec } from 'child_process';

/**
 * 
 * @param {string} cmd 
 */
export async function execAsync(cmd) {
    console.log(`> ${cmd}`)
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                const pos = err.message.indexOf('Permission denied (publickey)');
                if (pos > 0) {
                    resolve(1);
                    return;
                }
                console.log(err);
                reject(err)
                process.exit(1)
            }            
            console.log("stdout: \n", stdout);
            resolve(stdout);
        })
    })
}