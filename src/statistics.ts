import * as math from "mathjs";

export interface OLSResult
{
    params: math.Matrix | number;
    residuals: math.Matrix;
    tstat: math.MathType;
    aic: number;
}

export interface AdfullerCriticalValues
{
    "1%": number;
    "2.5%": number;
    "5%": number;
    "10%": number;
}

export interface AdfullerResult
{
    lagUsed: number;
    criticalValues: AdfullerCriticalValues;
    result: OLSResult;
}

export function ols_akaikeInformationCriterion(residuals: math.Matrix, numberOfParams: number)
{
    const residualsArray = residuals.toArray();
    const n = residualsArray.length;
    const k = numberOfParams;
    let rss: math.MathType = 0;
    for(const residual of residualsArray)
        rss = math.add(rss, math.pow(residual, 2));

    return math.add(math.log(math.divide(rss, n) as unknown as number), math.divide(math.multiply(2, k+1), n));
}

export function ols_estimatedVariance(residuals: math.Matrix, numberOfParams: number)
{
    let n = residuals.size()[0];
    let sumOfSquaredErrors = 0;
    residuals.forEach(value => sumOfSquaredErrors += value ** 2);
    return math.divide(sumOfSquaredErrors, math.subtract(n, numberOfParams));
}

export function ols_standardErrorsOfParameters(residuals: math.Matrix, XtXInv: math.Matrix, numberOfParams: number)
{
    const sigmaSquared = ols_estimatedVariance(residuals, numberOfParams);
    const standardErrors = new Array<math.MathType>();
    for(let i = 0; i < numberOfParams; ++i)
    {
        let scalar: number;
        if(math.isMatrix(XtXInv))
            scalar = XtXInv.get([i, i]);
        else
            scalar = XtXInv;

        const sigmaTimesXtXInv = math.multiply(sigmaSquared, scalar);
        standardErrors.push(math.sqrt(sigmaTimesXtXInv));
    }

    return standardErrors;
}

export function OLS(y: number[], x: number[] | number[][], addConstant = false)
{
    let Y = math.matrix(y);
    let X = addConstant ? math.matrix(x.map((value) => Array.isArray(value) ? [1, ...value] : [1, value])) : math.matrix(x);
    let Xt = math.transpose(X);

    let XtXInv = math.inv(math.multiply(Xt, X));
    //const hat = math.multiply(math.multiply(X, XtXInv), Xt);
    let b = math.multiply(math.multiply(XtXInv, Xt), Y);
    const predictedY = math.multiply(X, b);
    const residuals = math.subtract(Y, predictedY);

    let numberOfParams: number;
    let slope: number;
    if(math.isMatrix(b))
    {
        numberOfParams = b.size()[0];
        slope = b.get([1]);
    }
    else
    {
        numberOfParams = 1;
        slope = b;
    }

    const standardErrorsOfParams = ols_standardErrorsOfParameters(residuals, XtXInv, numberOfParams);

    let slopeStandardError: math.MathType;
    if(numberOfParams === 1)
        slopeStandardError = standardErrorsOfParams[0];
    else
        slopeStandardError = standardErrorsOfParams[1];

    const tstat = math.divide(slope, slopeStandardError);
    const aic = ols_akaikeInformationCriterion(residuals, numberOfParams);

    return <OLSResult> {
        params: b,
        residuals,
        tstat,
        aic: aic,
    };
}

export function getDickeyFullerCriticalValues(numberOfObservations: number, model: "no_constant_no_trend" | "constant_no_trend" | "constant_trend")
{
    if(model === "no_constant_no_trend")
    {
        let criticalValues = { "1%": -2.661, "2.5%": -2.273, "5%": -1.995, "10%": -1.609 };
        if(numberOfObservations > 25)
            criticalValues = { "1%": -2.612, "2.5%": -2.246, "5%": -1.947, "10%": -1.612 };
        if(numberOfObservations > 50)
            criticalValues = { "1%": -2.588, "2.5%": -2.234, "5%": -1.944, "10%": -1.614 };
        if(numberOfObservations > 100)
            criticalValues = { "1%": -2.575, "2.5%": -2.227, "5%": -1.942, "10%": -1.616 };
        if(numberOfObservations > 250)
            criticalValues = { "1%": -2.570, "2.5%": -2.224, "5%": -1.942, "10%": -1.616 };
        if(numberOfObservations > 500)
            criticalValues = { "1%": -2.567, "2.5%": -2.223, "5%": -1.941, "10%": -1.616 };

        return criticalValues;
    }
    else if(model === "constant_no_trend")
    {
        let criticalValues = { "1%": -3.724, "2.5%": -3.318, "5%": -2.986, "10%": -2.633 };
        if(numberOfObservations > 25)
            criticalValues = { "1%": -3.568, "2.5%": -3.213, "5%": -2.921, "10%": -2.599 };
        if(numberOfObservations > 50)
            criticalValues = { "1%": -3.498, "2.5%": -3.164, "5%": -2.891, "10%": -2.582 };
        if(numberOfObservations > 100)
            criticalValues = { "1%": -3.457, "2.5%": -3.136, "5%": -2.873, "10%": -2.573 };
        if(numberOfObservations > 250)
            criticalValues = { "1%": -3.443, "2.5%": -3.127, "5%": -2.867, "10%": -2.570 };
        if(numberOfObservations > 500)
            criticalValues = { "1%": -3.434, "2.5%": -3.120, "5%": -2.863, "10%": -2.568 };

        return criticalValues;
    }
    else // if(model === "constant_trend")
    {
        let criticalValues = { "1%": -4.375, "2.5%": -3.943, "5%": -3.589, "10%": -3.238 };
        if(numberOfObservations > 25)
            criticalValues = { "1%": -4.152, "2.5%": -3.791, "5%": -3.495, "10%": -3.181 };
        if(numberOfObservations > 50)
            criticalValues = { "1%": -4.052, "2.5%": -3.722, "5%": -3.452, "10%": -3.153 };
        if(numberOfObservations > 100)
            criticalValues = { "1%": -3.995, "2.5%": -3.683, "5%": -3.427, "10%": -3.137 };
        if(numberOfObservations > 250)
            criticalValues = { "1%": -3.977, "2.5%": -3.670, "5%": -3.419, "10%": -3.132 };
        if(numberOfObservations > 500)
            criticalValues = { "1%": -3.963, "2.5%": -3.660, "5%": -3.413, "10%": -3.128 };

        return criticalValues;
    }
}

