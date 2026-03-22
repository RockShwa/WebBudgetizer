<script lang="ts">
    import { resolve } from '$app/paths';
	import { SvelteSet } from 'svelte/reactivity';
    import { parseCSVFile, initializeElements } from './transactions';
    import { onMount } from 'svelte';

    export let data: { transactionData: { id: number; timestamp: string; amount: number; category: string; description: string; }[]};

    onMount(() => {
        initializeElements();
        createMonthOptions();
        createYearOptions();
    });

    // registers the onchange event
    // gets file input pased on event
    // does input.files exist (files selected) and ensures at least one file was picked
    // passes first file to generate a table
    export function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            parseCSVFile(input.files[0]);
        }
    }

    export function navigateBack() {
        history.go(-1);
    }

    // get transactionTimes from sql query
    export function sortTime(transactionTimes: Date[]) {
        // create the 3 beginning arrays
        let mid;
        let left: Date[];
        let right: Date[];

        // as long as the array is greater than 1 unit long
        if (transactionTimes.length > 1) {
            // recursively slice the arrays in half
            mid = transactionTimes.length;
            left = transactionTimes.slice(0, mid);
            right = transactionTimes.slice(mid, transactionTimes.length - 1);

            // sort those sliced arrays
            sortTime(left);
            sortTime(right);

            // create indicies
            let i: number = 0;
            let j: number = 0;
            let k: number = 0;

            // as long as the indicies are less than right and left's length, 
            // we're going to set the originial array equal to the left if it's
            // less than the right, and vice versa

            while (i < left.length && j < right.length) {
                if (left[i] < right[j]) {
                    transactionTimes[k] = left[i];
                    i++;
                } else {
                    transactionTimes[k] = right[j]
                    j++;
                } 
                k++;
            }

            // merge the remaining left and right arrays

            while (i < left.length) {
                transactionTimes[k] = left[i];
                i++;
                k++;
            }

            while (j < right.length) {
                transactionTimes[k] = right[j];
                j++;
                k++;
            }
        }
    }

    export function sortAmount(transactionAmounts: Date[]) {
        let mid;
        let left: Date[];
        let right: Date[];

        if (transactionAmounts.length > 1) {
            mid = (transactionAmounts.length / 2.0);
            left = transactionAmounts.slice(0, mid);
            right = transactionAmounts.slice(mid);

            sortAmount(left);
            sortAmount(right);

            let i: number = 0;
            let j: number = 0;
            let k: number = 0;

            while (i < left.length && j < right.length) {
                if (left[i] < right[j]) {
                    transactionAmounts[k] = left[i];
                    i++;
                } else {
                    transactionAmounts[k] = right[j]
                    j++;
                } 
                k++;
            }

            while (i < left.length) {
                transactionAmounts[k] = left[i];
                i++;
                k++;
            }

            while (j < right.length) {
                transactionAmounts[k] = right[j];
                j++;
                k++;
            }
        }
    }

    let transactionData = data.transactionData ?? [];

    let dateObjects: Date[] = transactionData.map(t => new Date(t.timestamp));

    let file: File | undefined;

    async function uploadFile(e: Event) {
        const input = e.target as HTMLInputElement;
        file = input.files?.[0];

        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        
        await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        location.reload();
    }

    function createMonthOptions() {
        const monthSelect = document.getElementById('month-select');
        const addedMonths = new SvelteSet<number>(); // track months added

        for (const t of transactionData) {
            const month = new Date(t.timestamp).getMonth(); 
            if (!addedMonths.has(month)) {
                const opt = document.createElement('option');
                opt.textContent = new Date(t.timestamp).toLocaleString('default', {month: 'long'});
                monthSelect?.appendChild(opt);
                addedMonths.add(month)
            }
        }
    }

    function createYearOptions() {
        const yearSelect = document.getElementById('year-select');
        const addedYears = new SvelteSet<number>(); // track months added

        for (const t of transactionData) {
            const year = new Date(t.timestamp).getFullYear(); 
            if (!addedYears.has(year)) {
                const opt = document.createElement('option');
                opt.textContent = new Date(t.timestamp).getFullYear().toString();
                yearSelect?.appendChild(opt);
                addedYears.add(year)
            }
        }
    }

</script>

<svelte:head>
    <title>Transactions</title>
</svelte:head>


<div class="flex my-2 justify-items-normal">
    <a href={resolve("/manageCategories")} class="bg-blue-600 p-1 rounded-sm">Manage Categories</a>
    <a href={resolve("/manageGoals")} class="bg-blue-600 p-1 rounded-sm">Manage Goals</a>   
    
    <!-- the sort button that sorts depending on the option with the array of transactions in the database-->
    <label class="select">Sort
        <select class="select">
            <option on:click={() => sortTime(dateObjects)}>Timestamp</option>
            <option on:click={() => sortAmount(dateObjects)}>Amount</option>
        </select>
    </label>

    <input on:change={uploadFile} type="file" id="file" />
    <!-- <button on:click={uploadFile}>Upload
        add a thing where it only shows the table if correct month/year is selected -->
        <!-- store table in the database -->
        <!-- in uploads ull need to check for duplicates -->
    <!-- </button> --> 


    <label>Month
        <select class="select" id="month-select"></select>
    </label>

    <!-- generate if u have time with for loop -->
    <label>Year
        <select class="select" id="year-select">
        </select>
    </label>


    <a href={resolve("/")} class="button">Back</a>   

    <table class="border-collapse border border-gray-300">
    <thead>
        <tr>
            <th class="border border-gray-300 p-1">ID</th>
            <th class="border border-gray-300 p-1">Timestamp</th>
            <th class="border border-gray-300 p-1">Amount</th>
            <th class="border border-gray-300 p-1">Category</th>
            <th class="border border-gray-300 p-1">Description</th>
        </tr>
    </thead>
    <tbody>
        {#each transactionData as t (t.id)}
        <tr>
            <td class="border border-gray-300 p-1">{t.id}</td>
            <td class="border border-gray-300 p-1">{new Date(t.timestamp).toLocaleString()}</td>
            <td class="border border-gray-300 p-1">${t.amount}</td>
            <td class="border border-gray-300 p-1">{t.category}</td>
            <td class="border border-gray-300 p-1">{t.description}</td>
        </tr>
        {/each}
    </tbody>
</table>
</div>