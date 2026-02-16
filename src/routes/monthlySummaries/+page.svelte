<head>
    <title>Monthly Summaries</title>
</head>

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
    <canvas id="lineChart" style="width:100%;max-width:700px"></canvas>

    <!-- Will implement Chart with TS later -->
    <canvas id="piChart" style="width:100%;max-width:700px"></canvas>
</div>

