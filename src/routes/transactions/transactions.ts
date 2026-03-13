import { browser } from '$app/environment';

const delimeter  = ','; // what seperates csv data
const newline ='\n';

let table: HTMLTableElement;

export function initializeElements() {
    if (browser) {
        table = document.getElementById('table') as HTMLTableElement;
    }
}

// File Reader used to get the file input from the user
export function parseCSVFile(file: File) {
    // ensure a file is actually found before we try and operate on it
    if (!file || !FileReader) {
        throw new Error('File or File Reader not found')
    }

    // get the file
    const reader = new FileReader();

    // create a table of the resulting file
    reader.onload = function () {
        if (typeof reader.result == 'string') {
            toTable(reader.result);
        }
    };

    // parse file and return as a long string of text
    reader.readAsText(file);
}

// takes readAsText file
function toTable(text: string) {
    // make sure a table has been created
    if (!text || !table) {
        throw new Error('Something went wrong, sorry.');
    }

    // clear table
    while (table.lastElementChild) {
        table.removeChild(table.lastElementChild);
    }

    const rows = text.split(newline);
    // shift pops pops off first value
    const headers = rows.shift()?.trim().split(delimeter);
    // header row
    const htr = document.createElement('tr');

    // add headers to row
    headers?.forEach(function (h) {
        // header cell
        const th = document.createElement('th');
        const ht = h.trim(); // account for whitespace

        if (!ht) {
            return;
        }

        th.textContent = ht;
        htr.appendChild(th);
    })

    table.appendChild(htr); // append header row to child

    let rtr: HTMLElement;

    // each row still a string we need to seperate
    rows.forEach(function (r) {
        r = r.trim();

        // exclude empty rows
        if (!r) {
            return;
        }

        const cols = r.split(delimeter);

        if (cols.length === 0) {
            return;
        }

        // create html elements
        rtr = document.createElement('tr');

        // create html columns
        cols.forEach(function (c) {
            const td = document.createElement('td');
            const tc = c.trim();

            td.textContent = tc;
            rtr.appendChild(td);
        });

        // append all this data to the actual table
        table.appendChild(rtr);
    });
        
}