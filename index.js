#!/usr/bin/env node

import process from 'process';
import fetch from 'node-fetch' ;
import open from 'open';
import arg from 'arg';
import inquirer from 'inquirer';

const args = () => {
    const args = arg(
        {
            '--website': Boolean,
            '--yes'    : Boolean,
            '-w'       : '--website',
            '-y'       : '--yes'
        },
        {
            argv: process.argv.slice(2)
        }
    );

    return {
        website: args['--website'] || false,
    }
}

const ask = async(options) => {
    const quotions = [];
    const { website } = options;

    if ( ! website ) {
        quotions.push({
            type: 'confirm',
            name: 'website',
            message: 'Do you want to open the website on your browser?',
            default: false
        });
    }

    const answers = await inquirer.prompt( quotions );
    return {
        ...options,
        website: options.website || answers.website
    }
}

const launch = async(result) => {
    let options = args();
        options = await ask(options)
        if (options.website) {
            open(`https://${result.domain}`);
        }
}

const website = process.argv[2]; 

const hawk = async( name ) => {

    const response = await fetch(`https://isitup.org/${name}.json`);
    const info = response.status === 400 ? {
        response_code: 400,
        message: 'invalid url'
    } : response.json();

    const { response_code } = await info;

    switch (response_code) {
        case 400:
            console.log('\x1b[31m%s\x1b[0m', 'invalid url');
            break;
        case 200:
            console.log('\x1b[32m%s\x1b[0m', 'website is up and running');
            launch(info);
            break;
        case 301:
            console.log('\x1b[32m%s\x1b[0m', 'website has been moved permanently but is up');
            launch(info);
            console.log('\x1b[34m%s\x1b[0m', 'website has been moved permanently but is up');
            launch(info);
            break;
        case 302:
            console.log('\x1b[34m%s\x1b[0m', 'temporary redirect, website is up');
            launch(info);
            break;
        case 403:
            console.log('\x1b[33m%s\x1b[0m', 'information not found');
            launch(info);
            break;
        default:
            console.log('\x1b[31m%s\x1b[0m', 'website is down')
            break;
    }
    
}

hawk(website);