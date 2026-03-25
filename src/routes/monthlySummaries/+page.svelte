<script lang="ts">
    import * as regression from 'regression';
    import Chart from "chart.js/auto";
	import { SvelteSet } from 'svelte/reactivity';
	import { onMount } from 'svelte';

    onMount(() => {
        createYearOptions();
        createMonthOptions();
    });

    export let data: { 
        transactionData: { 
            id: number; 
            timestamp: string; 
            amount: number; 
            category: string; 
            description: string; 
        }[];
        categoryData: {
            name: string; 
            goal: number; 
            defaultGoal: number; 
            categoryTotal: number;
        }[];
    };
    let categoryData = data.categoryData ?? [];
    $: transactionData = data.transactionData ?? [];

    let selectedCategory = "";
    let selectedYear = "";
    let selectedMonth = "";
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

        const formattedData = filteredTransactions.map((t: { timestamp: string, amount: number}) => {
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
            await graphRegression(selectedCategory, selectedYear, selectedYear);
        }   
        
    }

    let pieCanvas: HTMLCanvasElement;
    let pieChartInstance: Chart;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    async function renderPieChart() {
        if (pieChartInstance) pieChartInstance.destroy();

        const chartPoints = categoryData.map(c => {
            const categorySum = transactionData.filter((t: { id: number, timestamp: string, amount: number, category: string, description: string}) => {
                const isCorrectMonth = new Date(t.timestamp).getMonth() === monthNames.indexOf(selectedMonth);
                const isCorrectCateogry = t.category.trim().toLowerCase() === c.name.toLowerCase();
                return isCorrectCateogry && isCorrectMonth;
            })
            .reduce((sum, t) => sum + t.amount, 0);

            return {
                name: c.name,
                amount: categorySum
            };
            }).filter(c => c.amount);

        const total = chartPoints.reduce((sum, c) => sum + c.amount, 0); 

        if (total === 0) return;

        pieChartInstance = new Chart(pieCanvas, {
            type: 'pie',
            data: {
                labels: chartPoints.map(c => c.name),
                datasets: [{
                    data: chartPoints.map(c => c.amount),
                    backgroundColor: [
                        '#3b82f6',
                        '#ef4444',
                        '#10b981',
                        '#f59e0b',
                        '#8b5cf6',
                        '#ec4899'
                    ]
                }]
            }
        })
    }

    $: if (pieCanvas && categoryData.length > 0 && selectedMonth) {
        renderPieChart();
    }

    function createYearOptions() {
        const yearSelect = document.getElementById('year-select');
        const addedYears = new SvelteSet<number>(); // track months added

        for (const t of transactionData) {
            const year = new Date(t.timestamp).getFullYear(); 
            if (!addedYears.has(year)) {
                const opt = document.createElement('option');
                opt.textContent = new Date(t.timestamp).getFullYear().toString();
                selectedYear = opt.textContent;
                yearSelect?.appendChild(opt);
                addedYears.add(year)
            }
        }
    }

    function createMonthOptions() {
        const monthSelect = document.getElementById('month-select');
        const addedMonths = new SvelteSet<number>(); // track months added

        for (const t of transactionData) {
            const month = new Date(t.timestamp).getMonth(); 
            if (!addedMonths.has(month)) {
                const opt = document.createElement('option');
                opt.textContent = new Date(t.timestamp).toLocaleString('default', {month: 'long'});
                selectedMonth = opt.textContent;
                monthSelect?.appendChild(opt);
                addedMonths.add(month)
            }
        }
    }

    // need starting
    // need total for all
    // need slope

        // if we calculate disposable income at a particular month, we should be able
        // to plug that in and get the respective predicted savings at a particular disposable income

        // mps -> 1/1-mpc -> mps = change in savings/change in disposable income 

        // savings at a particular point are going to be income - expenditures

        // so if I can calulcate the data points for savings at a level of income
        // then I can get the slope with a regression
        // and A with a regression

        // so what I need to do is:
        // 1. get transaction data
        // 2. for each month, we make a point
        // 3. each point contains disposable income as x and savings as y (savings is income - expenditures - sum total each month)
        // 4. make a regression
        // 5. take slope values
        // 6. bind selected month to be inputted into savings function

        // x is disposable income
        // 
        // get monthly total income

    let regressionResults: regression.Result;    

    function computeRegression(transactionData: {id: number; 
            timestamp: string; 
            amount: number; 
            category: string; 
            description: string; 
        }[]) {
        const monthGroups: Record<string, { income: number, savings: number }> = {};

        transactionData.forEach(t => {
            const d = new Date(t.timestamp);
            const key = `${d.getMonth()}-${d.getFullYear()}`;

            if (!monthGroups[key]) {
                monthGroups[key] = { income: 0, savings: 0};
            }

            monthGroups[key].savings += t.amount;

            if (t.amount > 0) {
                monthGroups[key].income += t.amount;
            }
        });

        const points: regression.DataPoint[] = Object.values(monthGroups).map(m => 
            [m.income, 
            m.savings]
        );

        return regression.linear(points);
    }  
    
    $: if (transactionData.length > 0) {
        regressionResults = computeRegression(transactionData);
    }
    
    let prediction = 0;

    $: if (regressionResults && selectedMonth && selectedYear) {
        const m = regressionResults.equation[0];
        const a = regressionResults.equation[1];

        const currentIncome = transactionData
            .filter(t => {
                const d = new Date(t.timestamp);
                return d.toLocaleString('default', {month: 'long'}) === selectedMonth &&
                    d.getFullYear().toLocaleString() === selectedYear && t.amount > 0;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        prediction = a + (m * currentIncome); 
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

        <label class="font-bold bg-white rounded-sm m-0.5 p-1">Year
            <select class="select" id="year-select">
            </select>
        </label>
    </div>

    <div class="flex flex-col">
        <canvas bind:this={canvas}></canvas>

        <div id="pi-chart-container" class="w-full h-64 mx-auto flex flex-row">
            <label class="font-bold bg-white rounded-sm m-0.5 p-1">Month
                <select class="select" id="month-select" bind:value={selectedMonth}>
                </select>
            </label>
            <label class="font-bold bg-white rounded-sm m-0.5 p-1">Year
                <select class="select" id="month-select" bind:value={selectedYear}>
                </select>
            </label>
            <canvas bind:this={pieCanvas}></canvas>

            <div class="font-bold">
                <!-- here will be predicted savings -->
                Predicted Savings: ${prediction}
            </div>
        </div>
    </div>
</div>

