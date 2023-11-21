## A Min Node js app to analyse a CSV file and prepare a report from it

The app applies ETL principles to achieve the task.

## The Scenario

The client periodically generates a large CSV file containing a list of monetary debts, which they manually summarize and turn into a second CSV.

The input CSV _should_ look like this:

```csv
Alex,Beatrice,101.32
Beatrice,Alex,1.20
Carl,Alex,45
Carl,Beatrice,12.50
Alex,Beatrice,19.22
Beatrice,Carl,67.90
Carl,Beatrice,12.80
Carl,Alex,15.88
Beatrice,Carl,71.42
Beatrice,Alex,4.54
Beatrice,Carl,28.76
```

The first line states that Alex owes Beatrice $101.32.

Currently, an intern is manually summarizing this data. If they used the above example, their result would look like this:

```csv
Alex,Beatrice,120.54
Beatrice,Alex,5.74
Beatrice,Carl,168.08
Carl,Alex,60.88
Carl,Beatrice,25.30
```

## Running the scripts and tests

If you have cloned the repository, you will have input file ready.

To execute the script:
`node script.js test-file.csv`

This will write output results to `output.csv` file which is part of the repository files.

To run the tests:

`mocha script.test.js `

I have used mocha as testing library.
