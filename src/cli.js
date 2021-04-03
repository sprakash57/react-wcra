import arg from 'arg';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { helpMsg, TEMPLATES, wrongTemplateMsg } from './libs.js';
import { createProject } from './main.js';

let alertWrongTemplate = false;

const parseArgs = (inputArgs) => {
    const args = arg(
        {
            "--git": Boolean,
            "-g": "--git",
            "--help": Boolean,
            "-h": "--help",
            "--version": Boolean,
            "-v": "--version",
            "--default": Boolean,
            "-d": "--default"
        },
        {
            argv: inputArgs.slice(2)
        }
    );
    return {
        directory: args._[0],
        template: args._[1] || TEMPLATES['js'],
        git: args["--git"] || false,
        help: args["--help"] || false,
        version: args["--version"] || false,
        skip: args["--default"] || false
    }
};

const alertMissingOptions = async (options) => {
    const queries = [];

    if (!options.directory) {
        queries.push({
            type: "input",
            name: "directory",
            message: "Please provide a project name",
            validate: function (input) {
                const done = this.async();
                if (!input) {
                    done("Project name is required. Use (.) operator if you want starter files the current directory");
                    return;
                }
                done(null, true);
            }
        })
    }

    if (options.skip) {
        return {
            ...options,
            template: options.template || TEMPLATES['js']
        }
    }

    if (!options.template) {
        queries.push({
            type: "list",
            name: "template",
            message: "Please choose a template to use: ",
            choices: ["JavaScript", "TypeScript"],
            default: TEMPLATES['js']
        })
    }

    if (!options.git) {
        queries.push({
            type: "confirm",
            name: "git",
            message: "Initialize a git repository?",
            default: false
        })
    }

    const answers = await inquirer.prompt(queries);

    let inputTemplate = TEMPLATES['js'];
    if (TEMPLATES[answers.template]) inputTemplate = TEMPLATES[answers.template];
    else alertWrongTemplate = true;

    return {
        ...options,
        directory: options.directory || answers.directory,
        template: inputTemplate || answers.template,
        git: options.git || answers.git
    };
}

export const cli = async (args) => {
    let options = parseArgs(args);
    console.log(options);
    if (options.help) {
        console.log(helpMsg);
    } else if (options.version) {
        let packageJson = path.resolve(path.dirname(__filename), '../package.json');
        packageJson = JSON.parse(fs.readFileSync(packageJson));
        console.log(`Installed create-react-saga CLI version is v${packageJson.version}`);
    } else {
        options = await alertMissingOptions(options);
        if (alertWrongTemplate) console.log(wrongTemplateMsg);
        console.log('options--->', options);
        // await createProject(options);
    }
}