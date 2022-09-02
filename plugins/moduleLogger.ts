import { Compiler } from 'webpack';
import fs, { WriteStream } from 'fs';
import deglob, { Options as DeglobOptions } from 'deglob';
import path from 'path';

type PluginOptions = {
    directories: string[],
    output?: string,
}

class ModuleLogger {
    options: PluginOptions;
    outFile: WriteStream;

    constructor(options: PluginOptions) {
        this.options = {
            output: path.resolve(__dirname, '../unused.json'),
            ...options
        };
        this.outFile = fs.createWriteStream(this.options.output);
    }

    apply(compiler: Compiler) {
        compiler.hooks.emit.tapAsync(
            'ModuleLogger',
            (compilation, callback) => {
                // @ts-ignore

                const usedModules = Array.from(compilation.fileDependencies)
                    .filter((file) => this.options.directories.some(dir => file.indexOf(dir) !== -1));

                Promise.all(this.options.directories.map(directory => fileFinder(directory)))
                    .then( files => files.map(array => array.filter(file => !usedModules.includes(file))))
                    .then(fileSaver(this.outFile))
                    .then(() => callback())
                    .catch( e => {
                        callback(e);
                    })
                    .finally( () => {
                        this.outFile.close();
                    });
            }
        );
    }
}

const fileSaver = (fileStream: WriteStream) => (filesByDirectory: string[][]): string[][] => {
    let files: string[] = [];
    filesByDirectory.forEach( curFile => files = files.concat(curFile));
    
    console.log(files)
    if(!files.length) {
      return [];
    }
    filesByDirectory.forEach( curFiles => {
        if (!curFiles.length) return;
        fileStream.write(`[\n`);
        curFiles.forEach((file, ind) => {
            fileStream.write(`   "${path.join(__dirname, file)}"${ind!=curFiles.length-1?',':''}\n`);
        });
        fileStream.write(']');
    });
  
    return filesByDirectory;
  }

const fileFinder = (directory: string):Promise<string[]> => {
    const config: DeglobOptions = { cwd: directory };
    return new Promise((resolve, reject) => {
      deglob(['**/*'], config, (err: Error | null, files: string[]) => 
        err ? reject(err) : resolve(files));
    });
  }

export default ModuleLogger;