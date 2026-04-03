<svelte:options customElement="regression-chart"></svelte:options>

<script lang="ts">
    import { Category } from "./classes/Category";
	import { Chart, registerables } from "chart.js";
    import * as regression from 'regression';

    export let selectedMonth: string;
    export let selectedYear: string;
    export let selectedCategory: string;
    export let categoryData: Category[];

    Chart.register(...registerables);

    let canvas: HTMLCanvasElement;
    let chartInstance: Chart;

    export async function graphRegression(categoryName: string, startYear: string, endYear: string) {
        // fetch transactions of chosen category
        const response = await fetch(`/api/monthlySummaries?name=${categoryName}`);
        const transactions = await response.json();

        // if transactions don't exist or are empty, exit method and destroy chart instance
        if (!transactions || transactions.length === 0) {
            if (chartInstance) chartInstance.destroy();
            return;
        }

        // filter transactions to include only those between start year and end year
        const filteredTransactions = transactions.filter((t: { timestamp: string, amount: number}) => {
            const year = new Date(t.timestamp).getFullYear();
            return year >= parseFloat(startYear) && year <= parseFloat(endYear);
        })

        // format transactions into a DataPoint[] to be passed into the regression
        // x value is the date
        // y value is the transaction amount
        const regInput: [number, number][] = filteredTransactions.map((t: { timestamp: string, amount: number }) => [
            new Date(t.timestamp).getMonth(),
            Math.abs(t.amount)
        ]);

        // sort regression input such that:
        // if the date of transaction a is greater than b, they stay in order
        // if the date of transaction a is less than b, they flip
        // this ensures that the data points are in order (a requirement of the regression api)
        regInput.sort((a, b) => a[0] - b[0]);
        
        // regression
        const reg = regression.linear(regInput);

        const bestFit = [
            // x is time, y is amount (0-11 because always graphing at least the months)
            { x: 0, y: reg.predict(0)[1] },
            { x: 11, y: reg.predict(11)[1] }
        ];

        // create a new chart with all of the above data
        chartInstance = new Chart(canvas, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        // scatter plot
                        label: "Category Transactions",
                        data: transactions.map((t: { timestamp: string, amount: number}) => ({
                            x: new Date(t.timestamp).getMonth(),
                            y: Math.abs(t.amount)
                        })),
                        backgroundColor: 'blue'
                    },
                    {
                        // line of best fit
                        label: "Line of Best Fit",
                        data: bestFit,
                        type: "line",
                        borderColor: "red"
                    }
                ]
            }
        });
    }

    $: if (canvas && categoryData.length > 0 && selectedMonth && selectedYear && selectedCategory) {
        graphRegression(selectedCategory, selectedYear, selectedYear);
    }
</script>

<canvas bind:this={canvas}></canvas>