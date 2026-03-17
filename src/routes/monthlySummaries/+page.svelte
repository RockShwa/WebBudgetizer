<script lang="ts">
    import * as regression from 'regression';
    // import { onMount } from "svelte";
    // import Chart from "chart.js/auto";
    //import { queryDatabase } from '$lib/server/db';

    const data: regression.DataPoint[] = [[0, 1], [2,3]];
    let canvas: HTMLCanvasElement;

    export function calculateRegression() {
        const result = regression.linear(data);
        // [0] is slope, [1] is y-int
        return result;
    }

    // export async function graphRegression() {
    //     // query database for the array of timestamps for each transaction
    //     const timestamp: number[] = await queryDatabase("SELECT timestamp FROM Transactions");

    //     // create the best fit data (two relevant points)
    //     const bestFit: regression.DataPoint[] = [
    //         // x is time, y is amount
    //         [timestamp[0], calculateRegression().equation[1] ],
    //         [timestamp[1], calculateRegression().equation[0] * timestamp[1] + calculateRegression().equation[1] ]
    //     ];

    //     // onMount is what is used to ensure that the Chart is created before it tries to do anything with it
    //     onMount(() => {
    //         new Chart(canvas, {
    //             // chart is a scatter plot
    //             type: 'scatter',
    //             data: {
    //                 datasets: [
    //                     {
    //                         // first data set will be the scatter plot
    //                         label: "Category Tracking",
    //                         data: data,
    //                         backgroundColor: "blue"
    //                     },
    //                     {
    //                         // second data set is the line of best fit
    //                         label: "Line of Best Fit",
    //                         data: bestFit,
    //                         type: "line",
    //                         borderColor: "red"
    //                     }
    //                 ]
    //             }
    //         });
    //     });    
    // }

    export function caluclateSavingPrediction(a: number, income: number, m: number) {

        // m is slope of the line of best fit with data of change in income over change in savings
        // income is disposable income
        // a is the amount you would save with no income

        const A = a;
        const d_y = income;
        const mps = m;

        // the linear equation - returns the amount saved at a particular amount of disposable income
        return A + mps * d_y;
    }
</script>

<svelte:head>
    <title>Monthly Summaries</title>
</svelte:head>

<div class="flex flex-col">
    <div class="flex flex-row items-center">
        <h1 class="text-3xl p-3 font-bold">
            Monthly Summaries
        </h1>
        <div class="w-280 h-2 rounded-2xl bg-blue-500 mt-2"></div>
        <button class="w-20 shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-1 ml-4">Back</button>
    </div>

    <div class="flex flex-row items-center">

        <label for="month" class="rounded-l bg-blue-500 h-7 ml-2">Month</label>
        <select id="month" class="rounded-r bg-blue-500 h-7 mr-2"></select>

        <label for="year" class="rounded-l bg-blue-500 h-7 ml-2">Year</label>
        <select id="year" class=" rounded-r bg-blue-500 h-7 mr-2"></select>
    </div>

    <!-- Will implement Chart with TS later -->
    <canvas bind:this={canvas}></canvas>

    <!-- Will implement Chart with TS later -->
    <canvas id="piChart" style="width:100%;max-width:700px"></canvas>
</div>