/**
 * Perform an augmented dickey fuller test. The best test result will be chosen by their akaike information criterium.
 * @param y time series to test
 * @param maxlag maximum lag to test. If not defined, it will be calculated
 * @param model test model (if not set default to "constant_no_trend")
 */
export function adfuller(y: number[], maxlag?: number, model: "no_constant_no_trend" | "constant_no_trend" | "constant_trend" = "constant_no_trend")
{
    if(!maxlag)
        maxlag = Math.round(12 * (y.length / 100) ** 0.25);

    let deltaYArray = new Array<number>();

    for(let i = 1; i < y.length; ++i)
    {
        const currentY = y[i];
        const lastY = y[i-1];
        deltaYArray.push(currentY-lastY);
    }

    const maxLag = Math.min(deltaYArray.length-1, maxlag);
    if(maxLag < 0)
        throw new Error("too few datapoints for testing");

    let results = new Array<[number, OLSResult]>();
    for(let lag = 0; lag <= maxLag; ++lag)
    {
        let XArray = new Array<number[]>();
        for(let i = lag; i < deltaYArray.length; ++i)
        {
            XArray.push([]);
            if(model === "constant_no_trend" || model === "constant_trend")
                XArray[XArray.length-1].push(1);

            XArray[XArray.length-1].push(y[i]);
            
            if(model === "constant_trend")
                XArray[XArray.length-1].push(i);

            for(let j = i-lag; j < i; ++j)
                XArray[XArray.length-1].push(deltaYArray[j]);
        }

        const YArray = deltaYArray.slice(deltaYArray.length-XArray.length);

        results.push([lag, OLS(YArray, XArray)]);
    }

    let bestResult = results[0];
    for(const result of results)
        if(result[1].aic < bestResult[1].aic)
            bestResult = result;

    return <AdfullerResult> {
        lagUsed: bestResult[0],
        criticalValues: getDickeyFullerCriticalValues(y.length, model),
        result: bestResult[1],
    };
}

/**
 * https://mathtopics.wordpress.com/2013/01/10/half-life-of-the-ar1-process/
 */
export function ar_halfLife(x: number[])
{
    let y = [...x]
    let lagY = [...x];
    y.shift();
    lagY.pop();

    const resgressionResult = OLS(y, lagY, true);
    const slope = typeof resgressionResult.params === "number" ?
        resgressionResult.params :
        resgressionResult.params.toArray().map(value => +(value.valueOf() as string))[1];

    return math.divide(math.log(0.5), math.log(math.abs(slope)));
}

export function zScore(x: number[])
{
    return math.divide(math.subtract(x[x.length-1], math.mean(x)), math.std(x));
}

export function rollingZScore(x: number[], length: number)
{
    let zScores = new Array<math.MathType>();

    for(let i = 0; i < length-1; ++i)
        zScores.push(0);

    for(let i = length; i < x.length; ++i)
    {
        const part = x.slice(i-length, i);
        zScores.push(zScore(part));
    }

    return zScores;
}

/*
export function standardError(x: number[])
{
    return math.divide(math.std(x, "uncorrected"), math.sqrt(x.length));
}

export function ols_cookDistance(internallyStudentizedResiduals: number[], numberOfParams: number, hat: math.Matrix)
{
    return internallyStudentizedResiduals.map((value, index) => {
        const leverage = hat.get([index, index]);
        return math.divide(math.multiply(math.multiply(1, math.pow(value, 2)), leverage), math.multiply(numberOfParams, math.subtract(1, leverage)));
    });
}

export function ols_studentizedResiduals(errors: number[], b: math.Matrix, hat: math.Matrix)
{
    const sigma = ols_estimatedStandardDeviation(errors, b.size()[0]);
    const studentizedResiduals = errors.map((value, index) => {
        const leverage = hat.get([index, index]);
        return math.divide(value, math.multiply(sigma, math.sqrt(math.subtract(1, leverage))));
    });

    return studentizedResiduals;
}
*/