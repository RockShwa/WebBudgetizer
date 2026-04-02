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
        const response = await fetch(`/api/monthlySummaries?name=${categoryName}`);
        const transactions = await response.json();

        if (!transactions || transactions.length === 0) {
            if (chartInstance) chartInstance.destroy();
            return;
        }

        const filteredTransactions = transactions.filter((t: { timestamp: string, amount: number}) => {
            const year = new Date(t.timestamp).getFullYear();
            return year >= parseFloat(startYear) && year <= parseFloat(endYear);
        })

        const regInput: [number, number][] = filteredTransactions.map((t: { timestamp: string, amount: number }) => [
            new Date(t.timestamp).getMonth(),
            Math.abs(t.amount)
        ]);

        

        regInput.sort((a, b) => a[0] - b[0]);
        
        const reg = regression.linear(regInput);

        const bestFit = [
            // x is time, y is amount
            { x: 0, y: reg.predict(0)[1] },
            { x: 11, y: reg.predict(11)[1] }
        ];

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(canvas, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: "Category Transactions",
                        data: transactions.map((t: { timestamp: string, amount: number}) => ({
                            x: new Date(t.timestamp).getMonth(),
                            y: Math.abs(t.amount)
                        })),
                        backgroundColor: 'blue'
                    },
                    {
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