<svelte:options customElement="pie-chart"></svelte:options>

<script lang="ts">
	import { Chart, type TooltipItem } from "chart.js";
	import type { Transaction } from "./classes/Transaction";
	import type { Category } from "./classes/Category";
	import { onDestroy } from "svelte";

    export let selectedMonth: string;
    export let selectedYear: string;
    export let transactionData: Transaction[];
    export let categoryData: Category[];

    let pieCanvas: HTMLCanvasElement;
    let pieChartInstance: Chart;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    async function renderPieChart() {
        if (pieChartInstance) pieChartInstance.destroy();

        const chartPoints = categoryData.map(c => {
            const categorySum = transactionData.filter((t: Transaction) => {
                const isCorrectMonth = selectedMonth && selectedMonth !== "all" ? new Date(t.timestamp).getMonth() === monthNames.indexOf(selectedMonth) : true;
                const isCorrectYear = new Date(t.timestamp).getFullYear().toString() === selectedYear;
                const isCorrectCateogry = t.category.trim().toLowerCase() === c.name.toLowerCase();
                return isCorrectCateogry && isCorrectMonth && isCorrectYear && t.amount < 0;
            })
            .reduce((sum, t) => sum + t.amount, 0);

            return {
                name: c.name,
                amount: Math.abs(categorySum)
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
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context: TooltipItem<'pie'>): string {
                                const value = context.raw as number;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        })
    }

    $: if (pieCanvas && categoryData.length > 0 && selectedMonth && selectedYear) {
        renderPieChart();
    }

    onDestroy(() => {
        pieChartInstance?.destroy();
    });
</script>

<canvas class="h-1/12 w-1/12" bind:this={pieCanvas}></canvas>
