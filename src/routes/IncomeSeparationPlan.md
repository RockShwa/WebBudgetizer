# Income Separation Plan

So basically I want my income to be able to be seperated into categories, and I want to be able to change the percentage of income that gets categorized

So the categories I want are
1. Savings
2. Spendings for myself (immediate spendings)
3. Savings for others
4. Donation

So I want a view that takes everything categorized as income, and for each transaction amount I want it to be distributed according to the set percentages - DDONE

Inside this manage income button would be a record of all income transactions to date (pulled from transactions with the category income). **It will be viewed by month, year**. To the side of this would be the 4 categories. I should be able to see a running total of the amount I have in my checking and savings account, then underneath checking I should have spendings for myself ONLY. Underneath savings I should have personal savings and savings for others in two seperate categories. Every time income is added, it will add to these amounts. Donation will be linked to each income transaction because it does not compound over time. There will be a check box next to each transactions that I can click to say that I have donated it or not. - DONE (except for month, year)

Now, anytime I categorize a transaction, it should add or subtract to my checking and savings account total. Repayments, transfers (check description to see destination), and income should all add to the checking and savings account. Income and repayments should always go to checking. 

What this will allow me to do is when I spent money on a gift for example, I will categorize it as gift. Then, the savings account will decrease it's amount because savings for others will decrease. I will then every week/month go to replenish my BoA checking account to match this application because there will be fewer savings and more checing but opposite in my actual account because the ppurchase of the gift will be taken out of my checking account. The user can set a "starting" checking/savings account balance if they want to disregard previous transactions.

I should also be able to exclude transactions from this process, so if mom pays me back for an item for insance, all of those transactions, repayments included, should not be included in this analysis.

I also want to be able to enter saving goals, one of which should do a very rough 10% ish estimate I need to save for taxes per year (so would take all income, sum it for April 2025-current and take 10% or so to ensure I save for tax season). Additionally, I should be able to enter specific things I want to save for. These will have a priority and the 1st priority item will have a progress bar, the amount it costs, and a link to the website of the item. When I enter an item, I need to enter a justification of why I would use this item. 

SO in summary:

1. Manage Income page that:
    - Displays all income transactions with donation amount & checkbox - DONE
    - Displays checking and savings account with subcategories - DONE
    - Automatically funnels the appropriate percentages of income to each category when a new income transaction is added - DONE
    - Allows me to change the percentage funneled - DONE
    - Savings and checking accounts are automatically updated through specific transactions - DONE
    - Save income category percetanges to database - DONE
    - Some way to store whether I donated what I needed to from an income transaction - DONE
    - Right click box with donation & long term savings (add to note) - DONE
    - Month and year filters for the income statements - DONE

    - The user can set a "starting" checking/savings account balance if they want to disregard previous transactions (put in settings menu)
    - Settings menu to select what categories get added to which income category - DONE
2. A Saving Goals page
    - Displays & allows the user to enter saving goals

Make sure to test with a new transaction upload

Future features:
1. allow the user to create categories instead of having them harcoded, and they can choose which account it can go under
2. Combine Yearly and Monthly Summaries Page lol
3. Remove income from category list
4. Make tests for all this stuff :sk this aint maintainable