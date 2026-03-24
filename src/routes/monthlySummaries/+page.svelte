<script lang="ts">
    import * as regression from 'regression';
    import Chart from "chart.js/auto";

    export let data;
    let categoryData = data.categoryData ?? [];

    let selectedCategory = "";
    let canvas: HTMLCanvasElement;
    let chartInstance: Chart;

    export async function graphRegression(categoryName: string) {
        const response = await fetch(`/api/monthlySummaries?name=${categoryName}`);
        const transactions = await response.json();

        if (!transactions || transactions.length === 0) {
            console.warn("No data found in database for this category.");
            if (chartInstance) chartInstance.destroy();
            return;
        }

        const formattedData = transactions.map((t: { timestamp: string, amount: number}) => {
            const dateObj = new Date(t.timestamp);
            return {
                x: dateObj.getMonth(),
                y: t.amount
            }
        });

        const regInput = formattedData.map((d: { x: number, y: number})  => [d.x, d.y]);

        const reg = regression.linear(regInput);

        // create the best fit data (two relevant points) -> start and end
        const startX = regInput[0][0];
        const endX = regInput[regInput.length - 1][0];

        const bestFit = [
            // x is time, y is amount
            {x: startX, y: reg.equation[1]},
            {x: endX, y: reg.equation[0] * endX + reg.equation[1]}
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
                            y: t.amount
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

    async function handleCategorySelection() {
        if (selectedCategory) {
            await graphRegression(selectedCategory);
        }   
        
    }

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
        <label for="month" class="rounded-l bg-blue-500 h-7 ml-2">Category</label>
        <select bind:value={selectedCategory} on:change={handleCategorySelection} class="rounded-r bg-blue-500 h-7 mr-2">
            {#each categoryData as c (c.name)}
                <option>{c.name}</option>
            {/each}
        </select>
    </div>

    <!-- Will implement Chart with TS later -->
    <canvas bind:this={canvas}></canvas>

    <!-- Will implement Chart with TS later -->
    <!-- <canvas id="piChart" style="width:100%;max-width:700px"></canvas> -->
</div>

