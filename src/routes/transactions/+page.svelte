<script lang="ts">
    import { resolve } from '$app/paths';
    import { parseCSVFile, initializeElements } from './transactions';
    import { onMount } from 'svelte';

    export let data: { transactionData: { id: number; timestamp: string; amount: number; category: string; description: string; }[]};

    onMount(() => {
        initializeElements();
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

    <label class="button">Upload
        <!-- add a thing where it only shows the table if correct month/year is selected -->
        <!-- store table in the database -->
        <!-- in uploads ull need to check for duplicates -->
        <input on:change={handleFileChange} type="file" id="file" class="hidden" />
    </label>


    <label>Month
        <select class="select">
            <option>January</option>
            <option>Feburary</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
        </select>
    </label>

    <!-- generate if u have time with for loop -->
    <label>Year
        <select class="select">
            <option>2026</option>
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
            <option>2021</option>
            <option>2020</option>
            <option>2019</option>
            <option>2018</option>
            <option>2017</option>
            <option>2016</option>
            <option>2015</option>
            <option>2014</option>
            <option>2013</option>
            <option>2012</option>
            <option>2011</option>
            <option>2010</option>
            <option>2009</option>
            <option>2008</option>
            <option>2007</option>
            <option>2006</option>
            <option>2005</option>
            <option>2004</option>
            <option>2003</option>
            <option>2002</option>
            <option>2001</option>
            <option>2000</option>
            <option>1999</option>
            <option>1998</option>
            <option>1997</option>
            <option>1996</option>
            <option>1995</option>
            <option>1994</option>
            <option>1993</option>
            <option>1992</option>
            <option>1991</option>
            <option>1990</option>
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
            <td class="border border-gray-300 p-1">${t.amount.toFixed(2)}</td>
            <td class="border border-gray-300 p-1">{t.category}</td>
            <td class="border border-gray-300 p-1">{t.description}</td>
        </tr>
        {/each}
    </tbody>
</table>
</div>