import { browser } from '$app/environment';

const delimeter  = ','; // what seperates csv data
const newline ='\n';

let table: HTMLTableElement;

export function initializeElements() {
    if (browser) {
        table = document.getElementById('table') as HTMLTableElement;
    }
}

// File Reader commonly used API
export function parseCSVFile(file: File) {
    if (!file || !FileReader) {
        throw new Error('File or File Reader not found')
    }

    const reader = new FileReader();

    reader.onload = function () {
        if (typeof reader.result == 'string') {
            toTable(reader.result);
        }
    };

    reader.readAsText(file); // parse file and return as a long string of text
}

    // takes readAsText file
    function toTable(text: string) {
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

            rtr = document.createElement('tr');

            cols.forEach(function (c) {
                const td = document.createElement('td');
                const tc = c.trim();

                td.textContent = tc;
                rtr.appendChild(td);
            });

            table.appendChild(rtr);
        });
          
    }